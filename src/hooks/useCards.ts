import { useState, useEffect, useCallback } from 'react';
import type { Card } from '../types';
import { db } from '../services/database';

interface UseCardsResult {
  cards: Card[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for managing cards data
 * @param deckId - The ID of the deck to load cards from
 * @returns Object containing cards data, loading state, error, and refetch function
 */
export function useCards(deckId: string | undefined): UseCardsResult {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCards = useCallback(async () => {
    if (!deckId) {
      setCards([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardsData = await db.getCards(deckId);
      setCards(cardsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards');
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  return {
    cards,
    loading,
    error,
    refetch: loadCards,
  };
}
