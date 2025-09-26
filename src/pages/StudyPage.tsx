import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Card } from '../types';
import { db } from '../services/database';
import { useDeck } from '../hooks/useDeck';
import { useCards } from '../hooks/useCards';
import { useCardStats } from '../hooks/useCardStats';
import { shuffleArray } from '../utils/arrayUtils';
import Flashcard from '../components/Flashcard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { deck, loading: deckLoading, error: deckError } = useDeck(deckId);
  const { cards: originalCards, loading: cardsLoading, error: cardsError, refetch: refetchCards } = useCards(deckId);
  const { saveCardStat, loading: statsLoading } = useCardStats();
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionWrongCards, setSessionWrongCards] = useState<Set<string>>(new Set());
  const [isRedoMode, setIsRedoMode] = useState(false);

  useEffect(() => {
    if (originalCards.length > 0) {
      setCards(shuffleArray(originalCards));
      setCurrentIndex(0);
      setSessionWrongCards(new Set());
      setIsRedoMode(false);
    }
  }, [originalCards]);

  const startRedoMode = () => {
    if (sessionWrongCards.size === 0) {
      alert('No cards were marked wrong in this session!');
      return;
    }
    const wrongCards = cards.filter(card => sessionWrongCards.has(card.id));
    setCards(shuffleArray(wrongCards));
    setCurrentIndex(0);
    setIsRedoMode(true);
  };

  const exitRedoMode = async () => {
    await refetchCards();
    setCurrentIndex(0);
    setIsRedoMode(false);
  };

  const handleMark = async (correct: boolean) => {
    const card = cards[currentIndex];
    if (!card) return;

    try {
      // Update card stats
      await saveCardStat(card, correct);

      // Update card needsReview flag
      if (!correct) {
        const updatedCard = { ...card, needsReview: true };
        await db.saveCard(updatedCard);
        setSessionWrongCards(prev => new Set([...prev, card.id]));
      } else if (isRedoMode) {
        // In redo mode, mark as no longer needing review
        const updatedCard = { ...card, needsReview: false };
        await db.saveCard(updatedCard);
        setSessionWrongCards(prev => {
          const newSet = new Set(prev);
          newSet.delete(card.id);
          return newSet;
        });
      }

      // Move to next card
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // End of session
        if (isRedoMode) {
          alert('Redo session complete! All wrong cards have been reviewed.');
          await exitRedoMode();
        } else {
          alert('Study session complete!');
          navigate(`/deck/${deckId}`);
        }
      }
    } catch (error) {
      console.error('Failed to save card statistics:', error);
      alert('Failed to save progress. Please try again.');
    }
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (deckLoading || cardsLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" text="Loading study session..." />
      </div>
    );
  }

  if (deckError || cardsError) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-4">Failed to load study session</h3>
        <p className="text-gray-500 text-lg mb-8">{deckError || cardsError}</p>
        <Link to="/" className="text-blue-600 hover:text-blue-700">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Deck not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-700">
          Back to Home
        </Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No cards in this deck</p>
        <Link to={`/deck/${deckId}`} className="text-blue-600 hover:text-blue-700">
          Back to Deck
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {isRedoMode ? '🔄 Redo Unknowns' : `📚 Study: ${deck.name}`}
            </h1>
            <p className="text-xl text-gray-600">
              {isRedoMode 
                ? `${sessionWrongCards.size} cards to review`
                : `${cards.length} cards in deck`
              }
            </p>
          </div>
          <div className="flex space-x-3">
            {!isRedoMode && sessionWrongCards.size > 0 && (
              <button
                onClick={startRedoMode}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                🔄 Redo Unknowns ({sessionWrongCards.size})
              </button>
            )}
            {isRedoMode && (
              <button
                onClick={exitRedoMode}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                ← Exit Redo Mode
              </button>
            )}
            <Link
              to={`/deck/${deckId}`}
              className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              ← Back to Deck
            </Link>
          </div>
        </div>
      </div>

      <Flashcard
        card={cards[currentIndex]}
        onMark={handleMark}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentIndex={currentIndex}
        totalCards={cards.length}
      />
    </div>
  );
}
