import { Request, Response } from 'express';
import { db } from '../config/firebase';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';

export const startQuiz = async (req: Request, res: Response) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not initialized' });
        }

        // 1. Fetch questions from Firestore
        const questionsSnapshot = await db.collection('questions').get();

        if (questionsSnapshot.empty) {
            return res.status(500).json({ error: 'No questions available in the database.' });
        }

        const allQuestions: any[] = [];
        questionsSnapshot.forEach((doc) => {
            allQuestions.push({ id: doc.id, ...doc.data() });
        });

        // 2. Randomly select 20 questions
        // Shuffle using Fisher-Yates algorithm
        for (let i = allQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
        }

        // Pick the first 20, or however many exist if less than 20
        const selectedQuestions = allQuestions.slice(0, Math.min(20, allQuestions.length));

        // 3. Remove correctAnswer and difficulty before sending to frontend
        // Also store the original IDs for the session
        const questionIds: string[] = [];
        const sanitizedQuestions = selectedQuestions.map((q) => {
            questionIds.push(q.id);

            const { correctAnswer, difficulty, ...safeQuestion } = q;
            return safeQuestion;
        });

        // 4. Generate unique quizSessionId
        const quizSessionId = uuidv4();

        // 5. Store session in quizSessions collection
        const sessionData = {
            quizSessionId,
            questionIds,
            startTime: admin.firestore.Timestamp.now(), // Use server timestamp
            used: false
        };

        await db.collection('quizSessions').doc(quizSessionId).set(sessionData);

        // 6. Return response
        return res.status(200).json({
            quizSessionId,
            questions: sanitizedQuestions
        });

    } catch (error) {
        console.error('Error starting quiz:', error);
        return res.status(500).json({ error: 'Internal server error while starting quiz' });
    }
};

export const submitTest = async (req: Request, res: Response) => {
    try {
        if (!db) {
            return res.status(500).json({ error: 'Database not initialized' });
        }

        const { quizSessionId, answers, timeTaken, challengeId, userName } = req.body;

        // Strict validation
        if (!quizSessionId || !answers || !Array.isArray(answers) || typeof timeTaken !== 'number' || !userName) {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        // Validate userName sanitization
        const sanitizedUserName = userName.replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 50);

        // Fetch session
        const sessionRef = db.collection('quizSessions').doc(quizSessionId);
        const sessionDoc = await sessionRef.get();

        if (!sessionDoc.exists) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const sessionData = sessionDoc.data();
        if (sessionData?.used) {
            return res.status(403).json({ error: 'Session already used' });
        }

        // Check expiration (max 15 mins = 900 seconds)
        const startTime = sessionData?.startTime;
        if (startTime) {
            const now = admin.firestore.Timestamp.now().toMillis();
            const startMillis = startTime.toMillis();
            if (now - startMillis > 15 * 60 * 1000 + 60000) { // added 1 min grace
                return res.status(400).json({ error: 'Session expired' });
            }
        }

        // Validate answers length (cannot submit MORE answers than questions in the session)
        const sessionQuestionIds: string[] = sessionData?.questionIds || [];
        if (answers.length > sessionQuestionIds.length) {
            return res.status(400).json({ error: 'Invalid answers length' });
        }

        // Validate questionIds match (no foreign question IDs allowed)
        const providedQuestionIds = answers.map((a: any) => a.questionId);
        const hasForeignQuestions = providedQuestionIds.some((id: string) => !sessionQuestionIds.includes(id));
        if (hasForeignQuestions) {
            return res.status(400).json({ error: 'Question IDs mismatch' });
        }

        // Validate timeTaken (min 2 sec to 1500 sec limit)
        const minTime = 2;
        const maxTime = 1500;
        if (timeTaken < minTime || timeTaken > maxTime) {
            return res.status(400).json({ error: 'Invalid timeTaken' });
        }

        // Mark session used
        await sessionRef.update({ used: true });

        // Fetch correct answers (max 20 questions in session limit, so 'in' query works up to 30)
        let questionsSnapshot;
        if (sessionQuestionIds.length > 0) {
            questionsSnapshot = await db.collection('questions').where(admin.firestore.FieldPath.documentId(), 'in', sessionQuestionIds).get();
        } else {
            return res.status(400).json({ error: 'No questions in session' });
        }

        const questionsMap: Record<string, any> = {};
        questionsSnapshot.forEach(doc => {
            questionsMap[doc.id] = doc.data();
        });

        // Score calculation
        let correctCount = 0;
        let difficultySum = 0;

        answers.forEach((ans: any) => {
            const q = questionsMap[ans.questionId];
            if (q && q.correctAnswer === ans.selected) {
                correctCount++;
                difficultySum += Number(q.difficulty || 1);
            }
        });

        // Scaling based on user requirement: base = 5 per correct, diff = sum of correct diff, time = 600 - timeTaken
        const baseScore = correctCount * 5;
        const timeBonus = Math.max(0, 600 - timeTaken) * 0.1;
        const difficultyBonus = difficultySum;

        const rawScore = baseScore + difficultyBonus + timeBonus;

        // Normalize raw score to IQ scale 80-145
        // Max theoretical score: correctCount(20) * 5 = 100. Diff(say 5 each max) = 100. TimeBonus = 60. Max rawScore ~ 260.
        // 0 -> 80, 260 -> 145.
        let iqScore = Math.floor(80 + (rawScore / 260) * 65);
        if (iqScore < 80) iqScore = 80;
        if (iqScore > 145) iqScore = 145;

        // Determine title
        const titleLogic = (score: number) => {
            if (score < 90) return 'Raw Potential';
            if (score <= 105) return 'Above Average';
            if (score <= 120) return 'Strategic Thinker';
            if (score <= 135) return 'Elite Problem Solver';
            return 'Rare Mind';
        };
        const title = titleLogic(iqScore);

        // Challenge handling
        let finalChallengeId = challengeId;
        if (!finalChallengeId) {
            // Create new challenge
            finalChallengeId = uuidv4();
            await db.collection('challenges').doc(finalChallengeId).set({
                challengeId: finalChallengeId,
                creatorName: sanitizedUserName,
                creatorScore: iqScore,
                creatorTitle: title,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                maxParticipants: 25,
                closed: false
            });
        } else {
            // Validate challenge exists
            const challengeRef = db.collection('challenges').doc(finalChallengeId);
            const challengeDoc = await challengeRef.get();
            if (!challengeDoc.exists) {
                return res.status(404).json({ error: 'Challenge not found' });
            }
            if (challengeDoc.data()?.closed) {
                return res.status(403).json({ error: 'Challenge closed' });
            }

            // Count participants
            const participantsSnapshot = await db.collection('participants').where('challengeId', '==', finalChallengeId).count().get();
            if (participantsSnapshot.data().count >= 25) {
                await challengeRef.update({ closed: true });
                return res.status(403).json({ error: 'Challenge full' });
            }
        }

        // Percentile calculation within challenge
        const allParticipantsSnapshot = await db.collection('participants').where('challengeId', '==', finalChallengeId).get();
        const participants = allParticipantsSnapshot.docs.map(doc => doc.data());

        let lowerCount = 0;
        participants.forEach(p => {
            if (p.score < iqScore) lowerCount++;
        });

        let percentile = 100;
        const totalParticipants = participants.length + 1; // including current user
        if (totalParticipants > 1) {
            percentile = Math.round((lowerCount / totalParticipants) * 100);
        }

        // Build Participant Record
        const participantData = {
            challengeId: finalChallengeId,
            userName: sanitizedUserName,
            score: iqScore,
            percentile,
            timeTaken,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('participants').add(participantData);

        // VIRAL SPREAD MECHANIC: Always generate a brand new Challenge for this user to share.
        // This ensures every person who takes the test gets their own clean leaderboard 
        // while setting the pace for their friends with their newly achieved score.
        const sharedChallengeId = uuidv4();
        await db.collection('challenges').doc(sharedChallengeId).set({
            challengeId: sharedChallengeId,
            creatorName: sanitizedUserName,
            creatorScore: iqScore,
            creatorTitle: title,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            maxParticipants: 25,
            closed: false
        });

        // Return response mapping the new sharedChallengeId for their friends
        return res.status(200).json({
            score: iqScore,
            percentile,
            title,
            challengeId: finalChallengeId, // The arena they just played in
            sharedChallengeId: sharedChallengeId, // The arena they will now share
            totalParticipants
        });

    } catch (error) {
        console.error('Error submitting test:', error);
        return res.status(500).json({ error: 'Internal server error while evaluating test' });
    }
};
