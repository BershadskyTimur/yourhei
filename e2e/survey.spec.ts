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
// the survey is shown page by page: the title of the page, and the questions of its topic under it
const title = (page: Page) => page.locator('#page-title');
const question = (page: Page, text: string) => page.getByRole('heading', { level: 3, name: text });

async function open(page: Page, seed: FakeAttempt[] = []) {
  await fakeSignIn(page, profile, seed);
  await page.goto('/en/survey');
}

async function startSurvey(page: Page) {
  await open(page);
  await page.getByRole('button', { name: 'Start the survey' }).click();
  await expect(title(page)).toHaveText('Your goal');
  await expect(question(page, 'What do you want to study?')).toBeVisible();
}

/** The first page: level, the first start date and one study format. */
async function goal(page: Page, level: string) {
  await page.getByLabel(level, { exact: true }).check();
  await page.locator('input[name="start"]').first().check();
  await page.getByRole('button', { name: 'On campus' }).click();
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

  test('a page with a required question left empty cannot be passed', async ({ page }) => {
    await startSurvey(page);
    await next(page);
    await expect(page.getByText('Please answer this question').first()).toBeVisible();
    await expect(title(page)).toHaveText('Your goal');
    // the error goes away as soon as the question is answered
    await page.getByLabel("Bachelor's degree").check();
    await page.locator('input[name="start"]').first().check();
    await page.getByRole('button', { name: 'Online', exact: true }).click();
    await expect(page.getByText('Please answer this question')).toHaveCount(0);
  });

  test('a bachelor applicant goes through the topic pages to the end', async ({ page }) => {
    await startSurvey(page);
    await expect(page.getByText(/Step 1 of /)).toBeVisible();

    // 1. Goal: the optional situation question appears on the same page once the level is chosen
    await page.getByLabel("Bachelor's degree").check();
    await expect(question(page, 'What is your situation?')).toBeVisible();
    await expect(page.getByText('Optional', { exact: true }).first()).toBeVisible();
    await page.locator('input[name="start"]').first().check();
    await expect(page.getByText('You can choose several options.')).toBeVisible();
    await page.getByRole('button', { name: 'On campus' }).click();
    await page.getByRole('button', { name: 'Blended' }).click();
    await next(page);

    // 2. Direction: the specialty list appears under the certainty question
    await expect(title(page)).toHaveText('Direction');
    await page.getByLabel('I know exactly').check();
    await expect(question(page, 'Which fields interest you?')).toBeVisible();
    await page.getByLabel('Search by name').fill('software');
    await page.getByRole('button', { name: 'Add', exact: true }).first().click();
    await expect(page.getByText('1 of 3 chosen')).toBeVisible();
    await next(page);

    // 3. Studies and grades
    await expect(title(page)).toHaveText('Studies and grades');
    await page.locator('#edu-level').selectOption('school_11');
    await page.locator('#edu-year').fill('2026');
    await page.locator('#grade-system').selectOption('five');
    await page.locator('#grade-value').fill('4.5');
    await next(page);

    // 4. Languages
    await expect(title(page)).toHaveText('Languages');
    await page.getByRole('button', { name: '+ Add a language' }).click();
    await page.locator('#lang-0').selectOption('en');
    await page.locator('#lang-l-0').selectOption('b2');
    await page.locator('#study-lang-add').selectOption('en');
    await page.getByLabel('No', { exact: true }).check();
    await next(page);

    // 5. Achievements and admission: everything optional
    await expect(title(page)).toHaveText('Achievements and admission');
    await next(page);

    // 6. Money: a currency and two ranges
    await expect(title(page)).toHaveText('Money');
    await page.getByLabel('Euros (EUR)').check();
    await expect(page.getByLabel('Up to €5,000').first()).toBeVisible();
    await page.locator('input[name="budget-tuition"]').nth(1).check(); // up to 5 000
    await page.locator('input[name="budget-living"]').nth(1).check(); // 5 000 - 10 000
    await next(page);

    // 7. Institution and life
    await expect(title(page)).toHaveText('Institution and life');
    await page.getByLabel('Balanced').check();
    await page.locator('input[name="dorm"]').first().check();
    await next(page);

    // 8. What matters most
    await expect(title(page)).toHaveText('What matters most');
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
    expect(saved.answers.format).toEqual(['on_campus', 'blended']);
    expect(saved.answers.fields).toEqual(['0613']);
    expect(saved.answers.grade).toEqual({ system: 'five', value: 4.5 });
    expect(saved.answers.budget).toEqual({ currency: 'EUR', tuition: 'to5', living: 'to10' });
    expect(saved.answers.dorm).toBe('yes');
    expect(saved.answers.priorities).toEqual(['price', 'field', 'chances']);
    expect(saved.completed_at).not.toBeNull();
  });

  test('"I do not know" leads to the interests test, whose suggestions are pre-accepted', async ({ page }) => {
    await startSurvey(page);
    await goal(page, "Bachelor's degree");
    await next(page);
    await page.getByLabel('I do not know, please help').check();

    await expect(question(page, "Let's find directions that suit you")).toBeVisible();
    await expect(page.getByText('Answer all 12 statements to see suggested directions.')).toBeVisible();
    for (let i = 0; i < 12; i++) await page.locator(`#riasec-${i} + div label`).last().click();
    await expect(page.getByRole('heading', { name: 'Directions that may suit you' })).toBeVisible();
    const chips = page.locator('button[aria-pressed="true"]');
    await expect(chips).toHaveCount(3);

    await next(page);
    await expect(title(page)).toHaveText('Studies and grades');
    const saved = attempts[0].answers.riasec as { accepted: string[]; answers: number[] };
    expect(saved.answers).toHaveLength(12);
    expect(saved.accepted).toHaveLength(3);
  });

  test('after "Next" the new page starts at its title, not at the bottom of the page', async ({ page }) => {
    // iPhone Safari does not scroll when an element gets the focus: simulate that, on a short screen
    await page.addInitScript(() => {
      HTMLElement.prototype.focus = function () {};
    });
    await page.setViewportSize({ width: 390, height: 500 });
    await startSurvey(page);
    await goal(page, "Bachelor's degree");
    // the person is at the bottom of the page, where the "Next" button is
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await next(page);
    await expect(title(page)).toHaveText('Direction');
    const top = await title(page).evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThan(400);
  });

  test('a school applicant gets the school questions', async ({ page }) => {
    await startSurvey(page);
    await goal(page, 'School');
    await next(page);
    await expect(title(page)).toHaveText('School and college');
    await expect(question(page, 'Which school profile do you want?')).toBeVisible();
    await expect(page.getByLabel('Physics and mathematics')).toBeVisible();
  });

  test('finishing a survey that was continued shows the end screen', async ({ page }) => {
    await open(page, [
      attempt({
        id: 'c2',
        answers: {
          level: 'bachelor', start: '2027-09', format: ['on_campus'], field_certainty: 'sure', fields: ['0613'],
          education: { level: 'school_11', year: 2026 }, grade: { system: 'five', value: 4.5 },
          languages: [{ lang: 'en', level: 'b2' }], study_languages: { languages: ['en'], prepYear: false },
          budget: { currency: 'EUR', tuition: 'free', living: 'to10' }, strategy: 'balanced', dorm: 'yes',
          _skipped: ['situation', 'subjects', 'exams', 'olympiads', 'entrance', 'scholarship', 'rating', 'ownership', 'extras', 'recognition', 'climate'],
        },
      }),
    ]);
    await page.getByRole('button', { name: 'Continue where you stopped' }).click();
    await expect(title(page)).toHaveText('What matters most');
    await page.getByRole('button', { name: 'Price' }).click();
    await page.getByRole('button', { name: 'The field of study' }).click();
    await page.getByRole('button', { name: 'Chances of admission' }).click();
    await next(page);
    await expect(page.getByRole('heading', { name: 'Thank you! The survey is complete.' })).toBeVisible();
    expect(attempts.find((a) => a.id === 'c2')?.status).toBe('completed');
  });

  test('stopping and coming back continues the same attempt', async ({ page }) => {
    await startSurvey(page);
    await goal(page, 'Language courses');
    await next(page);
    await expect(title(page)).toHaveText('Languages');

    await page.reload();
    await expect(page.getByText(/You started this survey on/)).toBeVisible();
    await page.getByRole('button', { name: 'Continue where you stopped' }).click();
    await expect(title(page)).toHaveText('Languages');
    expect(attempts).toHaveLength(1);
    expect(attempts[0].answers.level).toBe('language_course');
  });

  test('"Back" returns to the previous page without losing the answers', async ({ page }) => {
    await startSurvey(page);
    await goal(page, 'Language courses');
    await next(page);
    await page.getByRole('button', { name: 'Back' }).click();
    await expect(title(page)).toHaveText('Your goal');
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
    await expect(title(page)).toHaveText('Your goal');
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
  for (const locale of ['ru', 'ka', 'es', 'zh', 'uk', 'hy', 'kk', 'tr', 'az', 'uz', 'ky', 'pl', 'ar', 'fr', 'de'] as const) {
    test(`/${locale}: hub and pages fit the screen`, async ({ page }) => {
      const overflow = () =>
        page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      await fakeSignIn(page, profile);
      await page.goto(`/${locale}/survey`);
      await expect(page.getByRole('button').filter({ hasText: /./ }).first()).toBeVisible();
      expect(await overflow()).toBeLessThanOrEqual(0);

      await page.locator('main button').first().click(); // start
      await expect(page.locator('#page-title')).toBeVisible();
      expect(await overflow()).toBeLessThanOrEqual(0);

      // the longest pages: the first page filled in for a bachelor, then the specialty tree
      await page.locator('input[name="level"]').nth(3).check();
      await page.locator('input[name="start"]').first().check();
      await page.locator('main section').filter({ has: page.locator('input[name="start"]') }).locator('xpath=following-sibling::section[1]').locator('button').first().click();
      expect(await overflow()).toBeLessThanOrEqual(0);
      await page.locator('main .mt-8.flex > button').last().click(); // "Next"
      await expect(page.locator('input[name="field_certainty"]').first()).toBeVisible();
      await page.locator('input[name="field_certainty"]').first().check();
      expect(await overflow()).toBeLessThanOrEqual(0);
    });
  }
});
