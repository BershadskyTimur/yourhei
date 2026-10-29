import { createClient } from '@supabase/supabase-js';
import { publicReadOptions } from '@/lib/supabase/read-options';
import { encodeInstitutions, type CompactInstitutions } from './compact';
import { countByType } from './filter';
import { getMapInstitutions } from './get';
import { sitemapInstitutions } from './sitemap';
import { INSTITUTION_TYPES, type InstitutionType } from './types';

/**
 * Small summaries of the institutions, read through database functions (migration 0024) so that only a few kilobytes
 * leave the database instead of all institutions with every name in every language. Only when the function does not
 * exist (the migration has not been run) is everything read and cut here. A slow answer (the database time limit, often
 * the first read after a quiet period) is asked once more instead: reading every institution as a fallback cost far more
 * of the database traffic allowance than waiting (October 2026).
 */

export interface MapCounts {
  total: number;
  types: Record<InstitutionType, number>;
  countries: Record<string, number>;
  /** the database could not be read at all */
  error: boolean;
}

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? createClient(url, key, publicReadOptions) : null;
}

/** The answer of a database function; `missing` = the function is not installed (then the slow way may be used). */
async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<{ data: T | null; missing: boolean }> {
  const supabase = client();
  if (!supabase) return { data: null, missing: true };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const { data, error } = await supabase.rpc(name, args);
      if (!error && data !== null && data !== undefined) return { data: data as T, missing: false };
      if (error && /PGRST202|42883/.test(`${error.code}`)) return { data: null, missing: true };
      if (error?.code !== '57014') return { data: null, missing: false }; // only a timeout is worth a second try
    } catch {
      return { data: null, missing: false };
    }
  }
  return { data: null, missing: false };
}

/** How many institutions there are, by type and by country. */
export async function getMapCounts(): Promise<MapCounts> {
  const { data: fast, missing } = await rpc<{ total?: number; types?: Record<string, number>; countries?: Record<string, number> }>('map_counts');
  if (fast && typeof fast.total === 'number' && fast.types && fast.countries) {
    const types = Object.fromEntries(INSTITUTION_TYPES.map((t) => [t, fast.types?.[t] ?? 0])) as Record<InstitutionType, number>;
    return { total: fast.total, types, countries: fast.countries, error: false };
  }
  if (!missing) return { total: 0, types: Object.fromEntries(INSTITUTION_TYPES.map((t) => [t, 0])) as Record<InstitutionType, number>, countries: {}, error: true };
  const { items, error } = await getMapInstitutions();
  const countries: Record<string, number> = {};
  for (const i of items) countries[i.country] = (countries[i.country] ?? 0) + 1;
  return { total: items.length, types: countByType(items), countries, error };
}

/** The map list in the compact format, with the names in `locale`; null when the database cannot be read. */
export async function getCompactPoints(locale: string): Promise<CompactInstitutions | null> {
  const { data: rows, missing } = await rpc<CompactInstitutions['rows']>('map_points', { p_locale: locale });
  if (Array.isArray(rows) && rows.length > 0) return { v: 2, locale, rows };
  if (!missing) return null; // the map says it could not load; the next visit asks again
  const { items, error } = await getMapInstitutions();
  return error ? null : encodeInstitutions(items, locale);
}

/** Slug and country of every institution that has programmes (the pages worth offering to search engines). */
export async function getSitemapPoints(): Promise<{ slug: string; country: string }[]> {
  // robots.txt and the sitemap must never fail, so here the slow way stays as the last resort (once a day at most)
  const { data: fast } = await rpc<[string, string][]>('sitemap_points');
  if (Array.isArray(fast) && fast.length > 0) return fast.map(([slug, country]) => ({ slug, country }));
  const items = await sitemapInstitutions();
  return items.map((i) => ({ slug: i.slug, country: i.country }));
}
