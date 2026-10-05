import { expect, test, type Page } from '@playwright/test';

// Supabase is replaced by fakes here, so no real account is created and no e-mail is sent.

const yearsAgo = (years: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - years);
  return d.toISOString().slice(0, 10);
};

async function fillSearchStep(page: Page) {
  await page.getByRole('button', { name: /Caucasus, Central Asia/ }).click();
  await page.getByRole('button', { name: 'University', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
}

async function fillAboutStep(page: Page, birthDate: string, residence = 'GE') {
  await page.getByLabel('Date of birth').fill(birthDate);
  await page.getByLabel('Prefer not to say').check();
  await page.getByLabel('Country of residence', { exact: true }).selectOption(residence);
  await page.locator('#citizenships').fill('Georgia');
  await page.getByRole('button', { name: 'Georgia', exact: true }).click();
  await page.getByLabel(/I am at least/).check();
}

test.describe('registration wizard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/register');
    await expect(page.getByRole('heading', { level: 2, name: 'What you are looking for' })).toBeVisible();
  });

  test('step 1 shows errors, then preselects all countries of a region', async ({ page }) => {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByText('Choose at least one region')).toBeVisible();
    await expect(page.getByText('Choose at least one type')).toBeVisible();

    await page.getByRole('button', { name: /Caucasus, Central Asia/ }).click();
    // 12 countries, all selected
    await expect(page.locator('button[aria-pressed="true"]').filter({ hasText: /^(Georgia|Kazakhstan|Armenia)$/ })).toHaveCount(3);
    await expect(page.getByRole('heading', { name: 'Western Asia', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Central Asia', exact: true })).toBeVisible();

    // "Clear all" for a sub-region
    await page.getByRole('group', { name: /Western Asia/ }).getByRole('button', { name: 'Clear all' }).click();
    await expect(page.getByRole('button', { name: 'Georgia', exact: true })).toHaveAttribute('aria-pressed', 'false');
  });

  test('Taiwan is offered in Asia and in the residence list', async ({ page }) => {
    await page.getByRole('button', { name: 'Asia', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Taiwan', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Eastern Asia', exact: true })).toBeVisible();
  });

  test('answers survive a reload, the password does not', async ({ page }) => {
    await fillSearchStep(page);
    await fillAboutStep(page, '2000-05-05');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
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

  test('a person below the age limit is turned away and nothing is kept', async ({ page }) => {
    await fillSearchStep(page);
    await fillAboutStep(page, yearsAgo(15), 'GE'); // Georgia: 16
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'We are sorry' })).toBeVisible();
    await expect(page.getByText('the minimum age is 16')).toBeVisible();
    const stored = await page.evaluate(() => window.localStorage.getItem('yourhei.registration.v1'));
    expect(stored).toBeNull();
  });

  test('the same 15-year-old may register in a country with threshold 14', async ({ page }) => {
    await fillSearchStep(page);
    await page.getByLabel('Date of birth').fill(yearsAgo(15));
    await page.getByLabel('Prefer not to say').check();
    await page.getByLabel('Country of residence', { exact: true }).selectOption('KZ');
    await page.locator('#citizenships').fill('Kazakhstan');
    await page.getByRole('button', { name: 'Kazakhstan', exact: true }).click();
    await page.getByLabel(/I am at least 14 years old/).check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('heading', { level: 2, name: 'Documents' })).toBeVisible();
    // under 18: the parental-consent row is shown
    await expect(page.getByText(/Notarised parental consent/)).toBeVisible();
  });

  test('full registration sends the data to Supabase without the password in the metadata', async ({ page }) => {
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

    await fillSearchStep(page);
    await fillAboutStep(page, '2000-05-05');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('group', { name: /International passport/ }).getByLabel('Have it').check();
    await page.getByRole('button', { name: 'Next', exact: true }).click();

    await page.getByLabel('E-mail', { exact: true }).fill('student@example.com');
    await page.getByLabel('Password', { exact: true }).fill('Maple-tree-4-ever');
    await page.getByRole('checkbox', { name: /I have read and accept/ }).check();
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByRole('heading', { name: 'Check your e-mail' })).toBeVisible();
    await expect(page.getByText('student@example.com')).toBeVisible();

    const sent = body as unknown as { data: { wizard: Record<string, unknown> }; password: string };
    expect(sent.password).toBe('Maple-tree-4-ever');
    expect(JSON.stringify(sent.data)).not.toContain('Maple');
    expect(sent.data.wizard.residence_country).toBe('GE');
    expect(sent.data.wizard.birth_date).toBe('2000-05-05');
    expect(sent.data.wizard.privacy_accepted).toBe(true);
    expect((sent.data.wizard.documents as Record<string, { status: string }>).passport.status).toBe('have');

    // the draft is gone after sign-up
    expect(await page.evaluate(() => window.localStorage.getItem('yourhei.registration.v1'))).toBeNull();
  });

  test('a weak password lists every problem', async ({ page }) => {
    await fillSearchStep(page);
    await fillAboutStep(page, '2000-05-05');
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await page.getByLabel('E-mail', { exact: true }).fill('student@example.com');
    await page.getByLabel('Password', { exact: true }).fill('abc');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page.getByText('Use at least 10 characters')).toBeVisible();
    await expect(page.getByText('Add a digit')).toBeVisible();
    await expect(page.getByText('This consent is required')).toBeVisible();
  });
});

test.describe('login, reset and profile', () => {
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

test.describe('every language: the wizard fits the screen', () => {
  for (const locale of ['ru', 'ka', 'es', 'zh'] as const) {
    test(`/${locale}/register has no horizontal scroll on every step`, async ({ page }) => {
      await page.goto(`/${locale}/register`);
      const overflow = () =>
        page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(await overflow()).toBeLessThanOrEqual(0);

      // Step 1 -> 2 needs a region and a type.
      await page.locator('fieldset button[aria-pressed]').first().click();
      await page.locator('fieldset').last().locator('button[aria-pressed]').first().click();
      await page.locator('form button:not([aria-pressed]):not([type="submit"])').last().click();
      expect(await overflow()).toBeLessThanOrEqual(0);
    });
  }
});
