
import React from 'react';
import { QuizResult } from '../types';

interface ResultCardProps {
  result: QuizResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const isFirstChallenger = result.totalParticipants === 1;

  // Dynamic status based on percentile
  const getPercentileLabel = (p: number) => {
    if (p >= 99) return { text: "Top 1% in this Arena", color: "text-cyan-400" };
    if (p >= 90) return { text: `Top ${100 - p}% Performance`, color: "text-cyan-400" };
    if (p >= 75) return { text: "Elite Performance", color: "text-blue-400" };
    if (p >= 50) return { text: "Above Average", color: "text-blue-400" };
    return { text: "Arena Participant", color: "text-white/60" };
  };

  const status = getPercentileLabel(result.percentile);

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />

      <div className="relative z-10 flex flex-col items-center">
        <span className="text-white/40 uppercase tracking-[0.4em] font-black text-[10px] mb-6 block">Arena Intelligence Score</span>

        <div className="mb-4">
          <h1 className="text-[120px] md:text-[160px] font-black text-white neon-glow leading-none tracking-tighter animate-in zoom-in duration-700">
            {result.score}
          </h1>
        </div>

        <div className="space-y-2 mb-10">
          <div className={`text-3xl md:text-5xl font-black uppercase tracking-tighter ${status.color} animate-in slide-in-from-bottom-4 delay-300 duration-700`}>
            {isFirstChallenger ? "First Challenger" : status.text}
          </div>
          <div className="text-sm text-white/40 uppercase font-bold tracking-widest">
            {isFirstChallenger
              ? "Invite friends to start the ranking"
              : `Scored higher than ${result.percentile}% of challengers`}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
            <div className="text-sm text-white/30 uppercase font-black tracking-widest mb-1">Rank Status</div>
            <div className="text-2xl font-black text-white">{result.title}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
            <div className="text-sm text-white/30 uppercase font-black tracking-widest mb-1">Arena Size</div>
            <div className="text-2xl font-black text-white">{result.totalParticipants} <span className="text-xs text-white/40">Users</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
