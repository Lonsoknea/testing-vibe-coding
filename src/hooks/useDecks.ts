import { useState, useEffect, useCallback } from 'react';
import type { Deck } from '../types';
import { db } from '../services/database';

interface UseDecksResult {
  decks: Deck[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing decks data
 * @returns Object containing decks data, loading state, error, and refetch function
 */
export function useDecks(): UseDecksResult {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const decksData = await db.getDecks();
      setDecks(decksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load decks');
      setDecks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  return {
    decks,
    loading,
    error,
    refetch: loadDecks,
  };
}
