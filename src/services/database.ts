import localforage from 'localforage';
import type { Deck, Card, CardStat, StudySession } from '../types';

// Configure localforage
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'SpanishFlashcards',
  version: 1.0,
  storeName: 'flashcards'
});

export class DatabaseError extends Error {
  constructor(message: string, public operation: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class DatabaseService {
  private static instance: DatabaseService;
  
  private constructor() {}
  
  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async handleDatabaseOperation<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown database error';
      throw new DatabaseError(`${operationName} failed: ${message}`, operationName);
    }
  }

  // Deck operations
  async getDecks(): Promise<Deck[]> {
    return this.handleDatabaseOperation(async () => {
      const decks = await localforage.getItem<Deck[]>('decks');
      return decks || [];
    }, 'getDecks');
  }

  async saveDeck(deck: Deck): Promise<void> {
    return this.handleDatabaseOperation(async () => {
      const decks = await this.getDecks();
      const existingIndex = decks.findIndex(d => d.id === deck.id);
      
      if (existingIndex >= 0) {
        decks[existingIndex] = { ...deck, updatedAt: new Date().toISOString() };
      } else {
        decks.push(deck);
      }
      
      await localforage.setItem('decks', decks);
    }, 'saveDeck');
  }

  async deleteDeck(deckId: string): Promise<void> {
    return this.handleDatabaseOperation(async () => {
      const decks = await this.getDecks();
      const filteredDecks = decks.filter(d => d.id !== deckId);
      await localforage.setItem('decks', filteredDecks);
      
      // Also delete all cards in this deck
      const cards = await this.getCards(deckId);
      for (const card of cards) {
        await this.deleteCard(card.id);
      }
    }, 'deleteDeck');
  }

  // Card operations
  async getCards(deckId: string): Promise<Card[]> {
    return this.handleDatabaseOperation(async () => {
      const cards = await localforage.getItem<Card[]>('cards');
      return (cards || []).filter(c => c.deckId === deckId);
    }, 'getCards');
  }

  async saveCard(card: Card): Promise<void> {
    return this.handleDatabaseOperation(async () => {
      const cards = await localforage.getItem<Card[]>('cards') || [];
      const existingIndex = cards.findIndex(c => c.id === card.id);
      
      if (existingIndex >= 0) {
        cards[existingIndex] = { ...card, updatedAt: new Date().toISOString() };
      } else {
        cards.push(card);
      }
      
      await localforage.setItem('cards', cards);
    }, 'saveCard');
  }

  async deleteCard(cardId: string): Promise<void> {
    return this.handleDatabaseOperation(async () => {
      const cards = await localforage.getItem<Card[]>('cards') || [];
      const filteredCards = cards.filter(c => c.id !== cardId);
      await localforage.setItem('cards', filteredCards);
      
      // Also delete card stats
      await this.deleteCardStat(cardId);
    }, 'deleteCard');
  }

  // Card stats operations
  async getCardStats(cardId: string): Promise<CardStat | null> {
    return this.handleDatabaseOperation(async () => {
      const stats = await localforage.getItem<CardStat[]>('cardStats') || [];
      return stats.find(s => s.cardId === cardId) || null;
    }, 'getCardStats');
  }

  async saveCardStat(cardStat: CardStat): Promise<void> {
    return this.handleDatabaseOperation(async () => {
      const stats = await localforage.getItem<CardStat[]>('cardStats') || [];
      const existingIndex = stats.findIndex(s => s.cardId === cardStat.cardId);
      
      if (existingIndex >= 0) {
        stats[existingIndex] = cardStat;
      } else {
        stats.push(cardStat);
      }
      
      await localforage.setItem('cardStats', stats);
    }, 'saveCardStat');
  }

  async deleteCardStat(cardId: string): Promise<void> {
    return this.handleDatabaseOperation(async () => {
      const stats = await localforage.getItem<CardStat[]>('cardStats') || [];
      const filteredStats = stats.filter(s => s.cardId !== cardId);
      await localforage.setItem('cardStats', filteredStats);
    }, 'deleteCardStat');
  }

  // Study session operations
  async saveStudySession(session: StudySession): Promise<void> {
    return this.handleDatabaseOperation(async () => {
      const sessions = await localforage.getItem<StudySession[]>('sessions') || [];
      sessions.push(session);
      await localforage.setItem('sessions', sessions);
    }, 'saveStudySession');
  }

  async getStudySessions(deckId?: string): Promise<StudySession[]> {
    return this.handleDatabaseOperation(async () => {
      const sessions = await localforage.getItem<StudySession[]>('sessions') || [];
      if (deckId) {
        return sessions.filter(s => s.deckId === deckId);
      }
      return sessions;
    }, 'getStudySessions');
  }
}

export const db = DatabaseService.getInstance();
