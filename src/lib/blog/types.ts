// The blog: articles are written as plain data (a list of blocks per language), so that nothing in them can run code, the pages
// stay in the site's design, and tests can check every article (both languages, dates, links, the data blocks).

export const BLOG_LANGS = ['ru', 'en'] as const;
export type BlogLang = (typeof BLOG_LANGS)[number];

export type Block =
  | { t: 'p'; text: string }
  /** a section title; the id is the anchor of the table of contents and must be the same in both languages */
  | { t: 'h2'; id: string; text: string }
  | { t: 'h3'; text: string }
  | { t: 'ul'; items: string[] }
  | { t: 'ol'; items: string[] }
  | { t: 'note'; text: string }
  /** a button-like link to a page of the site */
  | { t: 'cta'; href: string; text: string }
  /** work during studies / staying after graduation, for every country of the country guides (data/countries/guides.json) */
  | { t: 'rules'; topic: 'work' | 'after' }
  /** the money a country asks a student to prove for the visa (data/reference/living-costs.json) */
  | { t: 'funds' }
  /** national scholarships chosen by what they cover and the level (data/scholarships/national.json) */
  | { t: 'scholarships'; covers?: 'full'; level?: 'bachelor' | 'master' | 'phd' }
  /** scholarships whose official page lists these citizenships, one group per country */
  | { t: 'scholarshipsFor'; countries: string[] };

export interface ArticleBody {
  title: string;
  /** what search engines show under the title: 90-170 characters */
  description: string;
  blocks: Block[];
}

export interface Article {
  /** the address (/blog/<slug>), the same in both languages */
  slug: string;
  /** ISO date; an article is shown from this day on (so a week of articles can be prepared in advance) */
  published: string;
  /** ISO date of the last change of the text or of the data under it */
  updated: string;
  ru: ArticleBody;
  en: ArticleBody;
}
