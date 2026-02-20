
export interface Question {
  id: string;
  text: string;
  options: string[];
}

export interface QuizSubmission {
  userName: string;
  answers: Record<string, string>; // questionId -> answer
  timeTaken: number;
  challengeId?: string;
}

export interface QuizResult {
  iq: number;
  percentile: number;
  title: string;
  message: string;
  challengeId: string;
  userName: string;
  totalParticipantsInChallenge: number;
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
