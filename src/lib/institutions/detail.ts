import { createClient } from '@supabase/supabase-js';
import { safeHttpUrl } from '../safe-url';
import { getMapInstitutions } from './get';
import { arr, num, oneOf, rec, str, texts, toProgramDetail, type ProgramDetail, type Row } from './program-detail';
import { isInstitutionType, type InstitutionType, type LocalizedText } from './types';

export type { Money, ProgramDetail, TuitionLine } from './program-detail';

// The full card of one institution (server side): base data, published programmes, rankings, scholarships.
// Programmes and scholarships are read through the public key, so the database only returns published rows.

export interface InstitutionDetail {
  id: string | null;
  slug: string;
  type: InstitutionType;
  country: string;
  city: LocalizedText;
  names: LocalizedText;
  website: string | null;
  foundedYear: number | null;
  ownership: 'public' | 'private' | null;
  dormitory: boolean | null;
  features: string[];
  description: LocalizedText;
  verifiedAt: string | null;
  programs: ProgramDetail[];
  rankings: { name: string; year: number; position: string }[];
  scholarships: { names: LocalizedText; covers: string | null; url: string | null }[];
}

const COLUMNS = `id, slug, type, country, city, names, website, ownership, founded_year, dormitory, features, description, verified_at, status,
  programs (id, names, level, isced_f, languages, duration_years, intakes, tuition, free, requirements, deadlines, application_fee, application_url, academic_year, status),
  rankings (name, year, position, scope),
  scholarships (names, covers, url, status)`;

/** The card of one institution, or null when it does not exist. */
export async function getInstitutionDetail(country: string, slug: string): Promise<InstitutionDetail | null> {
  const cc = country.toUpperCase();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    // No database configured: only the local sample data (name, city, website).
    const { items } = await getMapInstitutions();
    const i = items.find((x) => x.country === cc && x.slug === slug);
    return i
      ? { id: null, slug: i.slug, type: i.type, country: i.country, city: i.city, names: i.names, website: safeHttpUrl(i.website), foundedYear: i.foundedYear, ownership: null, dormitory: null, features: [], description: {}, verifiedAt: null, programs: [], rankings: [], scholarships: [] }
      : null;
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.from('institutions').select(COLUMNS).eq('country', cc).eq('slug', slug).maybeSingle();
  if (error) {
    console.error('[institution] Supabase error:', error.message);
    return null;
  }
  if (!data) return null;
  const r = data as unknown as Row;
  const type = str(r.type);
  if (!type || !isInstitutionType(type)) return null;
  const published = (rows: unknown) => arr(rows).map(rec).filter((x) => x.status === undefined || x.status === 'published');
  return {
    id: str(r.id),
    slug,
    type,
    country: cc,
    city: texts(r.city),
    names: texts(r.names),
    website: safeHttpUrl(r.website),
    foundedYear: num(r.founded_year),
    ownership: oneOf(r.ownership, ['public', 'private'] as const),
    dormitory: typeof r.dormitory === 'boolean' ? r.dormitory : null,
    features: arr(r.features).filter((f): f is string => typeof f === 'string'),
    description: texts(r.description),
    verifiedAt: r.status === 'published' ? str(r.verified_at) : null,
    programs: published(r.programs).flatMap((p) => toProgramDetail(p) ?? []),
    rankings: arr(r.rankings).flatMap((x) => {
      const k = rec(x);
      return str(k.name) && num(k.year) !== null && str(k.position) ? [{ name: k.name as string, year: num(k.year) as number, position: k.position as string }] : [];
    }),
    scholarships: published(r.scholarships).map((s) => ({ names: texts(s.names), covers: str(s.covers), url: safeHttpUrl(s.url) })),
  };
}
