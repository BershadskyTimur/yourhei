import { createClient } from '@supabase/supabase-js';
import { publicReadOptions } from '@/lib/supabase/read-options';
import { str, texts, type Row } from './program-detail';
import { getSitemapCountryCounts, getSitemapPoints } from './summaries';
import type { LocalizedText } from './types';

// The lists "institutions of a country" (/institutions/<country>, /institutions/<country>/p/<n>): plain links to every
// institution page that is offered to search engines, so that each one can be reached from the site and not only from the
// sitemap (07.11.2026: 4 270 of 5 713 institution pages had no link at all). The list is the one of the sitemap
// (institutions with programmes), so the two always agree; only the names and cities of one page are read from the database.

/** Institutions on one page of the list. */
export const LIST_PAGE = 200;
/** A country gets its list only from this many institutions: a page of one or two links is too thin to offer. */
export const MIN_LIST = 3;

export interface Point {
  slug: string;
  country: string;
}

/** The countries that have a list, with how many institutions each has, most first (ties by code). */
export function listCountries(points: readonly Point[]): { country: string; count: number }[] {
  return listFromCounts(points.map((p) => [p.country, 1]));
}

/** The same from counts by country ([country, count], a country may appear more than once). */
export function listFromCounts(counts: readonly (readonly [string, number])[]): { country: string; count: number }[] {
  const by = new Map<string, number>();
  for (const [country, n] of counts) by.set(country.toUpperCase(), (by.get(country.toUpperCase()) ?? 0) + n);
  return [...by.entries()]
    .filter(([, n]) => n >= MIN_LIST)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
}

/** How many pages a list of `count` institutions has. */
export const pagesOf = (count: number): number => Math.max(1, Math.ceil(count / LIST_PAGE));

/**
 * The slugs on page `page` (1-based) of a country's list, in the order of their address (close to the English name, and
 * stable from one day to the next), with the size of the whole list. Empty when the country has no list or the page is past the end.
 */
export function pageSlugs(points: readonly Point[], country: string, page: number): { slugs: string[]; total: number } {
  const cc = country.toUpperCase();
  const all = points.filter((p) => p.country.toUpperCase() === cc).map((p) => p.slug).sort();
  if (all.length < MIN_LIST || !Number.isInteger(page) || page < 1) return { slugs: [], total: all.length };
  return { slugs: all.slice((page - 1) * LIST_PAGE, page * LIST_PAGE), total: all.length };
}

export interface ListedInstitution {
  slug: string;
  names: LocalizedText;
  city: LocalizedText;
}

export interface CountryListPage {
  items: ListedInstitution[];
  total: number;
  pages: number;
}

/** The countries with a list (for the index page and the links from institution, guide and study pages). */
export async function getListCountries(): Promise<{ country: string; count: number }[]> {
  return listFromCounts(await getSitemapCountryCounts());
}

/**
 * One page of a country's list. `null` = no such page (no list, or past the end): "not found".
 * Throws when the database cannot be read, so that a failure is not cached as an empty page.
 */
export async function getCountryListPage(country: string, page: number): Promise<CountryListPage | null> {
  const { slugs, total } = pageSlugs(await getSitemapPoints(), country, page);
  if (slugs.length === 0) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('institution list: the database is not configured');
  const supabase = createClient(url, key, publicReadOptions);
  const { data, error } = await supabase.from('institutions').select('slug, names, city').eq('country', country.toUpperCase()).in('slug', slugs);
  if (error || !Array.isArray(data)) throw new Error(`institution list: the database could not be read (${error?.message ?? 'no data'})`);
  const bySlug = new Map((data as Row[]).filter((r) => str(r.slug)).map((r) => [r.slug as string, { slug: r.slug as string, names: texts(r.names), city: texts(r.city) }]));
  // the order of the list, not of the database answer; a slug the database no longer has is left out
  const items = slugs.flatMap((s) => (bySlug.has(s) ? [bySlug.get(s)!] : []));
  return { items, total, pages: pagesOf(total) };
}
