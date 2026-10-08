import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fakeSignIn } from './helpers';

const supabaseUrl = () =>
  /^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m.exec(readFileSync('.env.local', 'utf8'))?.[1].trim() ?? 'https://example.supabase.co';

const programme = (n: number, extra: Record<string, unknown> = {}) => ({
  id: `00000000-0000-0000-0000-00000000000${n}`,
  names: { en: `Law ${n}` },
  level: 'bachelor',
  isced_f: '0421',
  languages: ['en'],
  duration_years: 4,
  free: false,
  tuition: [{ amount: 3000, currency: 'USD', period: 'year', applies_to: 'international' }],
  institutions: { id: `10000000-0000-0000-0000-00000000000${n}`, slug: `uni-${n}`, type: 'university', country: 'GE', city: { en: 'Tbilisi' }, names: { en: `University ${n}` } },
  ...extra,
});

test.describe('catalog', () => {
  test('lists programmes with a price and sends the chosen filters to the database', async ({ page }) => {
    const calls: Record<string, unknown>[] = [];
    await page.route(`${supabaseUrl()}/rest/v1/rpc/catalog_programs**`, async (route) => {
      calls.push(route.request().postDataJSON());
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([programme(1), programme(2, { free: true, tuition: [] })]) });
    });
    await page.route(`${supabaseUrl()}/rest/v1/country_data**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.goto('/en/catalog');
    await expect(page.getByText('Law 1')).toBeVisible();
    await expect(page.getByText('University 1')).toBeVisible();
    await expect(page.getByText('$3,000 per year')).toBeVisible();
    await expect(page.getByText('Free', { exact: true })).toBeVisible();

    await page.getByLabel('Country').selectOption('GE');
    await page.getByLabel('Level').selectOption('bachelor');
    await page.getByRole('button', { name: 'Show', exact: true }).click();
    await expect.poll(() => calls.at(-1)).toMatchObject({ p_country: 'GE', p_level: 'bachelor' });
  });

  test('says so when nothing is found', async ({ page }) => {
    await page.route(`${supabaseUrl()}/rest/v1/rpc/catalog_programs**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.route(`${supabaseUrl()}/rest/v1/country_data**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.goto('/en/catalog');
    await expect(page.getByText('Nothing found. Try fewer filters.')).toBeVisible();
  });

  test('shows an error instead of a blank page when the database fails', async ({ page }) => {
    await page.route(`${supabaseUrl()}/rest/v1/rpc/catalog_programs**`, (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"boom"}' }));
    await page.route(`${supabaseUrl()}/rest/v1/country_data**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.goto('/en/catalog');
    await expect(page.getByRole('alert')).toBeVisible();
  });
});

test.describe('shared results and institution account', () => {
  test('a shared list opens by its link and groups the programmes', async ({ page }) => {
    const token = '5b7e3f1a-1111-4222-8333-444455556666';
    await page.route(`${supabaseUrl()}/rest/v1/rpc/get_shared_matches**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ created_at: '2026-10-01T10:00:00Z', items: [{ names: { en: 'Law' }, institution: { en: 'Tbilisi University' }, country: 'GE', slug: 'tbilisi', score: 91, group: 'safe', level: 'bachelor' }] }),
      }),
    );
    await page.goto(`/en/shared/${token}`);
    await expect(page.getByText('Tbilisi University')).toBeVisible();
    await expect(page.getByText('91%')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Take the survey' })).toBeVisible();
  });

  test('an unknown link says the list does not exist', async ({ page }) => {
    await page.route(`${supabaseUrl()}/rest/v1/rpc/get_shared_matches**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: 'null' }));
    await page.goto('/en/shared/5b7e3f1a-1111-4222-8333-444455556666');
    await expect(page.getByText('This list does not exist')).toBeVisible();
  });

  test('a guest is sent to the login page from the institution account', async ({ page }) => {
    await page.goto('/en/cabinet');
    await expect(page).toHaveURL(/\/login/);
  });

  test('a person without an approved institution is told how to get access', async ({ page }) => {
    await fakeSignIn(page, { id: 'u1', role: 'user' });
    await page.route(`${supabaseUrl()}/rest/v1/institution_reps**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
    await page.goto('/en/cabinet');
    await expect(page.getByText('You do not manage any institution yet')).toBeVisible();
  });
});

test.describe('new languages', () => {
  for (const locale of ['ar', 'de', 'fr', 'pl', 'tr', 'az', 'uz', 'ky'] as const) {
    test(`/${locale}: catalog page fits the screen`, async ({ page }) => {
      await page.route(`${supabaseUrl()}/rest/v1/**`, (route) => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
      await page.goto(`/${locale}/catalog`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      await expect(page.locator('html')).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr');
    });
  }
});
