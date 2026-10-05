import { expect, test } from '@playwright/test';
import { fakeSignIn, type FakeAttempt } from './helpers';

// The matches page runs on fake database answers (see helpers.ts).

const profile = {
  id: 'u1', birth_date: '2000-05-05', gender: null, residence_country: 'KZ', citizenships: ['KZ'],
  target_regions: [], target_countries: ['GE'], target_types: ['university'], plan: 'free', marketing_opt_in: false,
  created_at: new Date().toISOString(),
};

const survey: FakeAttempt = {
  id: 's1', config_version: 1, status: 'completed', started_at: '2026-09-01T10:00:00Z', updated_at: '2026-09-01T10:00:00Z',
  completed_at: '2026-09-01T10:30:00Z',
  answers: {
    level: 'bachelor', start: '2027-09', format: 'any', field_certainty: 'sure', fields: ['0613'],
    grade: { system: 'hundred', value: 80 },
    languages: [{ lang: 'en', level: 'b2' }],
    study_languages: { languages: ['en'], prepYear: false },
    funding: 'both', budget: { currency: 'USD', tuition: 4000, living: 6000 },
    strategy: 'balanced', dorm: 'any', priorities: ['field', 'price', 'chances'],
  },
};

const institution = (id: string, name: string) => ({
  id, slug: id, type: 'university', country: 'GE', city: { en: 'Tbilisi' }, names: { en: name, original: name },
  ownership: 'public', size: null, city_size: null, climate: null, dormitory: null, features: [], verified_at: '2026-09-01',
  rankings: [],
});

const programRow = (id: string, inst: string, over: Record<string, unknown> = {}) => ({
  id, names: { en: `Software engineering at ${inst}` }, level: 'bachelor', isced_f: '0613', languages: ['en'], duration_years: 4,
  format: 'on_campus', intakes: ['09'], tuition: [{ amount: 8000, currency: 'GEL', period: 'year', applies_to: 'international' }],
  free: false, requirements: { min_gpa: { system: 'hundred', value: 60 }, min_scores: [], documents: [] },
  application_fee: null, application_url: 'https://example.edu/apply', institutions: institution(`i-${id}`, inst), ...over,
});

const data = {
  programs: [
    programRow('p-safe', 'Safe University'),
    programRow('p-reach', 'Reach University', { requirements: { min_gpa: { system: 'hundred', value: 88 }, min_scores: [], documents: [] } }),
    programRow('p-wrong-lang', 'Georgian-only University', { languages: ['ka'] }),
    programRow('p-master', 'Master University', { level: 'master' }),
  ],
  countries: [],
};

test.describe('matches page', () => {
  test('a guest is sent to the login page', async ({ page }) => {
    await page.goto('/en/matches');
    await expect(page).toHaveURL(/\/en\/login\?next=%2Fmatches/);
  });

  test('without a completed survey it asks for the survey', async ({ page }) => {
    await fakeSignIn(page, profile, [], data);
    await page.goto('/en/matches');
    await expect(page.getByRole('heading', { name: 'Take the survey first' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to the survey' })).toBeVisible();
  });

  test('shows the three groups with reasons, gaps and prices', async ({ page }) => {
    await fakeSignIn(page, profile, [survey], data);
    await page.goto('/en/matches');

    await expect(page.getByText(/We checked 4 programmes; 2 fit your requirements\./)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Safe choices' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ambitious choices' })).toBeVisible();
    // the language-only-Georgian and master programmes are filtered out
    await expect(page.getByText('Georgian-only University')).toHaveCount(0);
    await expect(page.getByText('Master University')).toHaveCount(0);

    const safe = page.locator('#group-safe').locator('xpath=..');
    await expect(safe.getByText('Software engineering at Safe University')).toBeVisible();
    await expect(safe.getByText('Exactly your specialty.')).toBeVisible();
    // 8000 GEL converted to dollars at the day's rate (live or the built-in fallback)
    await expect(safe.locator('dd', { hasText: /≈ \$[23],\d{3} \/ year/ })).toBeVisible();

    const reach = page.locator('#group-ambitious').locator('xpath=..');
    await expect(reach.getByText('Average grade: 88 required, you have 80.')).toBeVisible();
    await expect(reach.getByRole('link', { name: 'Apply on the official site' })).toHaveAttribute('href', 'https://example.edu/apply');
  });

  test('with no published programmes it says data is being added', async ({ page }) => {
    await fakeSignIn(page, profile, [survey], { programs: [], countries: [] });
    await page.goto('/en/matches');
    await expect(page.getByRole('heading', { name: 'Programme data is being added' })).toBeVisible();
  });

  test('when nothing fits it suggests wider choices', async ({ page }) => {
    await fakeSignIn(page, profile, [survey], { programs: [programRow('x', 'X', { level: 'master' })], countries: [] });
    await page.goto('/en/matches');
    await expect(page.getByRole('heading', { name: 'No programme fits all your requirements yet' })).toBeVisible();
  });

  test('is readable in every language without horizontal scroll', async ({ page }) => {
    for (const locale of ['ru', 'ka', 'es', 'zh', 'uk', 'hy', 'kk']) {
      await fakeSignIn(page, profile, [survey], data);
      await page.goto(`/${locale}/matches`);
      await expect(page.locator('article').first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, locale).toBeLessThanOrEqual(0);
    }
  });
});
