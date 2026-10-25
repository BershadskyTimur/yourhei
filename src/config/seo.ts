// Which languages are offered to search engines (docs/SEO_STRATEGY.md, decision of 24.10.2026). Only these languages are in the
// sitemap and in the hreflang links, and only their pages may be indexed: the other languages stay open to visitors, but carry
// "noindex" until a person has read the translation. To open a language, add its code here (nothing else needs to change).
export const INDEXED_LOCALES: readonly string[] = ['ru', 'en'];

/** The languages the blog has its own text in (written by hand, or machine translated and marked as such). */
export const BLOG_LOCALES: readonly string[] = ['ru', 'en', 'zh', 'es', 'fr', 'ka', 'uk', 'tr', 'kk', 'uz'];

/** The language shown to search engines (and to people from everywhere) when no better version exists: hreflang "x-default". */
export const X_DEFAULT_LOCALE = 'en';

export const isIndexedLocale = (locale: string): boolean => INDEXED_LOCALES.includes(locale);
