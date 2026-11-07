import { describe, expect, it } from 'vitest';
import { fitTitle, indexedLocalesOf, languageLinks, seoMetadata, trimDescription } from './metadata';

describe('seoMetadata', () => {
  it('an indexed language: self canonical, hreflang for the indexed languages and x-default, indexable', () => {
    const m = seoMetadata({ locale: 'ru', path: '/countries/de', title: 'T', description: 'D' });
    expect(m.alternates?.canonical).toBe('/ru/countries/de');
    expect(m.alternates?.languages).toEqual({
      ru: '/ru/countries/de', en: '/en/countries/de', es: '/es/countries/de', zh: '/zh/countries/de', de: '/de/countries/de', fr: '/fr/countries/de', pl: '/pl/countries/de',
      'x-default': '/en/countries/de',
    });
    expect(m.robots).toBeUndefined();
    expect(m.openGraph).toMatchObject({ title: 'T', description: 'D', url: '/ru/countries/de', locale: 'ru' });
  });

  it('another language: noindex (links are still followed), self canonical, no hreflang', () => {
    const m = seoMetadata({ locale: 'ka', path: '/countries/de', title: 'T' });
    expect(m.robots).toEqual({ index: false, follow: true });
    expect(m.alternates?.canonical).toBe('/ka/countries/de');
    expect(m.alternates?.languages).toBeUndefined();
  });

  it('a content language (es, zh, de, fr, pl) is indexed everywhere except the institution pages and lists', () => {
    expect(seoMetadata({ locale: 'de', path: '/blog/a', title: 'T' }).robots).toBeUndefined();
    expect(seoMetadata({ locale: 'de', path: '/institutions/us/harvard-university', title: 'T' }).robots).toEqual({ index: false, follow: true });
    expect(seoMetadata({ locale: 'de', path: '/institutions/us', title: 'T' }).robots).toEqual({ index: false, follow: true });
    expect(seoMetadata({ locale: 'de', path: '/institutions', title: 'T' }).robots).toEqual({ index: false, follow: true });
    // the institution pages offer only ru and en to search engines
    expect(languageLinks('/institutions/us/x')).toEqual({ ru: '/ru/institutions/us/x', en: '/en/institutions/us/x', 'x-default': '/en/institutions/us/x' });
    // "/institutionsfoo" is not an institution page
    expect(indexedLocalesOf('/institutionsfoo')).toContain('fr');
  });

  it('an article not translated into a language: that language is not indexed and not in hreflang', () => {
    const m = seoMetadata({ locale: 'fr', path: '/blog/a', title: 'T', locales: ['ru', 'en', 'de'] });
    expect(m.robots).toEqual({ index: false, follow: true });
    const de = seoMetadata({ locale: 'de', path: '/blog/a', title: 'T', locales: ['ru', 'en', 'de'] });
    expect(de.robots).toBeUndefined();
    expect(de.alternates?.languages).toEqual({ ru: '/ru/blog/a', en: '/en/blog/a', de: '/de/blog/a', 'x-default': '/en/blog/a' });
  });

  it('a thin page is out of the results in every language', () => {
    expect(seoMetadata({ locale: 'en', path: '/x', title: 'T', noindex: true }).robots).toEqual({ index: false, follow: true });
  });

  it('the home page has an empty path', () => {
    expect(languageLinks('')).toEqual({ ru: '/ru', en: '/en', es: '/es', zh: '/zh', de: '/de', fr: '/fr', pl: '/pl', 'x-default': '/en' });
  });

  it('an article carries its dates', () => {
    const m = seoMetadata({ locale: 'en', path: '/blog/a', title: 'T', type: 'article', published: '2026-11-01', modified: '2026-11-02' });
    expect(m.openGraph).toMatchObject({ type: 'article', publishedTime: '2026-11-01', modifiedTime: '2026-11-02' });
  });
});

describe('trimDescription', () => {
  it('keeps a short text and cuts a long one at a word', () => {
    expect(trimDescription('short text')).toBe('short text');
    const long = `${'word '.repeat(60)}end`;
    const out = trimDescription(long);
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith('…')).toBe(true);
    expect(out).not.toMatch(/wor…$/);
  });

  it('a long text is cut after the last whole sentence that fits, without "…"', () => {
    const first = 'University of Example (Exampleville, Germany). Programmes: 12; levels: bachelor, master.';
    const second = 'Tuition: 1 000 € – 9 000 € per year. Deadlines and the link to apply: from official sources.';
    const out = trimDescription(`${first} ${second}`);
    expect(out).toBe(`${first} Tuition: 1 000 € – 9 000 € per year.`);
    expect(out.length).toBeLessThanOrEqual(160);
  });

  it('a decimal number or a very short first sentence is not taken for the end of the text', () => {
    const long = `Costs 5.000 euro a year at St. John's and then ${'word '.repeat(40)}end`;
    const out = trimDescription(long);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(160);
  });

  it('Chinese full stops end a sentence too', () => {
    const sentence = '示例大学位于示例城市，提供本科和硕士课程，学费信息和申请截止日期均来自官方网站，请在申请前再次核对官方页面上的最新信息。';
    const out = trimDescription(`${sentence}${sentence}${sentence}${sentence}${sentence}${sentence}${sentence}`);
    expect(out.endsWith('。')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(160);
  });
});

describe('fitTitle', () => {
  it('takes the first title that fits in 60 characters', () => {
    expect(fitTitle(['Harvard University, United States: tuition fees and programmes', 'Harvard University: tuition fees and programmes', 'Harvard University: tuition fees'])).toBe(
      'Harvard University: tuition fees and programmes',
    );
    expect(fitTitle(['Century College, USA: tuition fees and programmes', 'x'])).toBe('Century College, USA: tuition fees and programmes');
  });
  it('falls back to the shortest (last) title when none fits', () => {
    const long = 'A'.repeat(80);
    expect(fitTitle([`${long}, X: fees and programmes`, `${long}: fees`])).toBe(`${long}: fees`);
  });
  it('an empty list gives an empty title', () => {
    expect(fitTitle([])).toBe('');
  });
});
