import { useState, useEffect, useCallback } from 'react';
import type { Deck } from '../types';
import { db } from '../services/database';

interface UseDeckResult {
  deck: Deck | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing deck data
 * @param deckId - The ID of the deck to load
 * @returns Object containing deck data, loading state, error, and refetch function
 */
export function useDeck(deckId: string | undefined): UseDeckResult {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDeck = useCallback(async () => {
    if (!deckId) {
      setDeck(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const decks = await db.getDecks();
      const foundDeck = decks.find(d => d.id === deckId);
      setDeck(foundDeck || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deck');
      setDeck(null);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  return {
    deck,
    loading,
    error,
    refetch: loadDeck,
  };
}
