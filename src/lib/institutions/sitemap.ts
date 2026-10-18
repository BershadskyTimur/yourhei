import { createClient } from '@supabase/supabase-js';
import { publicReadOptions } from '@/lib/supabase/read-options';
import { getMapInstitutions } from './get';
import type { MapInstitution } from './types';

/** A sitemap file holds this many institutions (each has one address per language). */
export const SITEMAP_CHUNK = 300;

/**
 * The institutions offered to search engines: the ones that have programmes (migration 0023). The others are bare map
 * entries; leaving them out keeps the crawlers' traffic, and the page regenerations they cause, within the free plan.
 * Until the migration is run (or when the database answers with an error) all institutions are listed, as before.
 */
export async function sitemapInstitutions(): Promise<MapInstitution[]> {
  const { items } = await getMapInstitutions();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return items;
  try {
    const supabase = createClient(url, key, publicReadOptions);
    const { data, error } = await supabase.rpc('institution_ids_with_programmes');
    if (error || !Array.isArray(data) || data.length === 0) return items;
    const withProgrammes = new Set(data as string[]);
    return items.filter((i) => withProgrammes.has(i.id));
  } catch {
    return items;
  }
}
