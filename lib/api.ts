import { QuizSubmission, QuizResult, ChallengeData, Question } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'https://iq-arena-sigma.vercel.app/api';

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

  // Map backend response back to frontend expected shape
  return {
    challengerName: data.participants[0]?.name || "Arena Master",
    challengerScore: data.participants[0]?.score || 0,
    totalParticipants: data.totalParticipants,
    leaderboard: data.participants,
  };
};
