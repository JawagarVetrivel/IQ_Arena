
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
  challengerName: string;
  challengerScore: number;
  totalParticipants: number;
  leaderboard: LeaderboardEntry[];
}
