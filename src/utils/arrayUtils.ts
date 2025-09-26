/**
 * Utility functions for array operations
 */

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array - The array to shuffle
 * @returns A new shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Converts English field to string, handling both string and string[] types
 * @param english - The English field from a card
 * @returns The first English translation as a string
 */
export function toEnglishText(english: string | string[]): string {
  return Array.isArray(english) ? english[0] : english;
}
