
import React from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  totalParticipants?: number;
  isLoading?: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ entries, totalParticipants, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4 w-full">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 w-full bg-white/5 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h3 className="text-xl font-bold uppercase tracking-widest text-blue-400">Arena Rankings</h3>
        {totalParticipants !== undefined && (
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
            {totalParticipants} {totalParticipants === 1 ? 'Challenger' : 'Participants'}
          </span>
        )}
      </div>
      <div className="divide-y divide-white/5">
        {entries.length === 0 ? (
          <div className="p-12 text-center text-white/20 uppercase tracking-widest font-black text-sm">
            Arena is currently empty
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center p-4 transition-colors ${entry.isCurrentUser ? 'bg-blue-600/20' : 'hover:bg-white/5'}`}
            >
              <div className={`w-10 h-10 flex items-center justify-center font-black rounded-lg mr-4 ${entry.rank === 1 ? 'bg-yellow-500 text-black' :
                  entry.rank === 2 ? 'bg-gray-300 text-black' :
                    entry.rank === 3 ? 'bg-amber-600 text-black' : 'bg-white/10 text-white'
                }`}>
                {entry.rank}
              </div>
              <div className="flex-grow">
                <div className="font-bold flex items-center">
                  {entry.name}
                  {entry.isCurrentUser && <span className="ml-2 text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded uppercase font-black">You</span>}
                  {entry.isCreator && !entry.isCurrentUser && <span className="ml-2 text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded uppercase font-black">Creator</span>}
                </div>
                <div className="text-xs text-white/40 uppercase tracking-widest">{entry.title}</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-white">{entry.score}</div>
                <div className="text-[10px] text-white/30 font-bold uppercase tracking-tighter">IQ Score</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
