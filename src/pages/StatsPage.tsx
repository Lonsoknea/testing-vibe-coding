import { useState, useEffect } from 'react';
import { db } from '../services/database';

interface DeckStats {
  deckId: string;
  deckName: string;
  totalCards: number;
  totalAttempts: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
}

export default function StatsPage() {
  const [deckStats, setDeckStats] = useState<DeckStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const decks = await db.getDecks();
    const stats: DeckStats[] = [];

    for (const deck of decks) {
      const cards = await db.getCards(deck.id);
      let totalAttempts = 0;
      let correctAnswers = 0;
      let incorrectAnswers = 0;

      for (const card of cards) {
        const cardStat = await db.getCardStats(card.id);
        if (cardStat) {
          totalAttempts += cardStat.attempts;
          correctAnswers += cardStat.correct;
          incorrectAnswers += cardStat.incorrect;
        }
      }

      const accuracy = totalAttempts > 0 ? (correctAnswers / totalAttempts) * 100 : 0;

      stats.push({
        deckId: deck.id,
        deckName: deck.name,
        totalCards: cards.length,
        totalAttempts,
        correctAnswers,
        incorrectAnswers,
        accuracy: Math.round(accuracy * 100) / 100
      });
    }

    setDeckStats(stats);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          📊 Statistics
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Track your learning progress and see how well you're mastering Spanish vocabulary.
        </p>
        <button
          onClick={loadStats}
          className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          🔄 Refresh Stats
        </button>
      </div>

      {deckStats.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No study data available yet. Start studying to see your progress!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deckStats.map((stat) => (
            <div key={stat.deckId} className="bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 transform hover:scale-105 transition-all duration-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">📚</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{stat.deckName}</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                  <span className="text-gray-600 font-medium">Total Cards:</span>
                  <span className="font-bold text-lg text-gray-800">{stat.totalCards}</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-50 rounded-xl p-3">
                  <span className="text-gray-600 font-medium">Total Attempts:</span>
                  <span className="font-bold text-lg text-gray-800">{stat.totalAttempts}</span>
                </div>
                
                <div className="flex justify-between items-center bg-green-50 rounded-xl p-3">
                  <span className="text-gray-600 font-medium">✅ Correct:</span>
                  <span className="font-bold text-lg text-green-600">{stat.correctAnswers}</span>
                </div>
                
                <div className="flex justify-between items-center bg-red-50 rounded-xl p-3">
                  <span className="text-gray-600 font-medium">❌ Incorrect:</span>
                  <span className="font-bold text-lg text-red-600">{stat.incorrectAnswers}</span>
                </div>
                
                <div className="flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                  <span className="text-gray-700 font-bold text-lg">🎯 Accuracy:</span>
                  <span className={`font-bold text-2xl ${
                    stat.accuracy >= 80 ? 'text-green-600' : 
                    stat.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stat.accuracy}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Global Stats */}
      {deckStats.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl p-8 border border-blue-200">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">📈 Overall Statistics</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {deckStats.reduce((sum, stat) => sum + stat.totalCards, 0)}
              </div>
              <div className="text-gray-600 font-semibold">📚 Total Cards</div>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {deckStats.reduce((sum, stat) => sum + stat.totalAttempts, 0)}
              </div>
              <div className="text-gray-600 font-semibold">🎯 Total Attempts</div>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {deckStats.reduce((sum, stat) => sum + stat.correctAnswers, 0)}
              </div>
              <div className="text-gray-600 font-semibold">✅ Correct Answers</div>
            </div>
            
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                {deckStats.length > 0 
                  ? Math.round((deckStats.reduce((sum, stat) => sum + stat.accuracy, 0) / deckStats.length) * 100) / 100
                  : 0
                }%
              </div>
              <div className="text-gray-600 font-semibold">🏆 Average Accuracy</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
