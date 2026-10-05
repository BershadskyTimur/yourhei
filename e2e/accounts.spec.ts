import { expect, test, type Page } from '@playwright/test';
import { fakeSignIn } from './helpers';

// Supabase is replaced by fakes here, so no real account is created and no e-mail is sent.

const yearsAgo = (years: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
};

async function fillAge(page: Page, birthDate: string, residence: string) {
  await page.getByLabel('Date of birth').fill(birthDate);
  await page.getByLabel('Country of residence', { exact: true }).selectOption(residence);
  await page.getByLabel(/I am at least/).check();
}

const profileRow = {
  id: 'u1',
  birth_date: '2000-05-05',
  gender: null,
  residence_country: 'GE',
  citizenships: [],
  target_regions: [],
  target_countries: [],
  target_types: [],
  plan: 'free',
  marketing_opt_in: false,
  created_at: new Date().toISOString(),
};

test.describe('registration: age, then account', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/register');
    await expect(page.getByRole('heading', { level: 2, name: 'Your age' })).toBeVisible();
  });

  test('has only two steps and asks nothing else up front', async ({ page }) => {
    await expect(page.getByText('Step 1 of 2').first()).toBeVisible();
    await expect(page.getByText('Citizenship')).toHaveCount(0);
    await expect(page.getByText('Gender')).toHaveCount(0);
  });

  test('empty step 1 shows errors', async ({ page }) => {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Choose your country of residence')).toBeVisible();
    await expect(page.getByText('Please confirm your age')).toBeVisible();
  });

  test('the age box shows the limit of the chosen country', async ({ page }) => {
    const residence = page.getByLabel('Country of residence', { exact: true });
    await residence.selectOption('GE');
    await expect(page.getByLabel(/I am at least 16 years old/)).toBeVisible();
    await residence.selectOption('IN');
    await expect(page.getByLabel(/I am at least 18 years old/)).toBeVisible();
    await residence.selectOption('KZ');
    await expect(page.getByLabel(/I am at least 14 years old/)).toBeVisible();
  });

  test('a person below the age limit is turned away and nothing is kept', async ({ page }) => {
    await fillAge(page, yearsAgo(15), 'GE'); // Georgia: 16
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'We are sorry' })).toBeVisible();
    await expect(page.getByText('the minimum age is 16')).toBeVisible();
    expect(await page.evaluate(() => window.localStorage.getItem('yourhei.registration.v1'))).toBeNull();
  });

  test('the same 15-year-old may continue in a country with limit 14', async ({ page }) => {
    await fillAge(page, yearsAgo(15), 'KZ');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Account' })).toBeVisible();
  });

  test('answers survive a reload, the password does not', async ({ page }) => {
    await fillAge(page, '2000-05-05', 'GE');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByLabel('E-mail', { exact: true }).fill('student@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Maple-tree-4-ever');

    await page.reload();
    await expect(page.getByRole('heading', { level: 2, name: 'Account' })).toBeVisible();
    await expect(page.getByLabel('E-mail', { exact: true })).toHaveValue('student@example.com');
    await expect(page.getByLabel('Password', { exact: true })).toHaveValue('');

    const stored = await page.evaluate(() => window.localStorage.getItem('yourhei.registration.v1') ?? '');
    expect(stored).toContain('student@example.com');
    expect(stored).not.toContain('Maple');
  });

  test('full registration sends only age data and consents to Supabase', async ({ page }) => {
    let body: Record<string, unknown> | null = null;
    await page.route('**/auth/v1/signup**', async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '00000000-0000-0000-0000-000000000001',
          aud: 'authenticated',
          role: 'authenticated',
          email: 'student@example.com',
          identities: [{ id: 'x' }],
          created_at: new Date().toISOString(),
        }),
      });
    });

    await fillAge(page, '2000-05-05', 'GE');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByLabel('E-mail', { exact: true }).fill('student@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Maple-tree-4-ever');
    await page.getByRole('checkbox', { name: /I have read and accept/ }).check();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('heading', { name: 'Check your e-mail' })).toBeVisible();
    await expect(page.getByText('student@example.com')).toBeVisible();

    const sent = body as unknown as { data: { wizard: Record<string, unknown> }; password: string };
    expect(sent.data.wizard).toEqual({
      birth_date: '2000-05-05',
      residence_country: 'GE',
      privacy_accepted: true,
      terms_accepted: true,
      marketing_opt_in: false,
    });
    expect(JSON.stringify(sent.data)).not.toContain('Maple');
    expect(await page.evaluate(() => window.localStorage.getItem('yourhei.registration.v1'))).toBeNull();
  });

  test('a weak password lists every problem', async ({ page }) => {
    await fillAge(page, '2000-05-05', 'GE');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByLabel('E-mail', { exact: true }).fill('student@example.com');
    await page.getByLabel('Password', { exact: true }).fill('abc');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Use at least 10 characters')).toBeVisible();
    await expect(page.getByText('Add a digit')).toBeVisible();
    await expect(page.getByText('This consent is required')).toBeVisible();
  });
});

test.describe('profile (signed in with a fake session)', () => {
  test('is one form: about you, what you are looking for, documents; with hints', async ({ page }) => {
    await fakeSignIn(page, profileRow);
    await page.goto('/en/profile');
    await expect(page.getByRole('heading', { name: 'Complete your profile' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Take the matching survey' })).toBeVisible();
    await expect(page.locator('form h2')).toHaveText(['About you', 'What you are looking for', 'Documents']);
  });

  test('regions preselect all countries; Taiwan is in Asia; sub-regions can be cleared', async ({ page }) => {
    await fakeSignIn(page, profileRow);
    await page.goto('/en/profile');
    await page.getByRole('button', { name: /Caucasus, Central Asia/ }).click();
    await expect(page.getByRole('button', { name: 'Georgia', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: 'Western Asia', exact: true })).toBeVisible();

    await page.getByRole('group', { name: /Western Asia/ }).getByRole('button', { name: 'Clear all' }).click();
    await expect(page.getByRole('button', { name: 'Georgia', exact: true })).toHaveAttribute('aria-pressed', 'false');

    await page.getByRole('button', { name: 'Asia', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Taiwan', exact: true })).toBeVisible();
  });

  test('saving sends the changes and says so', async ({ page }) => {
    const { patches } = await fakeSignIn(page, profileRow);
    await page.goto('/en/profile');
    await page.getByRole('button', { name: /Caucasus, Central Asia/ }).click();
    await page.getByRole('button', { name: 'University', exact: true }).click();
    await page.locator('#citizenships').fill('Georgia');
    await page.getByRole('button', { name: 'Georgia', exact: true }).first().click();
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    await expect(page.getByText('Saved', { exact: true })).toBeVisible();
    const sent = patches[0] as Record<string, unknown>;
    expect(sent.residence_country).toBe('GE');
    expect(sent.target_types).toEqual(['university']);
    expect(sent.citizenships).toEqual(['GE']);
    expect(sent.gender).toBeNull();
  });

  test('when there is no profile row the page says so instead of pretending to save', async ({ page }) => {
    await fakeSignIn(page, null);
    await page.goto('/en/profile');
    await expect(page.getByText(/Could not load your profile/)).toBeVisible();
  });
});

test.describe('login, reset and guests', () => {
  test('a wrong password shows a friendly message', async ({ page }) => {
    await page.route('**/auth/v1/token**', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ code: 400, error_code: 'invalid_credentials', msg: 'Invalid login credentials' }),
      }),
    );
    await page.goto('/en/login');
    await page.getByLabel('E-mail', { exact: true }).fill('student@example.com');
    await page.getByLabel('Password', { exact: true }).fill('wrong-password-1');
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page.getByText('Wrong e-mail or password.')).toBeVisible();
  });

  test('the forgot-password form always gives the same answer', async ({ page }) => {
    await page.route('**/auth/v1/recover**', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    );
    await page.goto('/en/forgot-password');
    await page.getByLabel('E-mail', { exact: true }).fill('anyone@example.com');
    await page.getByRole('button', { name: 'Send the link' }).click();
    await expect(page.getByText(/If this address has an account/)).toBeVisible();
  });

  test('the reset page without a valid link asks for a new one', async ({ page }) => {
    await page.goto('/en/reset-password');
    await expect(page.getByText('This link has expired. Please request a new one.')).toBeVisible();
  });

  test('the profile sends a guest to the login page', async ({ page }) => {
    await page.goto('/en/profile');
    await expect(page).toHaveURL(/\/en\/login\?next=%2Fprofile/);
  });

  test('an expired e-mail link lands on login with an explanation', async ({ page }) => {
    await page.goto('/auth/callback?code=expired&next=/ru/profile');
    await expect(page).toHaveURL(/\/ru\/login\?notice=link/);
    await expect(page.getByText(/Ссылка устарела/)).toBeVisible();
  });

  test('the callback never redirects outside the site', async ({ page }) => {
    await page.goto('/auth/callback?code=x&next=//evil.example.com');
    await expect(page).toHaveURL(/localhost:\d+\/en\/login/);
  });
});

test.describe('legal pages', () => {
  for (const [path, sections] of [
    ['privacy', 7],
    ['terms', 6],
  ] as const) {
    test(`/${path} has ${sections} sections and the lawyer note`, async ({ page }) => {
      await page.goto(`/en/${path}`);
      await expect(page.getByText('Template — requires review by a lawyer.')).toBeVisible();
      await expect(page.locator('article h2')).toHaveCount(sections);
    });
  }
});

test.describe('every language: registration and profile fit the screen', () => {
  for (const locale of ['ru', 'ka', 'es', 'zh'] as const) {
    test(`/${locale}: no horizontal scroll`, async ({ page }) => {
      const overflow = () =>
        page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

      await page.goto(`/${locale}/register`);
      expect(await overflow()).toBeLessThanOrEqual(0);
      await page.locator('#birthDate').fill('2000-05-05');
      await page.locator('#residenceCountry').selectOption('GE');
      await page.locator('input[type="checkbox"]').check();
      await page.locator('form button:not([type="submit"])').last().click();
      expect(await overflow()).toBeLessThanOrEqual(0);

      await fakeSignIn(page, profileRow);
      await page.goto(`/${locale}/profile`);
      await expect(page.locator('form h2').first()).toBeVisible();
      expect(await overflow()).toBeLessThanOrEqual(0);
    });
  }
});
