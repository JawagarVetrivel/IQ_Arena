
import { QuizSubmission, QuizResult, ChallengeData, LeaderboardEntry } from '../types';

/**
 * MOCK DATABASE SIMULATION
 * In a real app, this would be a Postgres/NoSQL database.
 */
const CHALLENGES_STORE: Record<string, { name: string; score: number; title: string }[]> = {
  "default": [
    { name: "Alex Chen", score: 145, title: "Grandmaster" },
    { name: "Sarah J.", score: 138, title: "Genius" },
    { name: "Rahul M.", score: 124, title: "Superior" },
  ]
};

const CORRECT_ANSWERS: Record<string, string> = {
  q1: "32", q2: "True", q3: "None of these", q4: "300", q5: "Eating",
  q6: "Apple", q7: "4", q8: "5", q9: "22", q10: "Circle",
  q11: "13", q12: "5 min", q13: "Flowing", q14: "$0.05", q15: "Branch",
  q16: "City", q17: "1/4", q18: "24", q19: "Cylinder", q20: "Ice",
  q21: "50", q22: "Deep", q23: "12", q24: "I", q25: "50",
  q26: "1", q27: "Up", q28: "28", q29: "12", q30: "5",
  q31: "27", q32: "Ignorance", q33: "Pear", q34: "2", q35: "Both equal",
  q36: "Violin", q37: "1 hr", q38: "2", q39: "Low", q40: "12",
  q41: "36", q42: "4157", q43: "Moon", q44: "1/8", q45: "9",
  q46: "Honest", q47: "23", q48: "Saturday", q49: "Artist", q50: "E",
  q51: "13", q52: "25", q53: "Glass", q54: "His son", q55: "Wire",
  q56: "F", q57: "8", q58: "Envelope", q59: "Circle", q60: "False",
  q61: "0.5", q62: "7", q63: "Country", q64: "7.5°", q65: "Air",
  q66: "Expand", q67: "12", q68: "13", q69: "Green", q70: "Cold",
  q71: "125", q72: "169", q73: "Bicycle", q74: "12", q75: "Writer",
  q76: "Liter", q77: "10", q78: "37", q79: "Huge", q80: "180",
  q81: "24", q82: "24", q83: "Texas", q84: "9", q85: "Shoe",
  q86: "Depart", q87: "7", q88: "10", q89: "Penguin", q90: "6 hrs",
  q91: "16", q92: "Paris", q93: "Gold", q94: "Vehicle", q95: "Crowd",
  q96: "Minute", q97: "6", q98: "99", q99: "Wednesday", q100: "Keyboard"
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const submitTest = async (data: QuizSubmission): Promise<QuizResult> => {
  await delay(1500);

  // 1. Calculate accuracy & base score
  let correctCount = 0;
  Object.entries(data.answers).forEach(([qId, answer]) => {
    if (CORRECT_ANSWERS[qId] === answer) correctCount++;
  });

  const baseIQ = 70 + (correctCount * 3.75);
  let speedBonus = data.timeTaken < 120 ? 5 : 0;
  const finalIQ = Math.round(Math.min(160, Math.max(65, baseIQ + speedBonus)));

  // 2. Identify the Challenge ID
  const challengeId = data.challengeId || Math.random().toString(36).substring(7);
  
  // 3. Update Challenge Store
  if (!CHALLENGES_STORE[challengeId]) {
    CHALLENGES_STORE[challengeId] = [];
  }

  // 4. Determine Title
  let title = "Average";
  if (finalIQ >= 140) title = "Grandmaster";
  else if (finalIQ >= 130) title = "Genius";
  else if (finalIQ >= 115) title = "Superior";
  else if (finalIQ >= 105) title = "High Average";

  // Add current result
  CHALLENGES_STORE[challengeId].push({
    name: data.userName,
    score: finalIQ,
    title: title
  });

  // 5. Challenge-Specific Percentile Calculation
  // Percentile = (Number of people user scored strictly higher than) / (Total participants - 1) * 100
  const arenaParticipants = CHALLENGES_STORE[challengeId];
  const totalInArena = arenaParticipants.length;
  
  let percentile = 100;
  if (totalInArena > 1) {
    const scoresLowerThanUser = arenaParticipants.filter(p => p.score < finalIQ).length;
    percentile = Math.round((scoresLowerThanUser / (totalInArena - 1)) * 100);
  }

  return {
    iq: finalIQ,
    percentile,
    title,
    message: finalIQ > 120 ? "Exceptional cognitive agility." : "Standard cognitive profile.",
    challengeId,
    userName: data.userName,
    totalParticipantsInChallenge: totalInArena
  };
};

export const getLeaderboard = async (challengeId: string): Promise<ChallengeData> => {
  await delay(800);
  const participants = CHALLENGES_STORE[challengeId] || CHALLENGES_STORE["default"];
  
  const leaderboard: LeaderboardEntry[] = participants
    .sort((a, b) => b.score - a.score)
    .map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      score: p.score,
      title: p.title
    }));

  return {
    challengerName: leaderboard[0]?.name || "None",
    challengerScore: leaderboard[0]?.score || 0,
    totalParticipants: leaderboard.length,
    leaderboard
  };
};
