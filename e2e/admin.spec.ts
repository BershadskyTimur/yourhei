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
    await expect(page.getByRole('tab')).toHaveCount(5);
    await expect(page.getByText('42')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Admin' })).toBeVisible();
  });
});
