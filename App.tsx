
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import ChallengePage from './pages/ChallengePage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col selection:bg-blue-500/30">
      <Suspense fallback={
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/result/:challengeId" element={<ResultPage />} />
          <Route path="/challenge/:challengeId" element={<ChallengePage />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
