import { expect, test } from '@playwright/test';

test.describe('deadline calendar', () => {
  test('the index lists the countries with their deadlines and leads to a country', async ({ page }) => {
    await page.goto('/en/deadlines');
    await expect(page.getByRole('heading', { level: 1, name: 'Application deadlines' })).toBeVisible();
    const germany = page.getByRole('link', { name: /Germany/ });
    await expect(germany).toBeVisible();
    await expect(germany).toContainText('Deadlines:');
    await germany.click();
    await expect(page).toHaveURL(/\/en\/deadlines\/de$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Application deadlines: Germany' })).toBeVisible();
  });

  test('a country page groups the dates by month and links every row to the institution', async ({ page }) => {
    await page.goto('/en/deadlines/nl');
    const months = page.getByRole('heading', { level: 2 });
    expect(await months.count()).toBeGreaterThan(1);
    const first = page.locator('li h3 a').first();
    await expect(first).toHaveAttribute('href', /\/en\/institutions\/nl\/[a-z0-9-]+$/);
    await expect(page.getByText(/Programmes: \d+/).first()).toBeVisible();
    await expect(page.getByText(/always confirm it on the official page/)).toBeVisible();
    // a passed date is never listed
    const dates = await page.locator('main time, article time, li time').evaluateAll((els) => els.map((e) => e.getAttribute('datetime') ?? ''));
    const today = new Date().toISOString().slice(0, 10);
    expect(dates.length).toBeGreaterThan(0);
    for (const d of dates) expect(d >= today).toBe(true);
  });

  test('Russian reads Russian and a language that is not offered to search engines is marked noindex', async ({ page }) => {
    await page.goto('/ru/deadlines/fi');
    await expect(page.getByRole('heading', { level: 1, name: 'Сроки подачи документов: Финляндия' })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', /\/en\/deadlines\/fi$/);
    await page.goto('/ka/deadlines/fi');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('a country without data is a 404', async ({ page }) => {
    expect((await page.goto('/en/deadlines/us'))?.status()).toBe(404);
  });

  test('the footer leads to the calendar', async ({ page }) => {
    await page.goto('/en/catalog');
    await page.locator('footer').getByRole('link', { name: 'Deadlines' }).click();
    await expect(page).toHaveURL(/\/en\/deadlines$/);
  });
});

test.describe('document checklist', () => {
  test('ticks are counted and kept after a reload, and can be cleared', async ({ page }) => {
    await page.goto('/en/checklist');
    await expect(page.getByRole('heading', { level: 1, name: 'Document checklist' })).toBeVisible();
    await expect(page.getByText('0 of 10 ready')).toBeVisible();
    await page.getByLabel('International passport').check();
    await page.getByLabel('Health insurance').check();
    await expect(page.getByText('2 of 10 ready')).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('International passport')).toBeChecked();
    await expect(page.getByText('2 of 10 ready')).toBeVisible();
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByText('0 of 10 ready')).toBeVisible();
    await expect(page.getByLabel('International passport')).not.toBeChecked();
  });

  test('is in Russian too and fits a phone screen', async ({ page }) => {
    await page.goto('/ru/checklist');
    await expect(page.getByRole('heading', { level: 1, name: 'Чек-лист документов' })).toBeVisible();
    await expect(page.getByText('Готово 0 из 10')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
