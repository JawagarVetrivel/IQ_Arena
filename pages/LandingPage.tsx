
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/Button';
import { AdSlot } from '../components/AdSlot';
import { Leaderboard } from '../components/Leaderboard';
import { ChallengeData } from '../types';
import { getLeaderboard } from '../lib/api';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Read from HashRouter's search params first, fallback to the window's literal search params
  // This ensures backwards compatibility with links shared before the hash URL fix.
  const challengeId = searchParams.get('challengeId') || new URLSearchParams(window.location.search).get('challengeId');
  const [arenaData, setArenaData] = useState<ChallengeData | null>(null);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);

  useEffect(() => {
    if (challengeId) {
      setIsLoadingLeaderboard(true);
      setLeaderboardError(null);
      getLeaderboard(challengeId)
        .then(setArenaData)
        .catch((err) => {
          console.error(err);
          setLeaderboardError("Failed to connect to the Arena backend. If you are the developer, ensure your API_URL is correct and the server is running.");
        })
        .finally(() => setIsLoadingLeaderboard(false));
    }
  }, [challengeId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f]">
      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full" />

        <div className="max-w-4xl mx-auto z-10">
          <div className="inline-block mb-6 px-4 py-1.5 border border-blue-500/30 bg-blue-500/10 rounded-full text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">
            New Challenge Live
          </div>

          <h1 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-none">
            THINK YOU'RE <span className="text-blue-500 neon-glow italic">SMARTER</span> THAN YOUR FRIENDS?
          </h1>

          <p className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Enter the IQ Arena, take the definitive cognitive challenge, and secure your place on the global leaderboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/quiz' + (challengeId ? `?challengeId=${challengeId}` : ''))}
              className="px-12 py-6 text-lg"
            >
              Start Challenge
            </Button>
            <Button
              variant="outline"
              className="px-12 py-6 text-lg"
              onClick={() => {
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How it works
            </Button>
          </div>
        </div>
      </section>

      {/* Leaderboard Section (Only visible from shared link) */}
      {challengeId && (
        <section className="py-12 px-6">
          <div className="max-w-2xl mx-auto">
            {leaderboardError ? (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl text-center">
                <p className="text-red-400 text-sm font-bold uppercase tracking-widest mb-2">
                  Connection Error
                </p>
                <p className="text-white/60 text-xs">{leaderboardError}</p>
              </div>
            ) : (
              <>
                <Leaderboard
                  entries={arenaData?.leaderboard || []}
                  totalParticipants={arenaData?.totalParticipants}
                  isLoading={isLoadingLeaderboard}
                />
                {!isLoadingLeaderboard && (arenaData?.totalParticipants || 0) < 3 && (
                  <div className="mt-4 p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-center">
                    <p className="text-blue-400 text-sm font-bold uppercase tracking-widest">
                      Invite more friends to see real ranking
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-white/5 border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-blue-500/50 transition-colors">
            <div className="w-16 h-16 bg-blue-600 flex items-center justify-center rounded-2xl mx-auto mb-6 text-3xl font-black shadow-lg shadow-blue-500/20">1</div>
            <h3 className="text-2xl font-bold mb-4">Take the Test</h3>
            <p className="text-white/50">20 rapid-fire questions testing logic, pattern recognition, and processing speed.</p>
          </div>
          <div className="text-center p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-purple-500/50 transition-colors">
            <div className="w-16 h-16 bg-purple-600 flex items-center justify-center rounded-2xl mx-auto mb-6 text-3xl font-black shadow-lg shadow-purple-500/20">2</div>
            <h3 className="text-2xl font-bold mb-4">Get Verified IQ</h3>
            <p className="text-white/50">Our backend algorithms calculate your precise percentile based on global averages.</p>
          </div>
          <div className="text-center p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-cyan-500/50 transition-colors">
            <div className="w-16 h-16 bg-cyan-600 flex items-center justify-center rounded-2xl mx-auto mb-6 text-3xl font-black shadow-lg shadow-cyan-500/20">3</div>
            <h3 className="text-2xl font-bold mb-4">Challenge Friends</h3>
            <p className="text-white/50">Share your custom challenge link and see who really holds the cognitive crown.</p>
          </div>
        </div>
      </section>

      <AdSlot />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-black tracking-tighter">IQ ARENA</div>
          <div className="flex gap-8 text-sm text-white/40 uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
          <div className="text-xs text-white/20">© 2024 IQ Arena. No frontend score calculation. Secure backend scoring powered by Antigravity.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
