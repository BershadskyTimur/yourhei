import { expect, test } from '@playwright/test';

// The data comes from the database: Italy has institutions but (so far) no programmes.

test.describe('catalog', () => {
  test('a country without programmes explains it and offers the institutions of the country', async ({ page }) => {
    await page.goto('/en/catalog');
    await expect(page.getByRole('tab', { name: 'Programmes' })).toBeVisible();
    await page.getByLabel('Country').selectOption('IT');
    await page.getByRole('button', { name: 'Show', exact: true }).click();
    await expect(page.getByText(/Many countries have no programme data/)).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Show institutions' }).click();
    await expect(page.getByRole('tab', { name: 'Institutions' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('main ul li').first()).toBeVisible({ timeout: 30_000 });
    await expect(page.locator('main ul li').first()).toContainText('Italy');
  });
});
