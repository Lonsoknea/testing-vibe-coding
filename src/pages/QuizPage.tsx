import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Card, CardStat, Deck } from '../types';
import { db } from '../services/database';

export default function QuizPage() {
  const { deckId } = useParams<{ deckId: string }>();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const choicesPerQuestion = 4;

  useEffect(() => {
    if (!deckId) return;
    (async () => {
      const decks = await db.getDecks();
      setDeck(decks.find(d => d.id === deckId) || null);
      const c = await db.getCards(deckId);
      setCards(shuffleArray(c));
    })();
  }, [deckId]);

  const currentCard = cards[currentIndex];

  const options = useMemo(() => {
    if (!currentCard) return [] as string[];
    const others = cards.filter(c => c.id !== currentCard.id);
    const distractors = shuffleArray(others).slice(0, Math.max(0, choicesPerQuestion - 1)).map(o => toEnglishText(o.english));
    const correct = toEnglishText(currentCard.english);
    const all = shuffleArray([correct, ...distractors]);
    // Deduplicate in case of small decks
    return Array.from(new Set(all)).slice(0, choicesPerQuestion);
  }, [cards, currentIndex]);

  const isCorrect = (opt: string) => opt === toEnglishText(currentCard?.english ?? '');

  const handleSelect = async (opt: string) => {
    if (!currentCard) return;
    if (showFeedback) return;
    setSelected(opt);
    const correct = isCorrect(opt);
    await recordStat(currentCard, correct);
    if (correct) setScore(s => s + 1);
    setShowFeedback(true);
  };

  const nextQuestion = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      setFinished(true);
    }
  };

  if (!deck) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Deck not found</p>
        <Link to="/" className="text-blue-600 hover:text-blue-700">Back to Home</Link>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No cards in this deck</p>
        <Link to={`/deck/${deckId}`} className="text-blue-600 hover:text-blue-700">Back to Deck</Link>
      </div>
    );
  }

  if (finished) {
    const percent = Math.round((score / cards.length) * 100);
    return (
      <div className="space-y-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">🧠 Quiz Complete</h1>
        <p className="text-xl text-gray-700">Score: {score} / {cards.length} ({percent}%)</p>
        <div className="flex justify-center space-x-4">
          <Link to={`/deck/${deckId}`} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md">← Back to Deck</Link>
          <button onClick={() => { setCurrentIndex(0); setScore(0); setFinished(false); setSelected(null); setShowFeedback(false); setCards(shuffleArray(cards)); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md">🔁 Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">🧠 Quiz: {deck.name}</h1>
            <p className="text-xl text-gray-600">Question {currentIndex + 1} of {cards.length}</p>
          </div>
          <Link to={`/deck/${deckId}`} className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg">← Back to Deck</Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
        <div className="mb-6 text-center">
          <span className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Español</span>
        </div>
        <h2 className="text-5xl font-bold text-gray-800 text-center mb-8">{currentCard?.spanish}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {options.map((opt) => {
            const correct = isCorrect(opt);
            const isSelected = selected === opt;
            const showCorrect = showFeedback && correct;
            const showWrong = showFeedback && isSelected && !correct;
            return (
              <button
                key={opt}
                onClick={() => handleSelect(opt)}
                disabled={showFeedback}
                className={`text-left px-6 py-4 rounded-2xl border-2 transition-all duration-200 shadow-sm font-semibold ${
                  showCorrect ? 'bg-green-50 border-green-400 text-green-800' :
                  showWrong ? 'bg-red-50 border-red-400 text-red-800' :
                  'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="text-center mt-8">
            <p className="text-lg font-medium text-gray-700 mb-4">
              {isCorrect(selected || '') ? '✅ Correct!' : `❌ Incorrect. Correct answer: ${toEnglishText(currentCard.english)}`}
            </p>
            <button onClick={nextQuestion} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function toEnglishText(english: string | string[]): string {
  return Array.isArray(english) ? english[0] : english;
}

async function recordStat(card: Card, correct: boolean) {
  const existingStat = await db.getCardStats(card.id);
  const newStat: CardStat = {
    cardId: card.id,
    attempts: (existingStat?.attempts || 0) + 1,
    correct: (existingStat?.correct || 0) + (correct ? 1 : 0),
    incorrect: (existingStat?.incorrect || 0) + (correct ? 0 : 1),
    lastSeen: new Date().toISOString(),
    history: [
      ...(existingStat?.history || []).slice(-19),
      { at: new Date().toISOString(), correct }
    ]
  };
  await db.saveCardStat(newStat);
}
