import { createClient } from '@supabase/supabase-js';
import { safeHttpUrl } from '../safe-url';
import { arr, rec, str, texts, type Row } from '../institutions/program-detail';
import type { LocalizedText } from '../institutions/types';

export interface Scholarship {
  names: LocalizedText;
  covers: string | null;
  funder: LocalizedText;
  eligibility: LocalizedText;
  levels: string[];
  url: string | null;
  /** ISO code of the country that gives it (null: several countries) */
  country: string | null;
  institution: { slug: string; country: string; names: LocalizedText } | null;
}

const COLUMNS = 'names, covers, funder, eligibility, levels, url, scope, host_country, institutions (slug, country, names)';

/** Published scholarships: those of whole countries first, then those of single institutions (the first 200). */
export async function getScholarships(): Promise<{ national: Scholarship[]; institutional: Scholarship[] }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return { national: [], institutional: [] };
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.from('scholarships').select(COLUMNS).eq('status', 'published').order('verified_at', { ascending: false }).limit(400);
  if (error) {
    console.error('[scholarships] Supabase error:', error.message);
    return { national: [], institutional: [] };
  }
  const all = (data as unknown as Row[]).map((r): Scholarship & { scope: string | null } => {
    const inst = rec(r.institutions);
    return {
      scope: str(r.scope),
      names: texts(r.names),
      covers: str(r.covers),
      funder: texts(r.funder),
      eligibility: texts(r.eligibility),
      levels: arr(r.levels).filter((l): l is string => typeof l === 'string'),
      url: safeHttpUrl(r.url),
      country: str(r.host_country) ?? str(inst.country),
      institution: str(inst.slug) && str(inst.country) ? { slug: str(inst.slug) as string, country: str(inst.country) as string, names: texts(inst.names) } : null,
    };
  });
  return {
    national: all.filter((s) => s.scope === 'country'),
    institutional: all.filter((s) => s.scope !== 'country' && s.institution).slice(0, 200),
  };
}
