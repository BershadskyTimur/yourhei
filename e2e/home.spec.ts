import { expect, test } from '@playwright/test';

const LOCALES = ['ru', 'en', 'ka', 'es', 'zh'] as const;

test.describe('home page in every language', () => {
  for (const locale of LOCALES) {
    test(`/${locale}: page, legend, map, no horizontal scroll`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto(`/${locale}`);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('#legend-label + ul > li')).toHaveCount(6);
      await expect(page.locator('[data-map-ready="true"]')).toBeVisible();
      await expect(page.locator('footer a')).toHaveCount(4);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, 'horizontal overflow in px').toBeLessThanOrEqual(0);
      expect(errors).toEqual([]);
    });
  }
});

test('language switcher changes the URL and the text', async ({ page }) => {
  await page.goto('/en');
  await page.getByRole('combobox', { name: 'Language' }).selectOption('ka');
  await expect(page).toHaveURL(/\/ka$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ka');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('იპოვეთ, სად ისწავლოთ');
});

test('the first visit follows the browser language', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'es-ES' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page).toHaveURL(/\/es$/);
  await context.close();
});

test('theme toggle switches light and dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/en');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'light');
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(await bg()).toBe('rgb(255, 255, 255)');

  await page.getByRole('button', { name: /Switch light/ }).click();
  await expect(html).toHaveAttribute('data-theme', 'dark');
  expect(await bg()).toBe('rgb(17, 17, 17)');
  await expect(page.locator('[data-map-ready="true"]')).toBeVisible();
});

test('type filter hides and shows institutions', async ({ page }) => {
  await page.goto('/en');
  const status = page.locator('[aria-live="polite"]');
  await expect(status).toContainText('45 of 45');

  const schools = page.getByRole('button', { name: /^School/ });
  await schools.click();
  await expect(schools).toHaveAttribute('aria-pressed', 'false');
  await expect(status).toContainText('32 of 45');

  await schools.click();
  await expect(status).toContainText('45 of 45');
});

test('search finds an institution, opens its card and the details page', async ({ page }) => {
  await page.goto('/en');
  await page.getByLabel('Search by name or city').fill('Ilia State');
  await page.getByRole('button', { name: /Ilia State University/ }).click();

  const card = page.getByRole('dialog');
  await expect(card).toContainText('Ilia State University');
  await expect(card).toContainText('Georgia');
  await card.getByRole('link', { name: 'Details' }).click();

  await expect(page).toHaveURL(/\/en\/institutions\/ge\/ilia-state-university$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ilia State University');
  await expect(page.getByText('Detailed data will appear soon.')).toBeVisible();
});

test('search with no match says so', async ({ page }) => {
  await page.goto('/en');
  await page.getByLabel('Search by name or city').fill('zzzzzz');
  await expect(page.getByText('Nothing found')).toBeVisible();
});

test('unknown address shows the translated not-found page', async ({ page }) => {
  await page.goto('/ru/no-such-page');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Страница не найдена');
});

test('footer pages and placeholders open', async ({ page }) => {
  for (const [path, title] of [
    ['/en/privacy', 'Privacy policy'],
    ['/en/terms', 'Terms of use'],
    ['/en/about', 'About the project'],
    ['/en/contact', 'Contact & support'],
    ['/en/login', 'Log in'],
    ['/en/register', 'Create your account'],
    ['/en/forgot-password', 'Reset your password'],
  ] as const) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  }
});
