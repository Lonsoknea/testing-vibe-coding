import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Deck, Card, CardStat } from '../types';
import { db } from '../services/database';
import Flashcard from '../components/Flashcard';

export default function StudyPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionWrongCards, setSessionWrongCards] = useState<Set<string>>(new Set());
  const [isRedoMode, setIsRedoMode] = useState(false);

  useEffect(() => {
    if (deckId) {
      loadDeck();
      loadCards();
    }
  }, [deckId]);

  const loadDeck = async () => {
    if (!deckId) return;
    const decks = await db.getDecks();
    const foundDeck = decks.find(d => d.id === deckId);
    setDeck(foundDeck || null);
  };

  const loadCards = async () => {
    if (!deckId) return;
    const cardsData = await db.getCards(deckId);
    setCards(cardsData);
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

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

  const exitRedoMode = () => {
    loadCards();
    setCurrentIndex(0);
    setIsRedoMode(false);
  };

  const handleMark = async (correct: boolean) => {
    const card = cards[currentIndex];
    if (!card) return;

    // Update card stats
    const existingStat = await db.getCardStats(card.id);
    const newStat: CardStat = {
      cardId: card.id,
      attempts: (existingStat?.attempts || 0) + 1,
      correct: (existingStat?.correct || 0) + (correct ? 1 : 0),
      incorrect: (existingStat?.incorrect || 0) + (correct ? 0 : 1),
      lastSeen: new Date().toISOString(),
      history: [
        ...(existingStat?.history || []).slice(-19), // Keep last 20 entries
        { at: new Date().toISOString(), correct }
      ]
    };

    await db.saveCardStat(newStat);

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
        exitRedoMode();
      } else {
        alert('Study session complete!');
        navigate(`/deck/${deckId}`);
      }
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
