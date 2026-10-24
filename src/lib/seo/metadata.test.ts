import { describe, expect, it } from 'vitest';
import { languageLinks, seoMetadata, trimDescription } from './metadata';

describe('seoMetadata', () => {
  it('an indexed language: self canonical, hreflang for the indexed languages and x-default, indexable', () => {
    const m = seoMetadata({ locale: 'ru', path: '/countries/de', title: 'T', description: 'D' });
    expect(m.alternates?.canonical).toBe('/ru/countries/de');
    expect(m.alternates?.languages).toEqual({ ru: '/ru/countries/de', en: '/en/countries/de', 'x-default': '/en/countries/de' });
    expect(m.robots).toBeUndefined();
    expect(m.openGraph).toMatchObject({ title: 'T', description: 'D', url: '/ru/countries/de', locale: 'ru' });
  });

  it('another language: noindex (links are still followed), self canonical, no hreflang', () => {
    const m = seoMetadata({ locale: 'ka', path: '/countries/de', title: 'T' });
    expect(m.robots).toEqual({ index: false, follow: true });
    expect(m.alternates?.canonical).toBe('/ka/countries/de');
    expect(m.alternates?.languages).toBeUndefined();
  });

  it('a thin page is out of the results in every language', () => {
    expect(seoMetadata({ locale: 'en', path: '/x', title: 'T', noindex: true }).robots).toEqual({ index: false, follow: true });
  });

  it('the home page has an empty path', () => {
    expect(languageLinks('')).toEqual({ ru: '/ru', en: '/en', 'x-default': '/en' });
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
});
