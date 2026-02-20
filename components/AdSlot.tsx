
import React from 'react';

export const AdSlot: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center min-h-[100px] md:min-h-[250px]">
        <span className="text-white/30 text-xs font-mono uppercase tracking-widest">Advertisement Placeholder</span>
        <div className="mt-2 text-white/10 text-[10px] text-center max-w-xs">
          This slot is reserved for high-performance programmatic ads.
        </div>
      </div>
    </div>
  );
};
