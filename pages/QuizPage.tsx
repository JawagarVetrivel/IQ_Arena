
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { QUESTIONS } from '../constants';
import { Timer } from '../components/Timer';
import { QuestionCard } from '../components/QuestionCard';
import { Button } from '../components/Button';
import { submitTest } from '../lib/api';
import { Question } from '../types';

const SESSION_QUESTION_COUNT = 20;

const QuizPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get('challengeId') || undefined;

  // State
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());
  const [userName, setUserName] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  // Randomly select 20 questions ONCE per session.
  // Dependency is empty array to ensure stable array reference throughout the quiz lifecycle.
  const activeQuestions = useMemo(() => {
    return [...QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, SESSION_QUESTION_COUNT);
  }, []);

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const finishQuiz = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const result = await submitTest({
        userName: userName || 'Anonymous User',
        answers,
        timeTaken,
        challengeId
      });
      navigate(`/result/${result.challengeId}`, { state: { result } });
    } catch (error) {
      console.error(error);
      alert("Something went wrong during submission. Please check your connection.");
      setIsSubmitting(false);
    }
  }, [isSubmitting, startTime, userName, answers, challengeId, navigate]);

  const handleNext = useCallback(() => {
    if (currentIdx < activeQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      finishQuiz();
    }
  }, [currentIdx, activeQuestions.length, finishQuiz]);

  const handleOptionSelect = (option: string) => {
    const q = activeQuestions[currentIdx];
    if (!q) return;

    setAnswers(prev => ({ ...prev, [q.id]: option }));
    // Wait a brief moment for visual feedback then move to next
    setTimeout(() => handleNext(), 300);
  };

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="inline-block px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400 font-bold tracking-widest uppercase">
            Encrypted Connection Established
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Identity Verified</h1>
          <p className="text-white/60">Enter your name to start the secure assessment. Your data is encrypted and sent only to our backend.</p>
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="YOUR FULL NAME"
              className="w-full p-6 bg-white/5 border-2 border-white/10 rounded-2xl text-xl font-bold uppercase tracking-widest text-center focus:border-blue-500 outline-none transition-all"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <Button 
              fullWidth 
              disabled={!userName.trim()} 
              onClick={() => setIsStarted(true)}
            >
              Initialize Assessment
            </Button>
          </div>
          <div className="text-[10px] text-white/20 uppercase tracking-[0.2em] pt-4">
            Warning: Once started, timer cannot be paused.
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
          <h2 className="text-3xl font-black uppercase tracking-widest">Processing Results</h2>
          <p className="text-white/50 max-w-xs mx-auto">Analyzing patterns and calculating IQ against global percentile norms...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = activeQuestions[currentIdx];

  // Safeguard against out-of-bounds rendering
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col py-8 px-6">
      <div className="w-full max-w-3xl mx-auto flex-grow flex flex-col">
        {/* Progress Header */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-1">Module: Logical Reasoning</div>
            <div className="text-2xl font-black italic">ARENA CHALLENGE</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-white/40 font-bold uppercase tracking-widest mb-1">Question</div>
            <div className="text-3xl font-black leading-none">{currentIdx + 1} <span className="text-white/20">/ {SESSION_QUESTION_COUNT}</span></div>
          </div>
        </div>

        {/* Timer Component */}
        <Timer 
          duration={20} 
          onTimeUp={handleNext} 
          resetKey={currentIdx} 
        />

        {/* Question Area */}
        <div className="flex-grow flex flex-col justify-center">
          <QuestionCard 
            question={currentQuestion}
            selectedOption={answers[currentQuestion.id] || null}
            onSelect={handleOptionSelect}
          />
        </div>

        <div className="mt-12 flex justify-between items-center opacity-30">
          <div className="text-[10px] text-white uppercase tracking-[0.3em] font-bold">
            Encrypted Session: {Math.random().toString(36).substring(7).toUpperCase()}
          </div>
          <div className="text-[10px] text-white uppercase tracking-[0.3em] font-bold">
            Pool Index: {currentQuestion.id}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
