import { expect, test, type Page } from '@playwright/test';

// The articles are shown from their publication day. These tests need the scheduled ones too, so the test server is started with
// BLOG_SHOW_ALL=1 (playwright.config.ts); on a server started without it they are skipped.
async function needArticles(page: Page, locale = 'en') {
  await page.goto(`/${locale}/blog`);
  const articles = await page.locator('main article, article').count();
  test.skip(articles === 0, 'no article is published yet on this server (start it with BLOG_SHOW_ALL=1)');
}

test.describe('blog', () => {
  test('the list shows the articles with their date and reading time', async ({ page }) => {
    await needArticles(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Blog' })).toBeVisible();
    const first = page.getByRole('heading', { level: 2 }).first();
    await expect(first).toBeVisible();
    await expect(page.getByText(/min read/).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'RSS feed' })).toHaveAttribute('href', '/en/blog/feed.xml');
  });

  test('an article has contents, official links that open safely, related articles and the legal note', async ({ page }) => {
    await needArticles(page);
    await page.goto('/en/blog/work-during-studies-rules-by-country');
    await expect(page.getByRole('heading', { level: 1, name: /Working while you study abroad/ })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Contents' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Contents' }).getByRole('link').first().click();
    await expect(page).toHaveURL(/#short$/);
    // the rules of a country come from the country guides, whole (a text with ";" is not cut)
    await expect(page.getByText('Student assistant jobs at a university are an exception; more days need permission.')).toBeVisible();
    const official = page.getByRole('link', { name: 'Official page' }).first();
    await expect(official).toHaveAttribute('target', '_blank');
    await expect(official).toHaveAttribute('rel', /noopener/);
    await expect(page.getByText(/Checked on/)).toBeVisible();
    await expect(page.getByText('This article is general information, not legal or immigration advice.')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Read next' })).toBeVisible();
    // a link to an article that is published opens it
    await page.getByRole('link', { name: 'How much money you must show for a student visa' }).click();
    await expect(page).toHaveURL(/\/en\/blog\/proof-of-funds-student-visa$/);
  });

  test('search engines get the address, both languages, the article data and the feed', async ({ page }) => {
    await needArticles(page);
    await page.goto('/en/blog/proof-of-funds-student-visa');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/blog\/proof-of-funds-student-visa$/);
    await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute('href', /\/ru\/blog\/proof-of-funds-student-visa$/);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    const data = await page.locator('script[type="application/ld+json"]').allTextContents();
    const article = data.map((d) => JSON.parse(d)).find((d) => d['@type'] === 'Article');
    expect(article).toMatchObject({ inLanguage: 'en', author: { name: 'YourHEI' } });
    expect(article.datePublished <= article.dateModified).toBe(true);
    await page.goto('/en/blog');
    await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute('href', /\/en\/blog\/feed\.xml$/);
  });

  test('Russian reads Russian, including the data under the article', async ({ page }) => {
    await needArticles(page, 'ru');
    await page.goto('/ru/blog/proof-of-funds-student-visa');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Сколько денег нужно показать');
    await expect(page.getByRole('heading', { level: 3, name: /Великобритания/ })).toBeVisible();
    await expect(page.getByText('Вне Лондона:')).toBeVisible();
    await expect(page.getByText('в месяц').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Официальная страница' }).first()).toBeVisible();
  });

  test('the citizenship article names the programmes of each country once in full', async ({ page }) => {
    await needArticles(page);
    await page.goto('/en/blog/scholarships-by-citizenship-caucasus-central-asia');
    await expect(page.getByRole('heading', { level: 3, name: 'Citizens of Georgia' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Citizens of Uzbekistan' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Visegrad Scholarship Programme' })).toHaveCount(1);
  });

  test('a language without a translation reads the English text, says so and stays out of the search results', async ({ page }) => {
    await needArticles(page);
    await page.goto('/de/blog/proof-of-funds-student-visa');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('div[lang="en"]').first()).toBeVisible();
    await expect(page.getByText(/englische Version/)).toBeVisible();
    await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveCount(0);
    // the top menu offers the blog only in the languages that have their own text
    await expect(page.getByRole('navigation', { name: /./ }).first().getByRole('link', { name: 'Blog' })).toHaveCount(0);
  });

  for (const [lang, title, notice, menu] of [
    ['zh', '办理学生签证需要证明多少资金', '机器翻译', '博客'],
    ['es', 'Cuánto dinero debes demostrar', 'traducción automática', 'Blog'],
    ['fr', 'Combien d’argent faut-il prouver', 'traduction automatique', 'Blog'],
    ['ka', 'რამდენი თანხა უნდა დაადასტუროთ', 'მანქანური თარგმანია', 'ბლოგი'],
    ['uk', 'Скільки грошей потрібно показати', 'машинний переклад', 'Блог'],
    ['tr', 'Öğrenci vizesi için ne kadar para göstermelisiniz', 'makine çevirisi', 'Blog'],
  ] as const) {
    test(`${lang}: a machine translation with its own text and data, marked as such and kept out of the search results`, async ({ page }) => {
      await needArticles(page);
      await page.goto(`/${lang}/blog/proof-of-funds-student-visa`);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(title);
      await expect(page.locator(`div[lang="${lang}"]`).first()).toBeVisible();
      await expect(page.getByText(notice).first()).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveCount(0);
      // the data under the article is translated too (the note of Germany), and the menu offers the blog
      await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
      await expect(page.getByRole('navigation', { name: /./ }).first().getByRole('link', { name: menu })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('an unknown article is a 404', async ({ page }) => {
    const response = await page.goto('/en/blog/no-such-article');
    expect(response?.status()).toBe(404);
  });

  test('the feed is XML with the articles, only for the languages the blog is written in', async ({ request }) => {
    const ru = await request.get('/ru/blog/feed.xml');
    expect(ru.status()).toBe(200);
    expect(ru.headers()['content-type']).toContain('application/rss+xml');
    const xml = await ru.text();
    expect(xml).toContain('<language>ru</language>');
    expect((await request.get('/ka/blog/feed.xml')).status()).toBe(404);
  });

  test('the blog is in the menu of Russian and English, and an article fits a phone screen', async ({ page }) => {
    await page.goto('/ru');
    await expect(page.getByRole('navigation', { name: 'Основные разделы' }).getByRole('link', { name: 'Блог' })).toBeVisible();
    await needArticles(page);
    await page.goto('/en/blog/after-graduation-work-permits-by-country');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
