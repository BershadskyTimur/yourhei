import { createClient } from '@supabase/supabase-js';
import seed from '../../../data/seed/institutions.json';
import { isInstitutionType, type MapInstitution } from './types';

export interface InstitutionsResult {
  items: MapInstitution[];
  /** "supabase" = real database, "seed" = local test file (used until Supabase is configured). */
  source: 'supabase' | 'seed';
  error: boolean;
}

interface MapRow {
  id: string;
  slug: string;
  type: string;
  country: string;
  city: Record<string, string>;
  names: Record<string, string>;
  lat: number;
  lng: number;
  website: string | null;
  founded_year: number | null;
}

interface SeedRow {
  slug: string;
  type: string;
  country: string;
  city: Record<string, string>;
  names: Record<string, string>;
  lat: number;
  lng: number;
  website: string | null;
  foundedYear: number | null;
}

function fromSeed(): MapInstitution[] {
  return (seed as unknown as SeedRow[]).flatMap((s) =>
    isInstitutionType(s.type)
      ? [
          {
            id: `seed-${s.country}-${s.slug}`,
            slug: s.slug,
            type: s.type,
            country: s.country,
            city: s.city,
            names: s.names,
            lat: s.lat,
            lng: s.lng,
            website: s.website,
            foundedYear: s.foundedYear,
          },
        ]
      : [],
  );
}

/**
 * Loads the institutions for the map (server side only).
 * With no Supabase keys in .env.local it uses data/seed/institutions.json, so the site
 * works right after download. With keys, a database error is reported, not hidden.
 */
export async function getMapInstitutions(): Promise<InstitutionsResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    const items = fromSeed();
    logSource('local test file (Supabase keys not set)', items.length);
    return { items, source: 'seed', error: false };
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  // Supabase returns at most 1000 rows per request, so the list is read page by page.
  const PAGE = 1000;
  const data: unknown[] = [];
  let error: { message: string } | null = null;
  for (let from = 0; ; from += PAGE) {
    const res = await supabase
      .from('map_institutions')
      .select('id, slug, type, country, city, names, lat, lng, website, founded_year')
      .order('id')
      .range(from, from + PAGE - 1);
    if (res.error) {
      error = res.error;
      break;
    }
    data.push(...(res.data ?? []));
    if ((res.data ?? []).length < PAGE) break;
  }

  if (error) {
    console.error('[institutions] Supabase error:', error?.message);
    return { items: [], source: 'supabase', error: true };
  }

  const items = (data as MapRow[]).flatMap((r) =>
    isInstitutionType(r.type)
      ? [
          {
            id: r.id,
            slug: r.slug,
            type: r.type,
            country: r.country,
            city: r.city,
            names: r.names,
            lat: r.lat,
            lng: r.lng,
            website: r.website,
            foundedYear: r.founded_year,
          },
        ]
      : [],
  );
  logSource('Supabase', items.length);
  return { items, source: 'supabase', error: false };
}

// Printed in the terminal while developing, so it is easy to see where the data came from.
function logSource(source: string, count: number) {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[institutions] loaded ${count} from ${source}`);
  }
}
