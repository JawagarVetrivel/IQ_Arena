
export interface Question {
  id: string;
  text: string;
  options: string[];
}

export interface QuizSubmission {
  quizSessionId: string;
  userName: string;
  answers: { questionId: string; selected: string }[];
  timeTaken: number;
  challengeId?: string;
}

export interface QuizResult {
  score: number;
  percentile: number;
  title: string;
  challengeId: string;
  sharedChallengeId: string; // The branch they will share
  totalParticipants: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  title: string;
  isCurrentUser?: boolean;
}

export interface ChallengeData {
  challengeRecord: {
    creatorName: string;
    creatorScore: number;
    creatorTitle: string;
  };
  totalParticipants: number;
  leaderboard: LeaderboardEntry[];
}
