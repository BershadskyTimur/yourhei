import { expect, test } from '@playwright/test';
import { fakeSignIn } from './helpers';

// The ad places (and the word "Advertisement") are shown to administrators only, until real ads fill them.

const places = (page: import('@playwright/test').Page) => page.locator('[data-ad-slot]');
const visibleCount = (page: import('@playwright/test').Page) =>
  places(page).evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length);

test.use({ viewport: { width: 1440, height: 900 } });

test.describe('ad places', () => {
  test('a guest sees none, and the map is not narrowed by empty columns', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('#map')).toBeAttached();
    expect(await visibleCount(page)).toBe(0);
    await expect(page.locator(':text-is("Advertisement"):visible')).toHaveCount(0); // present in the page, but hidden
    const box = await page.locator('#map').boundingBox();
    expect(box!.width).toBeGreaterThan(1100); // the whole width, not three fifths
  });

  test('an ordinary account sees none', async ({ page }) => {
    await fakeSignIn(page, { id: 'u1', role: 'user' });
    await page.goto('/en');
    await expect(page.getByRole('link', { name: 'My list' })).toBeVisible();
    expect(await visibleCount(page)).toBe(0);
  });

  test('an administrator sees them', async ({ page }) => {
    await fakeSignIn(page, { id: 'u1', role: 'admin' });
    await page.goto('/en');
    await expect.poll(() => visibleCount(page)).toBeGreaterThan(0);
    await expect(page.locator('html')).toHaveAttribute('data-ads', 'on');
  });

  test('institution pages and the catalog have no empty side columns for a guest', async ({ page }) => {
    await page.goto('/en/scholarships');
    expect(await visibleCount(page)).toBe(0);
  });
});
