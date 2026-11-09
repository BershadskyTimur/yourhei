import { createClient } from '@supabase/supabase-js';
import { publicReadOptions } from '@/lib/supabase/read-options';
import { str, type Row } from './program-detail';

// "Similar institutions" on an institution page: other institutions of the same type in the same country. They are its neighbours in
// the order of the addresses (the next ones after it, then from the start of the list), so that every page links to different pages
// and each institution page is linked from a few others: the way search engines reach the pages that no list puts near the top.
// Only the name in the language of the page, the English name and the city are read (about 1 KB, cached a day with the page).

export interface SimilarInstitution {
  slug: string;
  name: string;
  city: string | null;
}

export const SIMILAR_COUNT = 6;

/** The next `count` of the list after the institution, then from the start; never the institution itself, no repeats. */
export function pickNeighbours<T extends { slug: string }>(after: readonly T[], fromStart: readonly T[], self: string, count = SIMILAR_COUNT): T[] {
  const out: T[] = [];
  for (const item of [...after, ...fromStart]) {
    if (out.length >= count) break;
    if (item.slug !== self && !out.some((o) => o.slug === item.slug)) out.push(item);
  }
  return out;
}

/** The language field of the names to read: the page language when it is a plain code. */
const field = (locale: string) => (/^[a-z]{2}$/.test(locale) ? locale : 'en');

export async function getSimilarInstitutions(country: string, type: string, slug: string, locale: string): Promise<SimilarInstitution[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key, publicReadOptions);
  const lang = field(locale);
  const columns = `slug, n:names->>${lang}, en:names->>en, o:names->>original, c:city->>${lang}, ce:city->>en`;
  const base = () => supabase.from('institutions').select(columns).eq('country', country.toUpperCase()).eq('type', type).eq('status', 'published');
  try {
    const after = await base().gt('slug', slug).order('slug').limit(SIMILAR_COUNT);
    if (after.error) return [];
    const rows = (after.data ?? []) as unknown as Row[];
    const fromStart = rows.length < SIMILAR_COUNT ? await base().lt('slug', slug).order('slug').limit(SIMILAR_COUNT) : null;
    const toItem = (r: Row): SimilarInstitution | null => {
      const s = str(r.slug);
      // a name that is a list of several schools shows its first one (the full list is on the page itself)
      const name = (str(r.n) ?? str(r.en) ?? str(r.o))?.split(';')[0].trim();
      return s && name && !/^n\/?a$/i.test(name) ? { slug: s, name, city: str(r.c) ?? str(r.ce) } : null;
    };
    const list = (data: unknown) => ((data ?? []) as Row[]).map(toItem).filter((x): x is SimilarInstitution => x !== null);
    return pickNeighbours(list(rows), list(fromStart?.data), slug);
  } catch {
    return [];
  }
}
