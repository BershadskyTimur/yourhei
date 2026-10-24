import type { Metadata } from 'next';
import { INDEXED_LOCALES, X_DEFAULT_LOCALE, isIndexedLocale } from '@/config/seo';

// The "search engine" part of a page's metadata, built in one place so that every page does it the same way: the address of the page,
// the links between the language versions (hreflang), whether the page may be indexed, and the preview (Open Graph / Twitter).

export interface SeoInput {
  locale: string;
  /** the path inside a language, "" for the home page, "/countries/de" ... (no language, no trailing slash) */
  path: string;
  title: string;
  description?: string;
  /** a page that must stay out of the results whatever the language (a thin page) */
  noindex?: boolean;
  /** "article" for blog posts */
  type?: 'website' | 'article';
  /** ISO date of the article (published / changed) */
  published?: string;
  modified?: string;
}

/** The languages a page of this path is offered in (for hreflang). */
export function languageLinks(path: string): Record<string, string> {
  const links = Object.fromEntries(INDEXED_LOCALES.map((l) => [l, `/${l}${path}`]));
  links['x-default'] = `/${X_DEFAULT_LOCALE}${path}`;
  return links;
}

export function seoMetadata(input: SeoInput): Metadata {
  const { locale, path, title, description } = input;
  const indexable = isIndexedLocale(locale) && !input.noindex;
  const url = `/${locale}${path}`;
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical: url, ...(indexable ? { languages: languageLinks(path) } : {}) },
    // a page that is not offered to search engines still lets them follow its links
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url,
      siteName: 'YourHEI',
      locale,
      type: input.type ?? 'website',
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'YourHEI' }],
      ...(input.type === 'article' ? { publishedTime: input.published, modifiedTime: input.modified } : {}),
    },
    twitter: { card: 'summary_large_image', title, ...(description ? { description } : {}), images: ['/og.png'] },
  };
}

/** A description cut at a word near 160 characters (what search engines show). */
export function trimDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), max - 30))}…`;
}
