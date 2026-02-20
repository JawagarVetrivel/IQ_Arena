
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { ResultCard } from '../components/ResultCard';
import { ShareButton } from '../components/ShareButton';
import { AdSlot } from '../components/AdSlot';
import { Leaderboard } from '../components/Leaderboard';
import { QuizResult, ChallengeData } from '../types';
import { getLeaderboard } from '../lib/api';

const ResultPage: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as QuizResult;
  const [arenaData, setArenaData] = useState<ChallengeData | null>(null);

  useEffect(() => {
    if (challengeId) {
      getLeaderboard(challengeId).then(setArenaData);
    }
  }, [challengeId]);

  if (!result) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-3xl font-black mb-4 uppercase">No Result Data</h2>
          <button onClick={() => navigate('/')} className="text-blue-500 hover:underline">Back to Home</button>
        </div>
      </div>
    );
  }

  const shareText = `I just scored ${result.iq} IQ in this Arena Challenge! Only ${100 - result.percentile}% beat me. Can you?`;
  const shareUrl = `${window.location.origin}/#/challenge/${result.challengeId}`;
  const isFewParticipants = (arenaData?.totalParticipants || 0) < 3;

  return (
    <div className="min-h-screen bg-[#0f0f0f] py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="text-center space-y-4">
          <h2 className="text-4xl font-black uppercase tracking-tighter">Arena Intelligence Profile</h2>
          <p className="text-white/40 uppercase tracking-widest text-xs font-bold">Secure ID: {challengeId}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Result Column */}
          <div className="lg:col-span-7 space-y-12">
            <ResultCard result={result} />
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center space-y-8">
              <h3 className="text-3xl font-black uppercase tracking-tight">Challenge Your Circle</h3>
              <p className="text-white/60 max-w-lg mx-auto">
                Your results are verified in this arena. Share this link to compete for the top position.
              </p>
              <div className="max-w-md mx-auto">
                <ShareButton 
                  title="IQ Arena Challenge"
                  text={shareText}
                  url={shareUrl}
                />
              </div>
            </div>
          </div>

          {/* Leaderboard Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <Leaderboard 
                entries={arenaData?.leaderboard.map(e => ({ ...e, isCurrentUser: e.name === result.userName })) || []} 
                totalParticipants={arenaData?.totalParticipants}
                isLoading={!arenaData} 
              />
              
              {isFewParticipants && !arenaData === false && (
                <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
                  <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">
                    Invite more friends to see real ranking
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <AdSlot />
        
        <div className="text-center pt-12 pb-6 border-t border-white/5">
          <button 
            onClick={() => navigate('/')} 
            className="text-white/40 hover:text-white transition-colors uppercase text-xs font-bold tracking-widest"
          >
            Start New Global Arena
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
