export type ID = string;

export interface Card {
  id: ID;
  deckId: ID;
  spanish: string;
  english: string | string[];
  partOfSpeech?: string;
  gender?: 'm' | 'f' | 'n' | string;
  example?: string;
  tags?: string[];
  audioUrl?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt?: string;
  needsReview?: boolean;
}

export interface Deck {
  id: ID;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CardStat {
  cardId: ID;
  attempts: number;
  correct: number;
  incorrect: number;
  lastSeen?: string;
  history?: { at: string; correct: boolean }[];
}

export interface StudySession {
  id: ID;
  deckId: ID;
  startTime: string;
  endTime?: string;
  cardsStudied: ID[];
  cardsMarkedWrong: ID[];
}
