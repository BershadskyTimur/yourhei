import { expect, test } from '@playwright/test';

test.describe('trust: data sources page and the machine-translation notice', () => {
  test('the data sources page opens, lists the sources and is linked from the footer', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: 'Data sources' }).click();
    await expect(page).toHaveURL(/\/en\/methodology$/);
    await expect(page.getByRole('heading', { name: 'Where our data comes from' })).toBeVisible();
    await expect(page.getByRole('link', { name: /CRICOS/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /Discover Uni/ })).toBeVisible();
  });

  test('the notice is shown in a machine-translated language, can be closed and stays closed', async ({ page }) => {
    await page.goto('/ka');
    const notice = page.getByRole('note');
    await expect(notice).toBeVisible();
    await notice.getByRole('button').click();
    await expect(notice).toBeHidden();
    await page.reload();
    await expect(page.getByRole('note')).toHaveCount(0);
  });

  test('no notice in Russian or English', async ({ page }) => {
    for (const l of ['ru', 'en']) {
      await page.goto(`/${l}`);
      await expect(page.getByRole('link', { name: l === 'ru' ? 'Откуда данные' : 'Data sources' })).toBeVisible();
      await expect(page.getByRole('note')).toHaveCount(0);
    }
  });

  test('a programme card names its source and links to the data sources page', async ({ page }) => {
    await page.goto('/en/institutions/tr/bilkent-university');
    await expect(page.getByText("Source: The universities' own websites").first()).toBeVisible();
    await page.getByRole('link', { name: 'How we collect data' }).first().click();
    await expect(page).toHaveURL(/\/en\/methodology$/);
  });

  test('the data sources page fits the screen in every language', async ({ page }) => {
    for (const l of ['ru', 'ka', 'ar', 'zh', 'de', 'hy', 'uz']) {
      await page.goto(`/${l}/methodology`);
      await expect(page.locator('h1')).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, l).toBeLessThanOrEqual(1);
    }
  });

  test('the page for institutions opens from the footer and leads to the institution account', async ({ page }) => {
    await page.goto('/en');
    await page.getByRole('link', { name: 'For institutions' }).click();
    await expect(page).toHaveURL(/\/en\/for-institutions$/);
    await expect(page.getByRole('heading', { name: 'For universities, colleges and schools' })).toBeVisible();
    await page.getByRole('link', { name: 'Open my institution account' }).click();
    await expect(page).toHaveURL(/\/en\/(cabinet|login)/);
  });
});
