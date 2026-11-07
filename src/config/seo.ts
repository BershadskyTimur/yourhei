// Which languages are offered to search engines (docs/SEO_STRATEGY.md).
// - INDEXED_LOCALES: every page (decision of 24.10.2026: Russian and English, written or read by a person).
// - CONTENT_LOCALES: every page except the institution pages and the lists of institutions (decision of the owner, 07.11.2026:
//   the translations are good enough to offer; the institution pages are mostly Latin names and short machine-made labels).
// The other languages stay open to visitors, but carry "noindex" until a person has read the translation. To open a language,
// add its code to one of the lists (nothing else needs to change).
export const INDEXED_LOCALES: readonly string[] = ['ru', 'en'];
export const CONTENT_LOCALES: readonly string[] = ['es', 'zh', 'de', 'fr', 'pl'];

/** The languages the blog has its own text in (written by hand, or machine translated and marked as such). */
export const BLOG_LOCALES: readonly string[] = ['ru', 'en', 'zh', 'es', 'fr', 'ka', 'uk', 'tr', 'kk', 'uz', 'az', 'hy', 'ky', 'pl', 'de', 'ar'];

/** The language shown to search engines (and to people from everywhere) when no better version exists: hreflang "x-default". */
export const X_DEFAULT_LOCALE = 'en';

/** The institution pages and the lists of institutions ("/institutions", "/institutions/de/…"). */
const INSTITUTION_PAGES = /^\/institutions(\/|$)/;

/** The languages a page of this path (inside a language: "", "/blog/…", "/institutions/de/…") is offered to search engines in. */
export function indexedLocalesFor(path: string): readonly string[] {
  return INSTITUTION_PAGES.test(path) ? INDEXED_LOCALES : [...INDEXED_LOCALES, ...CONTENT_LOCALES];
}

/** Whether a page of this path in this language may be indexed (without a path: whether every page may be). */
export const isIndexedLocale = (locale: string, path?: string): boolean => (path === undefined ? INDEXED_LOCALES : indexedLocalesFor(path)).includes(locale);
