import { expect, test } from '@playwright/test';

test.describe('study destinations', () => {
  test('the list opens from the footer and leads to a country guide with official links', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: 'Study destinations' }).click();
    await expect(page).toHaveURL(/\/en\/countries$/);
    await page.getByRole('link', { name: 'Germany' }).click();
    await expect(page).toHaveURL(/\/en\/countries\/de$/);
    await expect(page.getByRole('heading', { name: 'Studying in Germany' })).toBeVisible();
    await expect(page.getByText('140 full days or 280 half days')).toBeVisible();
    // every statement has an official link that opens in a new tab
    const links = page.locator('main a[href^="https://"]');
    expect(await links.count()).toBeGreaterThanOrEqual(3);
    await expect(links.first()).toHaveAttribute('rel', /noopener/);
    await expect(page.getByText(/at least .* per month/)).toBeVisible(); // the visa living minimum
  });

  test('an unknown country is not found', async ({ page }) => {
    const res = await page.goto('/en/countries/xx');
    expect(res?.status()).toBe(404);
  });

  test('an institution page links to the guide of its country', async ({ page }) => {
    await page.goto('/en/institutions/tr/bilkent-university');
    await page.getByRole('link', { name: /Guide: studying in/ }).click();
    await expect(page).toHaveURL(/\/en\/countries\/tr$/);
    await expect(page.getByText('does not include the right to work')).toBeVisible();
  });

  test('the pages fit the screen in every language', async ({ page }) => {
    for (const l of ['ru', 'ka', 'ar', 'zh', 'de', 'hy', 'uz', 'kk']) {
      for (const path of ['/countries', '/countries/gb']) {
        await page.goto(`/${l}${path}`);
        await expect(page.locator('h1')).toBeVisible();
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(overflow, `${l}${path}`).toBeLessThanOrEqual(1);
      }
    }
  });
});
