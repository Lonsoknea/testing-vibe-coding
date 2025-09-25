import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Deck } from '../types';
import { db } from '../services/database';

export default function Home() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [newDeckName, setNewDeckName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    const decksData = await db.getDecks();
    setDecks(decksData);
  };

  const createDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    const newDeck: Deck = {
      id: crypto.randomUUID(),
      name: newDeckName.trim(),
      createdAt: new Date().toISOString(),
    };

    await db.saveDeck(newDeck);
    setNewDeckName('');
    setShowCreateForm(false);
    loadDecks();
  };

  const deleteDeck = async (deckId: string) => {
    if (window.confirm('Are you sure you want to delete this deck? This will also delete all cards in the deck.')) {
      await db.deleteDeck(deckId);
      loadDecks();
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          ¡Bienvenido! Welcome!
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Master Spanish vocabulary with interactive flashcards. Create decks, study smart, and track your progress.
        </p>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">My Decks</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center"
        >
          <span className="mr-2">➕</span>
          Create New Deck
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Create New Deck</h2>
          <form onSubmit={createDeck} className="space-y-6">
            <div>
              <label htmlFor="deckName" className="block text-sm font-semibold text-gray-700 mb-2">
                Deck Name
              </label>
              <input
                type="text"
                id="deckName"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., Basic Spanish Words"
                autoFocus
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                ✨ Create Deck
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
        {decks.map((deck) => (
          <div key={deck.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 transform hover:scale-105 transition-all duration-200 group">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl text-white">📚</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">{deck.name}</h3>
              <p className="text-gray-500 text-sm">
                Created {new Date(deck.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <Link
                to={`/deck/${deck.id}`}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold text-center shadow-md hover:shadow-lg transition-all duration-200"
              >
                🔍 Open
              </Link>
              <button
                onClick={() => deleteDeck(deck.id)}
                className="bg-red-100 hover:bg-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {decks.length === 0 && (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-6xl">📚</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-4">No decks yet!</h3>
          <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
            Start your Spanish learning journey by creating your first deck of flashcards.
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            🚀 Create Your First Deck
          </button>
        </div>
      )}
    </div>
  );
}
