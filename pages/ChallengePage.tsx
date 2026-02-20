
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../lib/api';
import { ChallengeData } from '../types';
import { Leaderboard } from '../components/Leaderboard';
import { Button } from '../components/Button';
import { AdSlot } from '../components/AdSlot';

const ChallengePage: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (challengeId) {
      getLeaderboard(challengeId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [challengeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin mx-auto" />
          <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Synchronizing Leaderboard</p>
        </div>
      </div>
    );
  }

  const isFewParticipants = (data?.totalParticipants || 0) < 3;

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-6">
          <div className="inline-block px-4 py-1.5 bg-red-600/20 border border-red-500/30 rounded-full text-red-500 text-xs font-bold uppercase tracking-widest">
            {data?.totalParticipants} {data?.totalParticipants === 1 ? 'Challenger' : 'Participants'} in this Arena
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter uppercase leading-none">
            {data?.challengerName} SETS THE <span className="text-blue-500 italic">PACE</span>
          </h1>
          <p className="text-xl text-white/60 max-w-xl mx-auto font-light">
            Target Score: <span className="font-bold text-white">{data?.challengerScore} IQ</span>. 
            Do you have the cognitive speed to take the lead?
          </p>
          <Button 
            className="px-12 py-6 text-xl"
            onClick={() => navigate(`/quiz?challengeId=${challengeId}`)}
          >
            Enter Arena — Start Test
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center">
              <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm">#</span>
              Arena Leaderboard
            </h3>
            <Leaderboard 
              entries={data?.leaderboard || []} 
              totalParticipants={data?.totalParticipants}
              isLoading={loading} 
            />
            {isFewParticipants && (
              <div className="p-6 bg-white/5 border border-dashed border-white/20 rounded-2xl text-center">
                <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
                  Invite more friends to see real ranking
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center space-y-8">
            <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
              <h4 className="text-xl font-black uppercase mb-4">How Ranking Works</h4>
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                Percentile is strictly relative to this specific Arena. If you are the first challenger, you start at the 100th percentile. As more people join, your ranking dynamically updates based on their performance.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-xl font-black text-blue-400">Verified</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">Logic Engine</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-center">
                  <div className="text-xl font-black text-cyan-400">Realtime</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest">Arena Updates</div>
                </div>
              </div>
            </div>
            
            <AdSlot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
