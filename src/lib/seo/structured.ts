import { siteUrl } from '@/lib/site-url';
import { seoCity } from './place';

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

/** The one id of the organisation behind the site, so that every page that mentions it points to the same thing. */
export const organizationId = () => `${siteUrl()}/#organization`;

/**
 * Who runs the site (no personal data: the brand, the address and the public contact address only). The logo is the
 * square app icon (search engines want a square logo of at least 112 px, not the wide preview picture).
 */
export function organizationLd(email?: string | null) {
  const base = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId(),
    name: 'YourHEI',
    url: base,
    logo: { '@type': 'ImageObject', url: `${base}/apple-icon.png`, width: 180, height: 180 },
    ...(email ? { email, contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email } } : {}),
  };
}

/** The "about" and "contact" pages: a page about the organisation (its details are in organizationLd). */
export function aboutPageLd(kind: 'AboutPage' | 'ContactPage', locale: string, path: string, name: string, description: string) {
  const base = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': kind,
    name,
    description,
    url: `${base}/${locale}${path}`,
    inLanguage: locale,
    about: { '@id': organizationId() },
  };
}

/** The site in one language, with its search: the catalogue opened with ?q=… shows the programmes whose name has the words. */
export function websiteLd(locale: string, description: string) {
  const base = siteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'YourHEI',
    url: `${base}/${locale}`,
    inLanguage: locale,
    description,
    publisher: { '@id': organizationId() },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${base}/${locale}/catalog?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** The trail of a page that stands right under the home page ("YourHEI > Scholarships"). */
export const topLevelCrumbs = (locale: string, name: string, path: string) => breadcrumbList(locale, [{ name: 'YourHEI', path: '' }, { name, path }]);

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
    // the same organisation as on the home page, with the square logo search engines ask for
    publisher: { '@type': 'Organization', '@id': organizationId(), name: 'YourHEI', url: base, logo: { '@type': 'ImageObject', url: `${base}/apple-icon.png`, width: 180, height: 180 } },
  };
}

export interface InstitutionLdInput {
  type: string;
  name: string;
  /** the name in the original language, when it differs from `name` */
  original?: string | null;
  website?: string | null;
  country: string;
  city?: string | null;
  foundedYear?: number | null;
  /** the Wikidata item ("Q49112"): ties the page to the one real institution */
  wikidataId?: string | null;
  /** the address of this page ("/ru/institutions/us/harvard-university"): gives the institution an id of its own */
  pagePath?: string;
  /** the text about the institution that is shown on the page */
  description?: string | null;
}

/** An institution with its place and site; `sameAs` points to its Wikidata item when the data has one. */
export function institutionLd(i: InstitutionLdInput) {
  const city = seoCity(i.city);
  return {
    '@context': 'https://schema.org',
    '@type': i.type === 'university' || i.type === 'college' ? 'CollegeOrUniversity' : 'EducationalOrganization',
    ...(i.pagePath ? { '@id': `${siteUrl()}${i.pagePath}#institution`, mainEntityOfPage: `${siteUrl()}${i.pagePath}` } : {}),
    name: i.name,
    ...(i.description ? { description: i.description } : {}),
    ...(i.original && i.original !== i.name ? { alternateName: i.original } : {}),
    ...(i.website ? { url: i.website } : {}),
    ...(i.wikidataId ? { sameAs: [`https://www.wikidata.org/wiki/${i.wikidataId}`] } : {}),
    address: { '@type': 'PostalAddress', addressCountry: i.country, ...(city ? { addressLocality: city } : {}) },
    ...(i.foundedYear ? { foundingDate: String(i.foundedYear) } : {}),
  };
}

export interface FaqEntry {
  question: string;
  answer: string;
}

/** Questions and answers that are written on the page (the same texts, never more). */
export function faqPageLd(entries: readonly FaqEntry[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({ '@type': 'Question', name: e.question, acceptedAnswer: { '@type': 'Answer', text: e.answer } })),
  };
}

/** The text put into the <script> tag: "<" is escaped so that the data can never close the tag. */
export function jsonLdText(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
