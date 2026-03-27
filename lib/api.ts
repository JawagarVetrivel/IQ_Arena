import { QuizSubmission, QuizResult, ChallengeData, Question, LeaderboardEntry } from '../types';

const API_URL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:8080/api' : 'https://iq-arena-sigma.vercel.app/api');

export const startQuiz = async (): Promise<{ quizSessionId: string; questions: Question[] }> => {
  const response = await fetch(`${API_URL}/start-quiz`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to start quiz');
  }

  return response.json();
};

export const submitTest = async (data: QuizSubmission): Promise<QuizResult> => {
  const response = await fetch(`${API_URL}/submit-test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit test');
  }

  return response.json();
};

export const getLeaderboard = async (challengeId: string): Promise<ChallengeData> => {
  const response = await fetch(`${API_URL}/leaderboard/${challengeId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch leaderboard');
  }

  const data = await response.json();

  const creatorName = data.challengeRecord?.creatorName || "Arena Master";
  const creatorScore = data.challengeRecord?.creatorScore || 0;
  const creatorTitle = data.challengeRecord?.creatorTitle || "Unknown";

  const participants: LeaderboardEntry[] = (data.participants || []).map((p: any) => ({ ...p }));

  // Check if the creator is already in the participants list
  const existingCreator = participants.find(
    (p) => p.name === creatorName && p.score === creatorScore
  );

  if (existingCreator) {
    // Mark existing entry as creator
    existingCreator.isCreator = true;
  } else {
    // Creator not in participants list yet, add them
    participants.push({
      rank: 0,
      name: creatorName,
      score: creatorScore,
      title: creatorTitle,
      isCreator: true,
    });
  }

  participants.sort((a, b) => b.score - a.score);

  participants.forEach((p, index) => {
    p.rank = index + 1;
  });

  // Map backend response back to frontend expected shape
  return {
    challengeRecord: {
      creatorName,
      creatorScore,
      creatorTitle,
    },
    totalParticipants: participants.length,
    leaderboard: participants,
  };
};

export const getResult = async (challengeId: string, userName: string): Promise<QuizResult> => {
  const response = await fetch(`${API_URL}/result/${challengeId}/${encodeURIComponent(userName)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Result not found');
  }

  return response.json();
};
