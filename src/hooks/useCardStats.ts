import { useState, useCallback } from 'react';
import type { Card, CardStat } from '../types';
import { db } from '../services/database';

interface UseCardStatsResult {
  saveCardStat: (card: Card, correct: boolean) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for managing card statistics
 * @returns Object containing saveCardStat function, loading state, and error
 */
export function useCardStats(): UseCardStatsResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveCardStat = useCallback(async (card: Card, correct: boolean) => {
    setLoading(true);
    setError(null);

    try {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save card statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    saveCardStat,
    loading,
    error,
  };
}
