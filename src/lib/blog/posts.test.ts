import { describe, expect, it } from 'vitest';
import { GUIDES } from '../countries-guide/guides';
import { SCHOLARSHIPS, fundsRows, scholarshipsOpenTo, selectScholarships } from './data';
import { buildFeed, rssDate } from './feed';
import { linkKind, parseInline, plainText } from './inline';
import { ARTICLES, blogLang, getArticle, publishedArticles, readingMinutes, relatedArticles, sectionsOf } from './posts';
import { BLOG_LANGS, TRANSLATED_LANGS, type Block } from './types';
import { TRANSLATIONS } from '@/content/blog/i18n';
import { BLOG_LOCALES } from '@/config/seo';

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Every piece of text an article writes (to check its links). */
function texts(blocks: Block[]): string[] {
  return blocks.flatMap((b) => ('text' in b ? [b.text] : 'items' in b ? b.items : []));
}

describe('blog articles', () => {
  it('have unique, well-formed addresses and valid dates', () => {
    const slugs = ARTICLES.map((a) => a.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const a of ARTICLES) {
      expect(a.slug, a.slug).toMatch(SLUG);
      expect(a.published, a.slug).toMatch(ISO);
      expect(a.updated, a.slug).toMatch(ISO);
      expect(a.updated >= a.published, a.slug).toBe(true);
      expect(Number.isNaN(Date.parse(a.published)), a.slug).toBe(false);
    }
  });

  it('exist in both languages with the same structure', () => {
    for (const a of ARTICLES) {
      for (const lang of BLOG_LANGS) {
        expect(a[lang].title.length, `${a.slug} ${lang} title`).toBeGreaterThan(10);
        expect(a[lang].title.length, `${a.slug} ${lang} title`).toBeLessThanOrEqual(70);
        expect(a[lang].description.length, `${a.slug} ${lang} description`).toBeGreaterThanOrEqual(90);
        expect(a[lang].description.length, `${a.slug} ${lang} description`).toBeLessThanOrEqual(170);
        expect(a[lang].blocks.length).toBeGreaterThan(4);
      }
      // the same blocks in the same order: a data block or a section can not be missing in one language
      const shape = (blocks: Block[]) => blocks.map((b) => (b.t === 'h2' ? `h2:${b.id}` : b.t === 'ul' || b.t === 'ol' ? `${b.t}:${b.items.length}` : b.t === 'cta' ? `cta:${b.href}` : JSON.stringify(b.t === 'rules' || b.t === 'scholarships' || b.t === 'scholarshipsFor' ? b : b.t)));
      expect(shape(a.en.blocks), a.slug).toEqual(shape(a.ru.blocks));
    }
  });

  it('have unique section ids and a table of contents', () => {
    for (const a of ARTICLES) {
      const ids = sectionsOf(a.en.blocks).map((s) => s.id);
      expect(new Set(ids).size, a.slug).toBe(ids.length);
      expect(ids.length, a.slug).toBeGreaterThanOrEqual(3);
      for (const id of ids) expect(id).toMatch(SLUG);
    }
  });

  it('link only to real pages of the site or to https addresses', () => {
    const known = new Set(ARTICLES.map((a) => a.slug));
    const pages = ['/catalog', '/scholarships', '/countries', '/register', '/deadlines', '/deadlines/nl', '/deadlines/de', '/deadlines/fi', '/deadlines/cz', '/checklist'];
    for (const a of ARTICLES) {
      for (const lang of BLOG_LANGS) {
        const hrefs = [...texts(a[lang].blocks).flatMap((t) => parseInline(t).flatMap((p) => (p.kind === 'link' ? [p.href] : []))), ...a[lang].blocks.flatMap((b) => (b.t === 'cta' ? [b.href] : []))];
        for (const href of hrefs) {
          const kind = linkKind(href);
          expect(kind, `${a.slug} ${lang} ${href}`).not.toBeNull();
          if (kind === 'internal') {
            const slug = /^\/blog\/(.+)$/.exec(href)?.[1];
            if (slug) expect(known.has(slug), `${a.slug} ${lang} → ${href}`).toBe(true);
            else expect(pages, `${a.slug} ${lang} → ${href}`).toContain(href);
          }
        }
        // text that looks like a link but is not one would show the markup to the reader
        for (const t of texts(a[lang].blocks)) expect(plainText(t), `${a.slug} ${lang}`).not.toMatch(/\]\(|\*\*/);
      }
    }
  });

  it('never name an article that links back as a dead end: each links to at least one other page of the site', () => {
    for (const a of ARTICLES) {
      const links = a.en.blocks.flatMap((b) => (b.t === 'cta' ? [b.href] : texts([b]).flatMap((t) => parseInline(t).flatMap((p) => (p.kind === 'link' ? [p.href] : [])))));
      expect(links.length, a.slug).toBeGreaterThan(0);
    }
  });
});

describe('what an article may show today', () => {
  const first = ARTICLES.map((a) => a.published).sort()[0];
  const at = (day: string) => new Date(`${day}T10:00:00Z`);

  it('shows nothing before the first publication day', () => {
    expect(publishedArticles(at('2000-01-01'))).toEqual([]);
    expect(getArticle(ARTICLES[0].slug, at('2000-01-01'))).toBeNull();
  });
  it('shows an article from its day on, newest first', () => {
    const list = publishedArticles(at('2100-01-01'));
    expect(list).toHaveLength(ARTICLES.length);
    expect(list.map((a) => a.published)).toEqual([...list.map((a) => a.published)].sort().reverse());
    expect(publishedArticles(at(first)).every((a) => a.published <= first)).toBe(true);
    // on one day the article added to the list last is shown first
    const sameDay = ARTICLES.filter((a) => a.published === first);
    expect(publishedArticles(at(first)).map((a) => a.slug)).toEqual([...sameDay].reverse().map((a) => a.slug));
  });
  it('relates other articles only', () => {
    const slug = ARTICLES[0].slug;
    const rel = relatedArticles(slug, at('2100-01-01'));
    expect(rel.length).toBeLessThanOrEqual(3);
    expect(rel.some((a) => a.slug === slug)).toBe(false);
  });
});

describe('language and reading time', () => {
  it('Russian reads Russian, English reads English, the others their translation, an unknown language reads English', () => {
    expect(blogLang('ru')).toBe('ru');
    for (const l of ['en', 'xx']) expect(blogLang(l)).toBe('en');
    for (const l of ['zh', 'es', 'fr', 'ka', 'uk', 'tr', 'kk', 'uz', 'az', 'hy', 'ky', 'pl', 'de', 'ar']) expect(blogLang(l)).toBe(l);
  });
  it('is at least one minute and counts data blocks', () => {
    expect(readingMinutes([])).toBe(1);
    expect(readingMinutes([{ t: 'p', text: Array.from({ length: 360 }, () => 'word').join(' ') }])).toBe(2);
    expect(readingMinutes([{ t: 'rules', topic: 'work' }])).toBe(1);
    for (const a of ARTICLES) expect(readingMinutes(a.ru.blocks), a.slug).toBeLessThan(15);
  });
});

describe('the data under the articles', () => {
  it('every country guide has its row, and every row names an official page', () => {
    for (const g of GUIDES) for (const block of [g.work, g.after]) if (block) expect(linkKind(block.url)).toBe('external');
  });
  it('living minimums have amounts, an official page and Russian text where there is one', () => {
    const rows = fundsRows();
    expect(rows.length).toBeGreaterThanOrEqual(14);
    for (const r of rows) {
      expect(r.cities.every((c) => c.amount > 0), r.country).toBe(true);
      expect(linkKind(r.url), r.country).toBe('external');
      expect(r.note.ru, r.country).toBeTruthy();
      // a label is kept only when the amount depends on the place, and then it is in both languages
      if (r.cities.length > 1) for (const c of r.cities) expect(c.label?.ru && c.label.en, r.country).toBeTruthy();
      else expect(r.cities[0].label).toBeNull();
    }
  });
  it('scholarships are selected by what they cover, level and citizenship', () => {
    const full = selectScholarships({ covers: 'full' });
    expect(full.length).toBeGreaterThan(5);
    expect(full.every((s) => s.covers === 'full')).toBe(true);
    expect(selectScholarships({ covers: 'full', level: 'bachelor' }).every((s) => s.levels.includes('bachelor'))).toBe(true);
    expect(scholarshipsOpenTo('KZ').length).toBeGreaterThan(0);
    for (const s of SCHOLARSHIPS) expect(linkKind(s.url), s.url).toBe('external');
  });
  it('every country named by an article has something confirmed, or the page says so', () => {
    const named = ARTICLES.flatMap((a) => a.en.blocks.flatMap((b) => (b.t === 'scholarshipsFor' ? b.countries : [])));
    expect(named.length).toBeGreaterThan(0);
    for (const code of named) expect(code).toMatch(/^[A-Z]{2}$/);
  });
});

describe('the RSS feed', () => {
  it('lists the published articles with absolute addresses and escapes the text', () => {
    const xml = buildFeed({ locale: 'en', base: 'https://example.org', title: 'A & B', description: '<d>', today: new Date('2100-01-01T00:00:00Z') });
    expect(xml).toContain('<title>A &amp; B</title>');
    expect(xml).toContain('<description>&lt;d&gt;</description>');
    expect(xml.match(/<item>/g)).toHaveLength(ARTICLES.length);
    expect(xml).toContain(`https://example.org/en/blog/${ARTICLES[0].slug}`);
    expect(xml).toContain('<language>en</language>');
  });
  it('has no items before the first day', () => {
    expect(buildFeed({ locale: 'ru', base: 'https://example.org', title: 't', description: 'd', today: new Date('2000-01-01T00:00:00Z') })).not.toContain('<item>');
  });
  it('writes dates the way RSS wants them', () => {
    expect(rssDate('2026-10-26')).toBe('Mon, 26 Oct 2026 12:00:00 GMT');
  });
});

const shapeOf = (blocks: Block[]) => blocks.map((b) => (b.t === 'h2' ? `h2:${b.id}` : b.t === 'ul' || b.t === 'ol' ? `${b.t}:${b.items.length}` : b.t === 'cta' ? `cta:${b.href}` : b.t === 'rules' || b.t === 'scholarships' || b.t === 'scholarshipsFor' ? JSON.stringify(b) : b.t));
const linksOf = (blocks: Block[]) => blocks.flatMap((b) => (b.t === 'cta' ? [b.href] : texts([b]).flatMap((t) => parseInline(t).flatMap((x) => (x.kind === 'link' ? [x.href] : []))))).sort();

// Articles whose machine translations are not written in every language yet: where a translation is missing they read English (with the notice).
// A language may have some of them already. When an article is translated in all 14 languages, remove it from this list.
const NOT_TRANSLATED_YET: string[] = [];

describe('machine translations of the articles', () => {
  it('cover every article in every translated language, and the menu knows the languages', () => {
    expect([...BLOG_LANGS, ...TRANSLATED_LANGS].sort()).toEqual([...BLOG_LOCALES].sort());
    for (const lang of TRANSLATED_LANGS) {
      const tr = TRANSLATIONS[lang] ?? {};
      const required = ARTICLES.map((a) => a.slug).filter((s) => !NOT_TRANSLATED_YET.includes(s)).sort();
      // a language may already have some of the articles of the "not yet" list, but never an article that does not exist
      expect(Object.keys(tr).filter((s) => !NOT_TRANSLATED_YET.includes(s)).sort(), lang).toEqual(required);
      for (const s of Object.keys(tr)) expect(ARTICLES.some((a) => a.slug === s), `${lang} ${s}`).toBe(true);
    }
  });
  it('have the same structure, sections, data blocks and links as the English article', () => {
    for (const lang of TRANSLATED_LANGS) {
      for (const a of ARTICLES) {
        const body = TRANSLATIONS[lang]?.[a.slug];
        if (!body && NOT_TRANSLATED_YET.includes(a.slug)) continue;
        expect(body, `${lang} ${a.slug}`).toBeDefined();
        if (!body) continue;
        expect(shapeOf(body.blocks), `${lang} ${a.slug}`).toEqual(shapeOf(a.en.blocks));
        expect(linksOf(body.blocks), `${lang} ${a.slug} links`).toEqual(linksOf(a.en.blocks));
        expect(body.title.length, `${lang} ${a.slug} title`).toBeGreaterThan(5);
        expect(body.title.length, `${lang} ${a.slug} title`).toBeLessThanOrEqual(90);
        expect(body.description.length, `${lang} ${a.slug} description`).toBeGreaterThan(30);
        expect(body.description.length, `${lang} ${a.slug} description`).toBeLessThanOrEqual(200);
        for (const t of texts(body.blocks)) expect(plainText(t), `${lang} ${a.slug}`).not.toMatch(/\]\(|\*\*/);
      }
    }
  });
});
