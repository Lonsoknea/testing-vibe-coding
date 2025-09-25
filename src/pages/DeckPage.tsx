import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Deck, Card } from '../types';
import { db } from '../services/database';

export default function DeckPage() {
  const { deckId } = useParams<{ deckId: string }>();
  // const navigate = useNavigate();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [newCardSpanish, setNewCardSpanish] = useState('');
  const [newCardEnglish, setNewCardEnglish] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const createCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardSpanish.trim() || !newCardEnglish.trim() || !deckId) return;

    const newCard: Card = {
      id: crypto.randomUUID(),
      deckId,
      spanish: newCardSpanish.trim(),
      english: newCardEnglish.trim(),
      createdAt: new Date().toISOString(),
    };

    await db.saveCard(newCard);
    setNewCardSpanish('');
    setNewCardEnglish('');
    setShowCreateForm(false);
    loadCards();
  };

  const deleteCard = async (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      await db.deleteCard(cardId);
      loadCards();
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

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">{deck.name}</h1>
            <p className="text-xl text-gray-600">{cards.length} cards in this deck</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              ➕ Add Card
            </button>
            <Link
              to={`/deck/${deckId}/study`}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              📚 Study
            </Link>
            <Link
              to={`/deck/${deckId}/quiz`}
              className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              🧠 Quiz
            </Link>
          </div>
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Card</h2>
          <form onSubmit={createCard} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="spanish" className="block text-sm font-semibold text-gray-700 mb-2">
                  Spanish Word
                </label>
                <input
                  type="text"
                  id="spanish"
                  value={newCardSpanish}
                  onChange={(e) => setNewCardSpanish(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., hola"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="english" className="block text-sm font-semibold text-gray-700 mb-2">
                  English Translation
                </label>
                <input
                  type="text"
                  id="english"
                  value={newCardEnglish}
                  onChange={(e) => setNewCardEnglish(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="e.g., hello"
                />
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                ✨ Add Card
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <div key={card.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 transform hover:scale-105 transition-all duration-200 group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">{card.spanish}</h3>
                <p className="text-gray-600 text-lg">{card.english}</p>
              </div>
              <button
                onClick={() => deleteCard(card.id)}
                className="text-red-400 hover:text-red-600 text-lg p-2 hover:bg-red-50 rounded-full transition-all duration-200"
              >
                🗑️
              </button>
            </div>
            {card.needsReview && (
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                  🔄 Needs Review
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">📝</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-4">No cards yet!</h3>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
            Start building your Spanish vocabulary by adding your first flashcard.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            ➕ Add Your First Card
          </button>
        </div>
      )}
    </div>
  );
}
