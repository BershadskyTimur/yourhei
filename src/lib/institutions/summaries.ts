import { createClient } from '@supabase/supabase-js';
import { publicReadOptions } from '@/lib/supabase/read-options';
import { encodeInstitutions, type CompactInstitutions } from './compact';
import { countByType } from './filter';
import { getMapInstitutions } from './get';
import { sitemapInstitutions } from './sitemap';
import { INSTITUTION_TYPES, type InstitutionType } from './types';

/**
 * Small summaries of the institutions, read through database functions (migration 0024) so that only a few kilobytes
 * leave the database instead of all institutions with every name in every language. When the migration has not been
 * run yet, or the answer looks wrong, the old way is used: read everything and cut it here.
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

async function rpc<T>(name: string, args?: Record<string, unknown>): Promise<T | null> {
  const supabase = client();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc(name, args);
    return error || data === null || data === undefined ? null : (data as T);
  } catch {
    return null;
  }
}

/** How many institutions there are, by type and by country. */
export async function getMapCounts(): Promise<MapCounts> {
  const fast = await rpc<{ total?: number; types?: Record<string, number>; countries?: Record<string, number> }>('map_counts');
  if (fast && typeof fast.total === 'number' && fast.types && fast.countries) {
    const types = Object.fromEntries(INSTITUTION_TYPES.map((t) => [t, fast.types?.[t] ?? 0])) as Record<InstitutionType, number>;
    return { total: fast.total, types, countries: fast.countries, error: false };
  }
  const { items, error } = await getMapInstitutions();
  const countries: Record<string, number> = {};
  for (const i of items) countries[i.country] = (countries[i.country] ?? 0) + 1;
  return { total: items.length, types: countByType(items), countries, error };
}

/** The map list in the compact format, with the names in `locale`; null when the database cannot be read. */
export async function getCompactPoints(locale: string): Promise<CompactInstitutions | null> {
  const rows = await rpc<CompactInstitutions['rows']>('map_points', { p_locale: locale });
  if (Array.isArray(rows) && rows.length > 0) return { v: 2, locale, rows };
  const { items, error } = await getMapInstitutions();
  return error ? null : encodeInstitutions(items, locale);
}

/** Slug and country of every institution that has programmes (the pages worth offering to search engines). */
export async function getSitemapPoints(): Promise<{ slug: string; country: string }[]> {
  const fast = await rpc<[string, string][]>('sitemap_points');
  if (Array.isArray(fast) && fast.length > 0) return fast.map(([slug, country]) => ({ slug, country }));
  const items = await sitemapInstitutions();
  return items.map((i) => ({ slug: i.slug, country: i.country }));
}
