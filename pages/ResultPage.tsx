
import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { ResultCard } from '../components/ResultCard';
import { ShareButton } from '../components/ShareButton';
import { AdSlot } from '../components/AdSlot';
import { Leaderboard } from '../components/Leaderboard';
import { QuizResult, ChallengeData } from '../types';
import { getLeaderboard, getResult } from '../lib/api';

// Key used to store result in localStorage so it survives tab close/reopen
const getResultKey = (challengeId: string) => `iq_arena_result_${challengeId}`;

const ResultPage: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const stateResult = location.state?.result as QuizResult | undefined;

  const [result, setResult] = useState<QuizResult | null>(stateResult || null);
  const [arenaData, setArenaData] = useState<ChallengeData | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);

  // Persist the fresh result to localStorage so it survives re-opens
  useEffect(() => {
    if (stateResult && challengeId) {
      try {
        localStorage.setItem(getResultKey(challengeId), JSON.stringify(stateResult));
      } catch (_) { /* storage full or blocked, silently ignore */ }
    }
  }, [stateResult, challengeId]);

  // If no state result, try localStorage first then fall back to the API
  useEffect(() => {
    if (result || !challengeId) return; // already have it

    // 1. Try localStorage
    try {
      const stored = localStorage.getItem(getResultKey(challengeId));
      if (stored) {
        setResult(JSON.parse(stored));
        return;
      }
    } catch (_) { /* corrupt data, continue to API */ }

    // 2. We don't have a userName here – show a prompt to look up the result
    setResultError('no_state');
  }, [challengeId, result]);

  // Fetch leaderboard whenever challengeId changes
  useEffect(() => {
    if (challengeId) {
      getLeaderboard(challengeId).then(setArenaData).catch(() => { });
    }
  }, [challengeId]);

  // Handler to fetch result by name when arriving directly via URL
  const [lookupName, setLookupName] = useState('');
  const [isLooking, setIsLooking] = useState(false);

  const handleLookup = async () => {
    if (!lookupName.trim() || !challengeId) return;
    setIsLooking(true);
    setResultError(null);
    try {
      const fetched = await getResult(challengeId, lookupName.trim());
      // Save to localStorage for next time
      localStorage.setItem(getResultKey(challengeId), JSON.stringify(fetched));
      setResult(fetched);
    } catch {
      setResultError('not_found');
    } finally {
      setIsLooking(false);
    }
  };

  // Loading result from API
  if (isLoadingResult) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Lookup form if we have a challengeId but lost state
  if (resultError === 'no_state') {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-3xl font-black uppercase tracking-tight">Retrieve Your Results</h2>
          <p className="text-white/50">Enter the name you used when you took the test to view your results.</p>
          <input
            type="text"
            placeholder="YOUR NAME"
            className="w-full p-4 bg-white/5 border-2 border-white/10 rounded-2xl text-lg font-bold uppercase tracking-widest text-center focus:border-blue-500 outline-none transition-all"
            value={lookupName}
            onChange={(e) => setLookupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
          {resultError === 'not_found' && (
            <p className="text-red-400 text-sm font-bold">No result found for that name in this arena.</p>
          )}
          <button
            onClick={handleLookup}
            disabled={!lookupName.trim() || isLooking}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-2xl text-white font-black uppercase tracking-widest transition-colors"
          >
            {isLooking ? 'Looking up...' : 'Find My Results'}
          </button>
          <button onClick={() => navigate('/')} className="text-white/30 hover:text-white text-xs uppercase tracking-widest transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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

  const shareText = `I just scored ${result.score} IQ in this Arena Challenge! Only ${100 - result.percentile}% beat me. Can you?`;
  const shareUrl = `${window.location.origin}/#/?challengeId=${result.sharedChallengeId}`;
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
                entries={arenaData?.leaderboard || []}
                totalParticipants={arenaData?.totalParticipants}
                isLoading={!arenaData}
              />

              {isFewParticipants && arenaData !== null && (
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
