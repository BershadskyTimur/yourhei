import { siteUrl } from '@/lib/site-url';

// Structured data for search engines (schema.org, JSON-LD): small pure builders, one per kind, used by the pages.

export interface Crumb {
  name: string;
  /** path inside the language ("" for the home page) */
  path: string;
}

/** The trail "YourHEI > country > institution" shown in the search results instead of the plain address. */
export function breadcrumbList(locale: string, crumbs: Crumb[]) {
  const base = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: `${base}/${locale}${c.path}` })),
  };
}

/** Who runs the site (no personal data: the brand and the address only). */
export function organizationLd() {
  const base = siteUrl();
  return { '@context': 'https://schema.org', '@type': 'Organization', name: 'YourHEI', url: base, logo: `${base}/og.png` };
}

export function websiteLd(locale: string, description: string) {
  const base = siteUrl();
  return { '@context': 'https://schema.org', '@type': 'WebSite', name: 'YourHEI', url: `${base}/${locale}`, inLanguage: locale, description };
}

export interface ArticleLdInput {
  locale: string;
  path: string;
  title: string;
  description: string;
  published: string;
  modified: string;
}

/** A blog article: who wrote it (the editorial team of the site), when, and in which language. */
export function articleLd(a: ArticleLdInput) {
  const base = siteUrl();
  const url = `${base}/${a.locale}${a.path}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    inLanguage: a.locale,
    datePublished: a.published,
    dateModified: a.modified,
    mainEntityOfPage: url,
    image: `${base}/og.png`,
    author: { '@type': 'Organization', name: 'YourHEI', url: base },
    publisher: { '@type': 'Organization', name: 'YourHEI', url: base, logo: { '@type': 'ImageObject', url: `${base}/og.png` } },
  };
}

/** The text put into the <script> tag: "<" is escaped so that the data can never close the tag. */
export function jsonLdText(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
