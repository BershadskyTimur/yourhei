import { createClient } from '@supabase/supabase-js';
import { publicReadOptions } from '@/lib/supabase/read-options';
import { arr, rec, str, texts, type Row } from '../institutions/program-detail';
import type { LocalizedText } from '../institutions/types';

export interface StudyInstitution {
  slug: string;
  names: LocalizedText;
  city: LocalizedText;
  /** programmes in this field */
  n: number;
  /** names of up to three of them */
  sample: string[];
}

/**
 * The institutions of a country that teach a field, most programmes first (for the page "Study <field> in <country>").
 * A database function (migration 0027) does the counting; until it is installed the programmes are read page by page
 * and counted here. Returns null when the database could not be read (so that a failure is not mistaken for an empty field).
 */
export async function getStudyInstitutions(country: string, code: string, limit = 40): Promise<StudyInstitution[] | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  const supabase = createClient(url, key, publicReadOptions);

  const fast = await supabase.rpc('study_institutions', { p_country: country, p_prefix: code, p_limit: limit });
  if (!fast.error && Array.isArray(fast.data)) {
    return (fast.data as Row[]).flatMap((r) =>
      str(r.slug) ? [{ slug: r.slug as string, names: texts(r.names), city: texts(r.city), n: Number(r.n) || 0, sample: arr(r.sample).filter((s): s is string => typeof s === 'string') }] : [],
    );
  }

  // the slower way (three pages of 1000 programmes at most)
  const byInstitution = new Map<string, StudyInstitution>();
  let after: { institution: string; program: string } | null = null;
  for (let page = 0; page < 3; page++) {
    let res = await supabase.rpc('match_programs', {
      p_level: null,
      p_countries: [country.toUpperCase()],
      p_types: null,
      p_prefixes: [code],
      p_after_institution: after?.institution ?? null,
      p_after_program: after?.program ?? null,
      p_limit: 1000,
    });
    for (let retry = 0; retry < 2 && res.error?.code === '57014'; retry++) {
      res = await supabase.rpc('match_programs', {
        p_level: null, p_countries: [country.toUpperCase()], p_types: null, p_prefixes: [code],
        p_after_institution: after?.institution ?? null, p_after_program: after?.program ?? null, p_limit: 1000,
      });
    }
    if (res.error) {
      console.error('[study] could not read programmes:', res.error.message);
      return null;
    }
    const rows = (Array.isArray(res.data) ? res.data : []) as Row[];
    for (const r of rows) {
      const inst = rec(r.institutions);
      const slug = str(inst.slug);
      if (!slug) continue;
      const entry = byInstitution.get(slug) ?? { slug, names: texts(inst.names), city: texts(inst.city), n: 0, sample: [] };
      entry.n += 1;
      const name = str(texts(r.names).en);
      if (name && entry.sample.length < 3 && !entry.sample.includes(name)) entry.sample.push(name);
      byInstitution.set(slug, entry);
    }
    const last = rows[rows.length - 1];
    if (rows.length < 1000 || !last) break;
    after = { institution: String(rec(last.institutions).id), program: String(last.id) };
  }
  return [...byInstitution.values()].sort((a, b) => b.n - a.n || a.slug.localeCompare(b.slug)).slice(0, limit);
}
