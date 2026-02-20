
import React, { useEffect, useState } from 'react';

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  resetKey: any; // Used to restart timer when question changes
}

export const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, resetKey }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration, resetKey]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const percentage = (timeLeft / duration) * 100;
  const isWarning = timeLeft <= 5;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-white/50 uppercase tracking-tighter">Time Remaining</span>
        <span className={`text-xl font-black tabular-nums ${isWarning ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
          0:{timeLeft.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${isWarning ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
