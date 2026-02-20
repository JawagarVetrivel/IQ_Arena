
import React from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  selectedOption: string | null;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOption,
  onSelect,
  disabled
}) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl md:text-3xl font-bold leading-tight">
        {question.text}
      </h2>
      
      <div className="grid grid-cols-1 gap-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === option;
          return (
            <button
              key={idx}
              disabled={disabled}
              onClick={() => onSelect(option)}
              className={`
                flex items-center p-4 md:p-6 text-left border-2 rounded-2xl transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                  : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <div className={`
                flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold mr-4
                ${isSelected ? 'border-blue-500 bg-blue-500 text-white' : 'border-white/20 text-white/40'}
              `}>
                {String.fromCharCode(65 + idx)}
              </div>
              <span className={`text-lg ${isSelected ? 'text-white' : 'text-white/80'}`}>
                {option}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
