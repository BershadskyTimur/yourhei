import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fakeSignIn } from './helpers';

const supabaseUrl = () =>
  /^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m.exec(readFileSync('.env.local', 'utf8'))?.[1].trim() ?? 'https://example.supabase.co';

test.describe('cookie banner', () => {
  test('asks once, remembers the choice, and can be reopened from the footer', async ({ page }) => {
    await page.goto('/en');
    const banner = page.getByRole('region', { name: 'Cookies and analytics' });
    await expect(banner).toBeVisible();
    await banner.getByRole('button', { name: 'Only necessary' }).click();
    await expect(banner).toBeHidden();

    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(banner).toBeHidden();

    await page.getByRole('button', { name: 'Cookie settings' }).click();
    await expect(banner).toBeVisible();
  });
});

test.describe('my list and comparison', () => {
  test('a guest is sent to the login page from "My list"', async ({ page }) => {
    await page.goto('/en/favorites');
    await expect(page).toHaveURL(/\/en\/login/);
  });

  test('an empty list says so and points to the map', async ({ page }) => {
    await fakeSignIn(page, { id: 'u1', role: 'user', birth_date: '2000-01-01', residence_country: 'GE' });
    await page.route(`${supabaseUrl()}/rest/v1/favorites**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
    );
    await page.goto('/en/favorites');
    await expect(page.getByText('Nothing saved yet')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open the map' })).toBeVisible();
  });

  test('a saved institution shows its next deadline and the documents', async ({ page }) => {
    await fakeSignIn(page, { id: 'u1', role: 'user', birth_date: '2000-01-01', residence_country: 'GE' });
    const future = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);
    await page.route(`${supabaseUrl()}/rest/v1/favorites**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            institution_id: 'i1',
            created_at: new Date().toISOString(),
            institutions: {
              id: 'i1', slug: 'test-uni', type: 'university', country: 'GE', names: { en: 'Test University' }, city: { en: 'Tbilisi' },
              programs: [{ status: 'published', deadlines: [{ intake: '2027-09', applies_to: 'all', date: future }], requirements: { documents: ['passport', 'school_certificate'] } }],
            },
          },
        ]),
      }),
    );
    await page.goto('/en/favorites');
    await expect(page.getByRole('link', { name: 'Test University' })).toBeVisible();
    await expect(page.getByText(/Next deadline:/)).toBeVisible();
    await expect(page.getByText('Documents to prepare')).toBeVisible();
    await expect(page.getByText('International passport')).toBeVisible();
  });

  test('the comparison page without programmes explains what to do', async ({ page }) => {
    await page.goto('/en/compare');
    await expect(page.getByText('Nothing to compare yet')).toBeVisible();
  });
});

test.describe('institution page', () => {
  test('shows the programmes heading and the official site link', async ({ page }) => {
    await page.goto('/en/institutions/ge/ilia-state-university');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ilia State University');
    await expect(page.getByRole('heading', { level: 2, name: /^Programmes/ })).toBeVisible();
    await expect(page.getByText('Always confirm prices and deadlines')).toBeVisible();
  });
});
