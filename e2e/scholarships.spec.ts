import { expect, test } from '@playwright/test';

// The list comes from the database; these tests do not depend on which programmes are in it.

test.describe('scholarships page', () => {
  test('filters by level and by citizenship', async ({ page }) => {
    await page.goto('/en/scholarships');
    const cards = page.locator('main li:has(h3)');
    await expect(cards.first()).toBeVisible();
    const all = await cards.count();

    // a level that no programme has gives the empty message; a real one never shows more than all
    await page.locator('#sch-level').selectOption('phd');
    expect(await cards.count()).toBeLessThanOrEqual(all);
    await page.locator('#sch-level').selectOption('');
    expect(await cards.count()).toBe(all);

    // with a citizenship every programme says whether it is open (yes / no / check the official page)
    await page.locator('#sch-citizenship').selectOption('KZ');
    await expect(cards.first().locator('[data-eligibility]')).toBeVisible();
    expect(await cards.count()).toBeLessThanOrEqual(all);
    await page.getByLabel('Hide programmes that are closed to my citizenship').uncheck();
    expect(await cards.count()).toBe(all);
  });

  test('fits the screen in every language', async ({ page }) => {
    for (const l of ['ru', 'ka', 'ar', 'zh', 'de', 'hy', 'uz', 'kk']) {
      await page.goto(`/${l}/scholarships`);
      await expect(page.locator('#sch-citizenship')).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, l).toBeLessThanOrEqual(1);
    }
  });
});
