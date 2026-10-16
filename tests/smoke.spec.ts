import { expect, test, type Page } from '@playwright/test';

const reviewPath = '/campaigns/camp-noura/review';
const originalTitle = 'Noura introduces a calmer way for teams to find shared knowledge';
const storageKey = 'pr-review-studio:state:v1';

async function openReview(page: Page) {
  await page.goto(reviewPath);
  await expect(page.getByRole('heading', { name: 'Content review', exact: true })).toBeVisible();
}

test('create, edit, save, review and approve; a later edit invalidates approval', async ({ page }) => {
  await page.goto('/campaigns');
  await page.getByRole('button', { name: 'New campaign', exact: true }).click();
  const create = page.getByRole('dialog');
  await create.getByRole('button', { name: 'Create campaign', exact: true }).click();
  await expect(create.getByText('Use at least 3 characters.', { exact: true })).toBeVisible();
  await expect(create.getByText('Add a brief of at least 20 characters.', { exact: true })).toBeVisible();
  await create.getByLabel('Campaign name', { exact: true }).fill('Cedar knowledge launch');
  await create.getByLabel('Campaign brief', { exact: true }).fill('Introduce a fictional knowledge library for small teams in Jordan.');
  await create.getByLabel('Target market', { exact: true }).fill('Jordan');
  await create.getByLabel('Content language', { exact: true }).selectOption('en');
  await create.getByRole('button', { name: 'Create campaign', exact: true }).click();
  await expect(page).toHaveURL(/\/campaigns\/camp-[\w-]+\/review$/);
  await expect(page.getByRole('heading', { name: 'Cedar knowledge launch — press release draft' })).toBeVisible();

  await page.getByRole('button', { name: 'Edit draft', exact: true }).click();
  await page.getByLabel('Document title', { exact: true }).fill('Cedar introduces a shared knowledge library');
  await page.getByLabel('Paragraph 1', { exact: true }).fill('AMMAN — Cedar is a fictional library concept helping small teams organize their project knowledge.');
  await expect(page.getByRole('button', { name: 'Request review', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Save version', exact: true }).click();
  await expect(page.getByText('All changes saved', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Request review', exact: true }).click();
  await page.getByRole('button', { name: 'Approve draft', exact: true }).click();
  await expect(page.getByText('Approved by you', { exact: false })).toBeVisible();

  await page.getByRole('button', { name: 'Edit draft', exact: true }).click();
  await page.getByLabel('Document title', { exact: true }).fill('Cedar introduces a calmer knowledge library');
  await expect(page.getByText('Approved by you', { exact: false })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Request review', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Save version', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Request review', exact: true })).toBeEnabled();
  await page.getByRole('tab', { name: 'Versions 3', exact: true }).click();
  await expect(page.getByRole('tabpanel', { name: 'Versions 3', exact: true })).toBeVisible();
});

test('simulated rewrite cancellation and discard preserve text; apply changes it explicitly', async ({ page }) => {
  await page.clock.install();
  await openReview(page);
  const paragraph = page.getByRole('button', { name: /^Select paragraph 1:/ });
  const original = await paragraph.textContent();
  await page.getByRole('button', { name: 'Make concise Fewer words, same meaning', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel generation', exact: true }).click();
  await page.clock.runFor(3000);
  await page.clock.resume();
  await expect(page.getByText('Rewrite canceled. Your draft is unchanged.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply', exact: true })).toHaveCount(0);
  await expect(paragraph).toHaveText(original!);

  await page.getByRole('button', { name: 'Make concise Fewer words, same meaning', exact: true }).click();
  await page.getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(paragraph).toHaveText(original!);
  await expect(page.getByRole('button', { name: 'Save version', exact: true })).toBeDisabled();

  await page.getByRole('button', { name: 'Make concise Fewer words, same meaning', exact: true }).click();
  await page.getByRole('button', { name: 'Apply', exact: true }).click();
  await expect(paragraph).toHaveText('AMMAN, Jordan — Noura, a fictional workspace concept, introduced a shared hub for small teams to organize notes, decisions, and resources.');
  await expect(page.getByText('Unsaved edits', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save version', exact: true }).click();
  await page.getByRole('tab', { name: 'Compare', exact: true }).click();
  await expect(page.getByRole('tabpanel', { name: 'Compare', exact: true })).toBeVisible();
});

test('a stale proposal cannot overwrite a paragraph edited during generation', async ({ page }) => {
  await openReview(page);
  await page.getByRole('button', { name: 'Make formal A more professional tone', exact: true }).click();
  await page.getByRole('button', { name: 'Edit draft', exact: true }).click();
  const manualText = 'This is a human-authored paragraph that must remain intact.';
  await page.getByLabel('Paragraph 1', { exact: true }).fill(manualText);
  await expect(page.getByRole('button', { name: 'Apply', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(page.getByLabel('Paragraph 1', { exact: true })).toHaveValue(manualText);
  await page.getByRole('button', { name: 'Simplify Clear and easy to follow', exact: true }).click();
  await expect(page.getByText(/This custom text is outside the simulation/)).toBeVisible();
  await expect(page.getByLabel('Paragraph 1', { exact: true })).toHaveValue(manualText);
});

test('navigation cancels generation and retains unsaved edits within the session', async ({ page }) => {
  const browserErrors: string[] = [];
  page.on('pageerror', error => browserErrors.push(error.message));
  await page.clock.install();
  await openReview(page);
  await page.getByRole('button', { name: 'Edit draft', exact: true }).click();
  await page.getByLabel('Document title', { exact: true }).fill('An unsaved editorial title');
  await page.getByRole('button', { name: 'Make concise Fewer words, same meaning', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cancel generation', exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'Overview', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your newsroom, in focus.', exact: true })).toBeVisible();
  await page.clock.runFor(3000);
  await page.clock.resume();
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: /^Content review/ }).click();
  await expect(page.getByRole('heading', { name: 'An unsaved editorial title', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cancel generation', exact: true })).toHaveCount(0);
  await expect.poll(() => page.evaluate(key => JSON.parse(localStorage.getItem(key)!).agents.find((agent: { id: string }) => agent.id === 'writer').runs, storageKey)).toBe(4);
  expect(browserErrors).toEqual([]);
});

test('saved content and agent state survive reload; reset restores the seed', async ({ page }) => {
  await openReview(page);
  await page.getByRole('button', { name: 'Edit draft', exact: true }).click();
  await page.getByLabel('Document title', { exact: true }).fill('A saved editorial title');
  await page.getByRole('button', { name: 'Save version', exact: true }).click();
  await expect(page.getByText('All changes saved', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A saved editorial title', exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: 'AI agents', exact: true }).click();
  await page.getByRole('button', { name: 'Pause Writer', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Resume Writer', exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link', { name: /^Content review/ }).click();
  await expect(page.getByRole('button', { name: 'Make concise Fewer words, same meaning', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Keep my work', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'A saved editorial title', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Reset demo', exact: true }).click();
  await expect(page.getByRole('heading', { name: originalTitle, exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Make concise Fewer words, same meaning', exact: true })).toBeEnabled();
  await expect(page.getByRole('tab', { name: 'Versions 2', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: originalTitle, exact: true })).toBeVisible();
});

test('English and Arabic direction switching works with mobile navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page).toHaveURL(reviewPath);
  await expect(page.getByRole('heading', { name: 'Content review', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Switch to Arabic', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.getByRole('heading', { name: 'مراجعة المحتوى', exact: true })).toBeVisible();
  await expect(page.getByRole('article')).toHaveAttribute('dir', 'ltr');
  await page.getByRole('button', { name: 'فتح التنقل', exact: true }).click();
  const navigation = page.getByRole('dialog');
  await expect(navigation).toBeVisible();
  await navigation.getByRole('link', { name: 'الحملات', exact: true }).click();
  await expect(navigation).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'الحملات', exact: true })).toBeVisible();
  await expect(page.getByRole('main')).toBeFocused();
  await page.getByRole('button', { name: 'حملة جديدة', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveAttribute('dir', 'rtl');
  await page.getByRole('dialog').getByRole('button', { name: 'إلغاء', exact: true }).click();
  await expect(page.getByRole('button', { name: 'حملة جديدة', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Switch to English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('navigation', { name: 'Main navigation', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open navigation', exact: true })).toBeFocused();
});
