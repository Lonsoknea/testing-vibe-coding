import { useState } from 'react';
import type { Card } from '../types';

interface FlashcardProps {
  card: Card;
  onMark: (correct: boolean) => void;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  totalCards: number;
}

export default function Flashcard({ card, onMark, onNext, onPrevious, currentIndex, totalCards }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleMark = (correct: boolean) => {
    onMark(correct);
    setIsFlipped(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      handleFlip();
    } else if (e.code === 'KeyR' && isFlipped) {
      e.preventDefault();
      handleMark(true);
    } else if (e.code === 'KeyW' && isFlipped) {
      e.preventDefault();
      handleMark(false);
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      onNext();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      onPrevious();
    }
  };

  return (
    <div className="max-w-4xl mx-auto" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="mb-6 text-center">
        <div className="inline-flex items-center bg-white rounded-full px-6 py-2 shadow-md border border-gray-200">
          <span className="text-sm font-semibold text-gray-600">
            Card {currentIndex + 1} of {totalCards}
          </span>
        </div>
      </div>

      <div
        className="bg-white rounded-3xl shadow-2xl p-12 min-h-80 flex items-center justify-center cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-3xl border border-gray-100"
        onClick={handleFlip}
      >
        <div className="text-center">
          <div className="mb-6">
            <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              {isFlipped ? 'English' : 'Español'}
            </span>
          </div>
          <h2 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
            {isFlipped ? card.english : card.spanish}
          </h2>
          {isFlipped && card.partOfSpeech && (
            <p className="text-lg text-gray-500 italic font-medium">{card.partOfSpeech}</p>
          )}
          {isFlipped && card.example && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-lg text-gray-700 italic">"{card.example}"</p>
            </div>
          )}
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-lg text-gray-600 mb-6 font-medium">
          {isFlipped ? 'How did you do?' : 'Click or press Space to flip'}
        </p>
        
        {isFlipped && (
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => handleMark(false)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
            >
              <span className="mr-2">❌</span>
              Wrong (W)
            </button>
            <button
              onClick={() => handleMark(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
            >
              <span className="mr-2">✅</span>
              Right (R)
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-200 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:shadow-none"
        >
          ← Previous
        </button>
        <button
          onClick={onNext}
          disabled={currentIndex === totalCards - 1}
          className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 disabled:from-gray-200 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:transform-none disabled:shadow-none"
        >
          Next →
        </button>
      </div>

      <div className="mt-6 text-center">
        <div className="bg-gray-100 rounded-xl p-4 max-w-2xl mx-auto">
          <p className="text-sm text-gray-600 font-medium">
            💡 <strong>Keyboard shortcuts:</strong> Space/Enter to flip • R for Right • W for Wrong • ← → to navigate
          </p>
        </div>
      </div>
    </div>
  );
}
