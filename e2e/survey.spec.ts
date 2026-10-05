import { expect, test, type Page } from '@playwright/test';
import { attempts, fakeSignIn, type FakeAttempt } from './helpers';

// The survey runs against fakes of Supabase (see helpers.ts): no real data is touched.

const profile = {
  id: 'u1',
  birth_date: '2000-05-05',
  gender: null,
  residence_country: 'GE',
  citizenships: ['GE'],
  target_regions: [],
  target_countries: [],
  target_types: [],
  plan: 'free',
  marketing_opt_in: false,
  created_at: new Date().toISOString(),
};

const attempt = (over: Partial<FakeAttempt>): FakeAttempt => ({
  id: 'old1',
  config_version: 1,
  status: 'in_progress',
  answers: {},
  started_at: '2026-09-01T10:00:00Z',
  updated_at: '2026-09-01T10:00:00Z',
  completed_at: null,
  ...over,
});

const next = (page: Page) => page.getByRole('button', { name: /^(Next|Finish)$/ }).click();
const title = (page: Page) => page.locator('#question-title');

async function open(page: Page, seed: FakeAttempt[] = []) {
  await fakeSignIn(page, profile, seed);
  await page.goto('/en/survey');
}

async function startSurvey(page: Page) {
  await open(page);
  await page.getByRole('button', { name: 'Start the survey' }).click();
  await expect(title(page)).toHaveText('What do you want to study?');
}

test.describe('survey', () => {
  test('a guest is sent to the login page', async ({ page }) => {
    await page.goto('/en/survey');
    await expect(page).toHaveURL(/\/en\/login\?next=%2Fsurvey/);
  });

  test('the profile links to the survey', async ({ page }) => {
    await fakeSignIn(page, profile);
    await page.goto('/en/profile');
    await page.getByRole('link', { name: 'Go to the survey' }).click();
    await expect(page).toHaveURL(/\/en\/survey$/);
  });

  test('a required question cannot be passed empty', async ({ page }) => {
    await startSurvey(page);
    await next(page);
    await expect(page.getByText('Please answer this question')).toBeVisible();
    await expect(title(page)).toHaveText('What do you want to study?');
  });

  test('a bachelor applicant goes through about 14 required questions to the end', async ({ page }) => {
    await startSurvey(page);
    await expect(page.getByText(/Question 1 of /)).toBeVisible();

    await page.getByLabel("Bachelor's degree").check();
    await next(page);

    // the first optional question: skip all optional ones in one click
    await expect(title(page)).toHaveText('What is your situation?');
    await expect(page.getByText('Optional', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Skip all optional questions' }).click();

    await expect(title(page)).toHaveText('When do you want to start?');
    await page.locator('input[name="start"]').first().check();
    await next(page);

    await page.getByLabel('On campus').check();
    await next(page);

    await page.getByLabel('I know exactly').check();
    await next(page);

    // specialty: search, add, confirm
    await expect(title(page)).toHaveText('Which fields interest you?');
    await page.getByLabel('Search by name').fill('software');
    await page.getByRole('button', { name: 'Add', exact: true }).first().click();
    await expect(page.getByText('1 of 3 chosen')).toBeVisible();
    await next(page);

    await page.locator('#edu-level').selectOption('school_11');
    await page.locator('#edu-year').fill('2026');
    await next(page);

    await page.locator('#grade-system').selectOption('five');
    await page.locator('#grade-value').fill('4.5');
    await next(page);

    await page.getByRole('button', { name: '+ Add a language' }).click();
    await page.locator('#lang-0').selectOption('en');
    await page.locator('#lang-l-0').selectOption('b2');
    await next(page);

    await page.locator('#study-lang-add').selectOption('en');
    await page.getByLabel('No', { exact: true }).check();
    await next(page);

    await page.getByLabel('Paid places').check();
    await next(page);

    await page.locator('#budget-currency').selectOption('EUR');
    await page.locator('#budget-tuition').fill('5000');
    await page.locator('#budget-living').fill('8000');
    await next(page);

    // scholarship and loan appear for paid studies: skip the rest of the optional ones
    await expect(title(page)).toHaveText('Do you need a scholarship?');
    await page.getByRole('button', { name: 'Skip all optional questions' }).click();

    await expect(title(page)).toHaveText('How ambitious should your matches be?');
    await page.getByLabel('Balanced').check();
    await next(page);

    await expect(title(page)).toHaveText('Do you need a dormitory?');
    await page.getByLabel('Yes', { exact: true }).check();
    await next(page);

    await expect(title(page)).toHaveText('Choose the 3 most important things');
    await expect(page.getByRole('button', { name: 'Finish' })).toBeVisible();
    await page.getByRole('button', { name: 'Price' }).click();
    await page.getByRole('button', { name: 'The field of study' }).click();
    await page.getByRole('button', { name: 'Chances of admission' }).click();
    await page.getByRole('button', { name: 'Career prospects' }).click({ force: true }); // a 4th one is not accepted
    await expect(page.getByText('3 of 3 chosen')).toBeVisible();
    await next(page);

    await expect(page.getByRole('heading', { name: 'Thank you! The survey is complete.' })).toBeVisible();

    const saved = attempts[0];
    expect(saved.status).toBe('completed');
    expect(saved.answers.level).toBe('bachelor');
    expect(saved.answers.fields).toEqual(['0613']);
    expect(saved.answers.grade).toEqual({ system: 'five', value: 4.5 });
    expect(saved.answers.priorities).toEqual(['price', 'field', 'chances']);
    expect(saved.completed_at).not.toBeNull();
  });

  test('"I do not know" leads to the interests test, whose suggestions are pre-accepted', async ({ page }) => {
    await startSurvey(page);
    await page.getByLabel("Bachelor's degree").check();
    await next(page);
    await page.getByRole('button', { name: 'Skip all optional questions' }).click();
    await page.locator('input[name="start"]').first().check();
    await next(page);
    await page.getByLabel('Online', { exact: true }).check();
    await next(page);
    await page.getByLabel('I do not know, please help').check();
    await next(page);

    await expect(title(page)).toHaveText("Let's find directions that suit you");
    await expect(page.getByText('Answer all 12 statements to see suggested directions.')).toBeVisible();
    // statement 3 is about creating, statement 9 about helping: rate everything 5
    for (let i = 0; i < 12; i++) await page.locator(`#riasec-${i} + div label`).last().click();
    await expect(page.getByRole('heading', { name: 'Directions that may suit you' })).toBeVisible();
    const chips = page.locator('button[aria-pressed="true"]');
    await expect(chips).toHaveCount(3);

    await next(page);
    await expect(title(page)).toHaveText('Your current education');
    const saved = attempts[0].answers.riasec as { accepted: string[]; answers: number[] };
    expect(saved.answers).toHaveLength(12);
    expect(saved.accepted).toHaveLength(3);
  });

  test('a school applicant gets the school questions', async ({ page }) => {
    await startSurvey(page);
    await page.getByLabel('School', { exact: true }).check();
    await next(page);
    // required school questions come after the intake and format
    await expect(title(page)).toHaveText('When do you want to start?');
    await page.locator('input[name="start"]').first().check();
    await next(page);
    await page.getByLabel('Any', { exact: true }).check();
    await next(page);
    await expect(title(page)).toHaveText('Which school profile do you want?');
    await expect(page.getByLabel('Physics and mathematics')).toBeVisible();
  });

  test('stopping and coming back continues the same attempt', async ({ page }) => {
    await startSurvey(page);
    await page.getByLabel('Language courses').check();
    await next(page);
    await expect(title(page)).toHaveText('When do you want to start?');

    await page.reload();
    await expect(page.getByText(/You started this survey on/)).toBeVisible();
    await page.getByRole('button', { name: 'Continue where you stopped' }).click();
    await expect(title(page)).toHaveText('When do you want to start?');
    expect(attempts).toHaveLength(1);
    expect(attempts[0].answers.level).toBe('language_course');
  });

  test('"Back" returns to the previous question without losing the answer', async ({ page }) => {
    await startSurvey(page);
    await page.getByLabel('Language courses').check();
    await next(page);
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(title(page)).toHaveText('What do you want to study?');
    await expect(page.getByLabel('Language courses')).toBeChecked();
  });

  test('a completed survey is listed, and the person can only take a new one', async ({ page }) => {
    await open(page, [
      attempt({ id: 'c1', status: 'completed', answers: { level: 'master' }, completed_at: '2026-09-10T10:00:00Z' }),
    ]);
    await expect(page.getByRole('heading', { name: 'Your completed surveys' })).toBeVisible();
    await expect(page.getByText("Master's degree")).toBeVisible();
    await expect(page.getByText(/cannot be changed/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue where you stopped' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Take the survey again' }).click();
    await expect(title(page)).toHaveText('What do you want to study?');
    expect(attempts).toHaveLength(2);
    expect(attempts[0].status).toBe('completed'); // the old one is untouched
    expect(attempts[0].answers).toEqual({ level: 'master' });
  });

  test('an unfinished attempt can be discarded', async ({ page }) => {
    await open(page, [attempt({ id: 'o1', answers: { level: 'phd' } })]);
    await page.getByRole('button', { name: 'Discard and start over' }).click();
    await expect(page.getByRole('button', { name: 'Start the survey' })).toBeVisible();
    expect(attempts[0].status).toBe('abandoned');
  });

  test('a database failure is shown instead of a blank page', async ({ page }) => {
    await fakeSignIn(page, profile);
    await page.route('**/rest/v1/survey_attempts**', (route) =>
      route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ message: 'relation does not exist' }) }),
    );
    await page.goto('/en/survey');
    await expect(page.getByText(/Could not load the survey/)).toBeVisible();
  });
});

test.describe('survey in every language', () => {
  for (const locale of ['ru', 'ka', 'es', 'zh'] as const) {
    test(`/${locale}: hub and questions fit the screen`, async ({ page }) => {
      const overflow = () =>
        page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      await fakeSignIn(page, profile);
      await page.goto(`/${locale}/survey`);
      await expect(page.getByRole('button').filter({ hasText: /./ }).first()).toBeVisible();
      expect(await overflow()).toBeLessThanOrEqual(0);

      await page.locator('main button').first().click(); // start
      await expect(page.locator('#question-title')).toBeVisible();
      expect(await overflow()).toBeLessThanOrEqual(0);

      // the longest screens: pick bachelor, skip optional, then the specialty tree
      await page.locator('input[name="level"]').nth(3).check();
      await page.locator('main button').filter({ hasText: /./ }).last().click();
      expect(await overflow()).toBeLessThanOrEqual(0);
    });
  }
});
