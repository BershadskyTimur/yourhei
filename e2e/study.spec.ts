import { expect, test } from '@playwright/test';
import combos from '../data/generated/study-combos.json';

// Pages "Study <field> in <country>": the pairs come from data/generated/study-combos.json.

const de = (combos as { combos: { country: string; code: string }[] }).combos.filter((c) => c.country === 'DE');

test.describe('study pages', () => {
  test('the hub of a country lists fields and leads to a field page with institutions', async ({ page }) => {
    await page.goto('/en/study/de');
    await expect(page.getByRole('heading', { name: 'Study in Germany: programmes by field' })).toBeVisible();
    const fields = page.locator('main ul li a');
    expect(await fields.count()).toBe(de.length);
    await fields.first().click();
    await expect(page).toHaveURL(/\/en\/study\/de\/\d{3}-/);
    await expect(page.locator('h1')).toContainText('in Germany');
    const institutions = page.locator('main section ul li a');
    await expect(institutions.first()).toBeVisible();
    await institutions.first().click();
    await expect(page).toHaveURL(/\/en\/institutions\/de\//);
  });

  test('a short address goes to the full one, and unknown pairs are not found', async ({ page }) => {
    const first = de[0];
    await page.goto(`/en/study/de/${first.code}`);
    await expect(page).toHaveURL(new RegExp(`/en/study/de/${first.code}-`));
    expect((await page.goto('/en/study/de/999-nothing'))?.status()).toBe(404);
    expect((await page.goto('/en/study/zz'))?.status()).toBe(404);
  });

  test('the country guide links to the programmes by field, and pages fit the screen', async ({ page }) => {
    await page.goto('/en/countries/de');
    await page.getByRole('link', { name: 'Study in Germany: programmes by field' }).click();
    await expect(page).toHaveURL(/\/en\/study\/de$/);
    for (const l of ['ru', 'ka', 'ar', 'zh', 'hy', 'uz']) {
      await page.goto(`/${l}/study/de/${de[0].code}`);
      await expect(page.locator('h1')).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, l).toBeLessThanOrEqual(1);
    }
  });
});
