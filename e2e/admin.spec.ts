import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fakeSignIn } from './helpers';

const supabaseUrl = () =>
  /^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m.exec(readFileSync('.env.local', 'utf8'))?.[1].trim() ??
  'https://example.supabase.co';

test.describe('admin panel', () => {
  test('a guest is asked to log in', async ({ page }) => {
    await page.goto('/en/admin');
    await expect(page.getByRole('link', { name: 'Войти' })).toBeVisible();
  });

  test('a normal user is refused', async ({ page }) => {
    await fakeSignIn(page, { id: 'u1', role: 'user' });
    await page.goto('/en/admin');
    await expect(page.getByText('Нет доступа')).toBeVisible();
    await expect(page.getByRole('tab')).toHaveCount(0);
  });

  test('an admin sees the dashboard and tabs', async ({ page }) => {
    await fakeSignIn(page, { id: 'u1', role: 'admin' });
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_stats**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users: 42, programs_draft: 7 }),
      }),
    );
    await page.goto('/en/admin');
    await expect(page.getByRole('tab')).toHaveCount(9);
    await expect(page.getByText('42')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });

  test('the users tab shows totals, average age and countries', async ({ page }) => {
    await fakeSignIn(page, { id: 'u1', role: 'admin' });
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_stats**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ users: 1 }) }),
    );
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_user_stats**`, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          total: 120, new_7d: 9, new_30d: 40, avg_age: 21.4, with_age: 100, marketing_opt_in: 30,
          age_buckets: [{ label: '18-20', n: 50 }],
          residence_top: [{ country: 'KZ', n: 60, avg_age: 20.1 }],
          signups_by_day: [{ day: '2026-10-01', n: 3 }],
          surveys_started: 80, surveys_completed: 55,
        }),
      }),
    );
    await page.goto('/en/admin');
    await page.getByRole('tab', { name: 'Пользователи' }).click();
    await expect(page.getByText('21.4')).toBeVisible();
    await expect(page.getByRole('definition').filter({ hasText: /^120$/ })).toBeVisible();
    await expect(page.getByText(/ср. возраст 20.1/)).toBeVisible();
  });

  test('the traffic tab explains what is counted', async ({ page }) => {
    await fakeSignIn(page, { id: 'u1', role: 'admin' });
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_stats**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ users: 1 }) }),
    );
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_traffic**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ views: 777, visitors: 321, by_day: [], top_pages: [{ path: '/about', n: 5 }], countries: [], devices: {}, locales: {}, referrers: [] }) }),
    );
    await page.goto('/en/admin');
    await page.getByRole('tab', { name: 'Посещаемость' }).click();
    await expect(page.getByText('777')).toBeVisible();
    await expect(page.getByText(/Принять все/)).toBeVisible();
  });
});