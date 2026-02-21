import { Request, Response } from 'express';
import { db } from '../config/firebase';

const titleLogic = (score: number) => {
    if (score < 90) return 'Raw Potential';
    if (score <= 105) return 'Above Average';
    if (score <= 120) return 'Strategic Thinker';
    if (score <= 135) return 'Elite Problem Solver';
    return 'Rare Mind';
};

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const { challengeId } = req.params;

        if (!challengeId) {
            return res.status(400).json({ error: 'Missing challengeId' });
        }

        if (!db) {
            return res.status(500).json({ error: 'Database not initialized' });
        }

        const challengeRef = db.collection('challenges').doc(challengeId as string);
        const challengeDoc = await challengeRef.get();

        if (!challengeDoc.exists) {
            return res.status(404).json({ error: 'Challenge not found' });
        }

        // Fetch participants matching challengeId, descending by score
        const participantsSnapshot = await db.collection('participants')
            .where('challengeId', '==', challengeId)
            .orderBy('score', 'desc')
            .get();

        const participants = participantsSnapshot.docs.map((doc, index) => {
            const data = doc.data();
            return {
                rank: index + 1,
                name: data.userName,
                score: data.score,
                title: titleLogic(data.score)
            };
        });

        const challengeData = challengeDoc.data() as any;

        return res.status(200).json({
            challengeRecord: {
                creatorName: challengeData.creatorName || "Arena Master",
                creatorScore: challengeData.creatorScore || 0,
                creatorTitle: challengeData.creatorTitle || "Unknown"
            },
            participants,
            totalParticipants: participants.length
        });

    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return res.status(500).json({ error: 'Internal server error while fetching leaderboard' });
    }
};
