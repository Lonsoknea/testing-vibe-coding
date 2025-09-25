import { test, expect } from '@playwright/test';

async function createDeck(page, name: string) {
  await page.goto('/');
  await page.getByRole('button', { name: /create new deck/i }).click();
  await page.getByLabel(/deck name/i).fill(name);
  await page.getByRole('button', { name: /create deck/i }).click();
  await expect(page.getByText(name)).toBeVisible();
}

async function openDeck(page, deckName: string) {
  const deckTile = page.locator('div').filter({ hasText: deckName }).first();
  await expect(deckTile).toBeVisible();
  await deckTile.getByRole('link', { name: /open/i }).click();
  await expect(page.getByRole('heading', { name: deckName })).toBeVisible();
}

async function addCard(page, deckName: string, spanish: string, english: string) {
  await openDeck(page, deckName);
  await page.getByRole('button', { name: '➕ Add Card' }).click();
  await page.getByLabel(/spanish word/i).fill(spanish);
  await page.getByLabel(/english translation/i).fill(english);
  const form = page.locator('form').filter({ has: page.getByLabel(/english translation/i) }).first();
  await form.getByRole('button', { name: /add card/i }).click();
  // Verify within the created card tile
  const cardTile = page.locator('div').filter({ hasText: spanish }).first();
  await expect(cardTile).toBeVisible();
  await expect(cardTile.getByText(english, { exact: true })).toBeVisible();
}

test('create deck, add card, study flow, quiz, stats', async ({ page }) => {
  const deckName = `Deck ${Math.random().toString(36).slice(2, 7)}`;
  const spanish = 'hola';
  const english = 'hello';

  // Home: create deck
  await createDeck(page, deckName);

  // Deck: add card
  await addCard(page, deckName, spanish, english);

  // Study: flip and mark right
  await page.getByRole('link', { name: /study/i }).click();
  // Flip card by clicking the spanish heading
  await page.getByRole('heading', { name: spanish }).click();
  await expect(page.getByText(/how did you do\?/i)).toBeVisible();
  // Mark right
  await page.getByRole('button', { name: /right \(r\)/i }).click();
  // End of session navigates back or shows completion
  await expect(page.getByText(/study session complete/i)).toBeVisible({ timeout: 5000 }).catch(async () => {
    // In case of auto-navigation back to deck
    await expect(page.getByText(deckName)).toBeVisible();
  });

  // Quiz: take MCQ
  await page.getByRole('link', { name: /quiz/i }).click();
  await expect(page.getByText(spanish)).toBeVisible();
  // Select the correct option if present; otherwise pick first
  const correctOption = page.getByRole('button', { name: english, exact: false });
  if (await correctOption.isVisible().catch(() => false)) {
    await correctOption.click();
  } else {
    const firstOption = page.locator('button').filter({ hasText: /.*/ }).first();
    await firstOption.click();
  }
  await page.getByRole('button', { name: /next/i }).click();
  await expect(page.getByText(/quiz complete/i)).toBeVisible();

  // Stats: verify deck appears with totals, scoped to the specific deck card
  await page.goto('/stats');
  const deckHeading = page.getByRole('heading', { name: deckName });
  await expect(deckHeading).toBeVisible();
  // Select nearest card container ancestor for the heading
  const deckCard = deckHeading.locator('xpath=ancestor::div[contains(@class,"shadow-lg")][1]');
  await expect(deckCard).toBeVisible();
  await expect(deckCard.getByText('Total Attempts:')).toBeVisible();
  await expect(deckCard.getByText('✅ Correct:')).toBeVisible();
  await expect(deckCard.getByText('❌ Incorrect:')).toBeVisible();
});
