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
    await expect(page.getByRole('tab')).toHaveCount(16);
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

  const asAdmin = async (page: import('@playwright/test').Page) => {
    await fakeSignIn(page, { id: 'u1', role: 'admin' });
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_stats**`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ users: 1 }) }),
    );
  };
  const json = (body: unknown) => ({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });

  test('the data health tab shows coverage by country', async ({ page }) => {
    await asAdmin(page);
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_dh_institutions**`, (route) =>
      route.fulfill(json({ total: 12549, by_country: { DE: 400, CZ: 50 } })),
    );
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_dh_level**`, (route) => route.fulfill(json(600)));
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_dh_drafts**`, (route) => route.fulfill(json(3)));
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_data_health_country**`, (route) => {
      const country = (route.request().postDataJSON() as { p_country: string }).p_country;
      return route.fulfill(json(country === 'DE'
        ? { country: 'DE', institutions_with_programmes: 120, programmes: 1000, priced: 700, with_deadline: 50, with_language: 900, with_field: 950 }
        : { country, institutions_with_programmes: 0, programmes: 0, priced: 0, with_deadline: 0, with_language: 0, with_field: 0 }));
    });
    await page.goto('/en/admin');
    await page.getByRole('tab', { name: 'Здоровье данных' }).click();
    await expect(page.getByRole('cell', { name: 'Германия' })).toBeVisible();
    await expect(page.getByText('70%', { exact: true })).toBeVisible(); // prices: 700 of 1000
    await expect(page.getByText('5%', { exact: true })).toBeVisible(); // deadlines: 50 of 1000
    await expect(page.getByText('120 / 400')).toBeVisible();
    await expect(page.getByText('12 549')).toBeVisible(); // institutions in total
  });

  test('the popular institutions, duplicates and system tabs show their data', async ({ page }) => {
    await asAdmin(page);
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_top_institutions**`, (route) =>
      route.fulfill(json([{ country: 'GE', slug: 'tbilisi-state-university', name: 'Tbilisi State University', views: 55, visitors: 40, clicks: 7 }])),
    );
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_duplicates**`, (route) =>
      route.fulfill(json([{ country: 'GB', name: 'city college', n: 2, items: [{ slug: 'city-college-gb', type: 'college', city: 'London', programmes: 4 }, { slug: 'city-college-2', type: 'college', city: null, programmes: 0 }] }])),
    );
    await page.route(`${supabaseUrl()}/rest/v1/rpc/admin_system**`, (route) =>
      route.fulfill(json({ database_bytes: 450 * 1024 * 1024, tables: [{ name: 'programs', bytes: 300 * 1024 * 1024, rows: 190000 }], events_last_30_days: 1234, users: 17 })),
    );
    await page.route('**/api/health', (route) => route.fulfill(json({ ok: true, ms: 12 })));
    await page.goto('/en/admin');
    await page.getByRole('tab', { name: 'Популярные заведения' }).click();
    await expect(page.getByRole('link', { name: 'Tbilisi State University' })).toBeVisible();
    await page.getByRole('tab', { name: 'Дубликаты' }).click();
    await expect(page.getByText('city-college-2')).toBeVisible();
    await page.getByRole('tab', { name: 'Состояние сайта' }).click();
    await expect(page.getByText(/450 МБ/)).toBeVisible();
    await expect(page.getByText(/почти заполнена/)).toBeVisible(); // 90% of the free plan
    await page.getByRole('button', { name: 'Проверить сейчас' }).click();
    await expect(page.getByRole('status')).toContainText('Всё работает');
  });

  test('error reports can be given a status and a note', async ({ page }) => {
    await asAdmin(page);
    const patches: unknown[] = [];
    await page.route(`${supabaseUrl()}/rest/v1/error_reports**`, (route) => {
      if (route.request().method() === 'PATCH') {
        patches.push(route.request().postDataJSON());
        return route.fulfill({ status: 204, body: '' });
      }
      return route.fulfill(json([{ id: 'r1', created_at: '2026-10-20T10:00:00Z', path: '/en/institutions/de/x', note: 'The website address is wrong', contact: 'a@b.c', locale: 'en', status: 'new', admin_note: null }]));
    });
    await page.goto('/en/admin');
    await page.getByRole('tab', { name: 'Жалобы на ошибки' }).click();
    await expect(page.getByText('The website address is wrong')).toBeVisible();
    await page.getByLabel('Статус').last().selectOption('done');
    await page.getByLabel('Заметка (видите только вы)').fill('fixed');
    await page.getByRole('button', { name: 'Сохранить' }).click();
    await expect(page.getByText('Сохранено')).toBeVisible();
    expect(patches[0]).toEqual({ status: 'done', admin_note: 'fixed' });
  });

  test('the export tab downloads a CSV file', async ({ page }) => {
    await asAdmin(page);
    await page.route(`${supabaseUrl()}/rest/v1/institutions**`, (route) =>
      route.fulfill(json([{ slug: 'a', type: 'university', country: 'DE', city: { en: 'Berlin' }, names: { en: 'A, University' }, website: null, ownership: null, founded_year: null, status: 'published' }])),
    );
    await page.goto('/en/admin');
    await page.getByRole('tab', { name: 'Экспорт' }).click();
    const [file] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Заведения (все)' }).click()]);
    expect(file.suggestedFilename()).toMatch(/^yourhei-institutions-\d{4}-\d{2}-\d{2}\.csv$/);
    await expect(page.getByRole('status')).toContainText('Готово: 1 строк');
  });
});
