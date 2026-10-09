import type { SupabaseClient } from '@supabase/supabase-js';
import { isInstitutionType } from '../institutions/types';
import { safeHttpUrl } from '../safe-url';
import type { AppliesTo, CountryFacts, Level, MatchInstitution, MatchProgram, Period, Ranking, StudyFormat, Tuition } from './types';

// Reads the published programmes and country facts from Supabase and turns database rows into the
// plain objects the matching engine works with. Anything odd in a row becomes null ("no data").

type Row = Record<string, unknown>;
const str = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const rec = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const strMap = (v: unknown): Record<string, string> => Object.fromEntries(Object.entries(rec(v)).filter(([, x]) => typeof x === 'string')) as Record<string, string>;
const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | null => (typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : null);

const LEVELS = ['school', 'college', 'foundation', 'bachelor', 'master', 'phd', 'language_course'] as const;

function toInstitution(row: Row): MatchInstitution | null {
  const type = str(row.type);
  if (!type || !isInstitutionType(type) || !str(row.id) || !str(row.country)) return null;
  const rankings: Ranking[] = arr(row.rankings).flatMap((r) => {
    const x = rec(r);
    const scope = oneOf(x.scope, ['world', 'country'] as const);
    return str(x.name) && num(x.year) !== null && str(x.position) && scope
      ? [{ name: x.name as string, year: num(x.year) as number, position: x.position as string, scope }]
      : [];
  });
  return {
    id: row.id as string,
    slug: str(row.slug) ?? '',
    type,
    country: row.country as string,
    city: strMap(row.city),
    names: strMap(row.names),
    ownership: oneOf(row.ownership, ['public', 'private'] as const),
    size: oneOf(row.size, ['large', 'small'] as const),
    citySize: oneOf(row.city_size, ['megapolis', 'medium', 'small_student'] as const),
    climate: oneOf(row.climate, ['warm', 'temperate', 'cold'] as const),
    dormitory: typeof row.dormitory === 'boolean' ? row.dormitory : null,
    features: arr(row.features).filter((f): f is string => typeof f === 'string'),
    rankings,
    verifiedAt: str(row.verified_at),
  };
}

export function toProgram(row: Row): MatchProgram | null {
  const level = oneOf(row.level, LEVELS) as Level | null;
  const institution = toInstitution(rec(row.institutions));
  if (!level || !institution || !str(row.id)) return null;

  const tuition: Tuition[] = arr(row.tuition).flatMap((t) => {
    const x = rec(t);
    const period = oneOf(x.period, ['year', 'semester', 'credit', 'total'] as const) as Period | null;
    const appliesTo = (oneOf(x.applies_to, ['domestic', 'international', 'eu', 'all'] as const) ?? 'all') as AppliesTo;
    return str(x.currency) && period ? [{ amount: num(x.amount), currency: x.currency as string, period, appliesTo }] : [];
  });

  const req = rec(row.requirements);
  const gpa = rec(req.min_gpa);
  const fee = rec(row.application_fee);
  return {
    id: row.id as string,
    institution,
    names: strMap(row.names),
    level,
    iscedF: str(row.isced_f),
    languages: arr(row.languages).filter((l): l is string => typeof l === 'string'),
    durationYears: num(row.duration_years),
    format: oneOf(row.format, ['on_campus', 'online', 'blended'] as const) as StudyFormat | null,
    intakes: arr(row.intakes).filter((m): m is string => typeof m === 'string'),
    tuition,
    free: row.free === true,
    requirements: {
      minGpa: str(gpa.system) && num(gpa.value) !== null ? { system: gpa.system as string, value: num(gpa.value) as number } : null,
      minScores: arr(req.min_scores).flatMap((s) => {
        const x = rec(s);
        return str(x.exam) && num(x.min) !== null ? [{ exam: x.exam as string, min: num(x.min) as number }] : [];
      }),
      documents: arr(req.documents).filter((d): d is string => typeof d === 'string'),
    },
    applicationFee: str(fee.currency) ? { amount: num(fee.amount), currency: fee.currency as string } : null,
    applicationUrl: safeHttpUrl(row.application_url),
  };
}

export function toCountryFacts(row: Row): CountryFacts | null {
  const code = str(row.country);
  if (!code) return null;
  const bool = (v: unknown) => (typeof v === 'boolean' ? v : null);
  return {
    code,
    currency: str(row.currency),
    workDuringStudy: bool(row.work_during_study),
    postStudyWorkVisa: bool(row.post_study_work_visa),
    recognition: bool(row.recognition),
    costOfLiving: arr(row.cost_of_living).flatMap((c) => {
      const x = rec(c);
      return str(x.currency) ? [{ city: strMap(x.city), amountPerMonth: num(x.amount_per_month), currency: x.currency as string }] : [];
    }),
  };
}

const PROGRAM_COLUMNS = `id, names, level, isced_f, languages, duration_years, format, intakes, tuition, free, requirements, application_fee, application_url,
  institutions!inner (id, slug, type, country, city, names, ownership, size, city_size, climate, dormitory, features, verified_at, rankings (name, year, position, scope))`;

/** Only programmes that can pass the hard filters of the matcher are read: the database holds many thousands. */
export interface ProgramFilter {
  level?: string;
  countries?: string[];
  types?: string[];
  /** ISCED-F code starts (e.g. "061"): only programmes in these fields are read. Empty = every field. */
  fieldPrefixes?: string[];
}

const PAGE = 1000;
const MAX_PAGES = 20; // at most 20 000 programmes: more would make the page slow

/** The published programmes (that fit `filter`) and the facts about their countries. Throws if the database cannot be read. */
export async function loadMatchData(supabase: SupabaseClient, filter: ProgramFilter = {}): Promise<{ programs: MatchProgram[]; countries: Record<string, CountryFacts> }> {
  const rows: Row[] = [];
  // The fast way: a database function that starts from the institutions of the chosen countries and pages by keyset
  // (migration 0014). Before it is installed the older query below is used.
  let after: { institution: string; program: string } | null = null;
  let useFunction = true;
  for (let page = 0; page < MAX_PAGES && useFunction; page++) {
    const args = {
      p_level: filter.level || null,
      p_countries: filter.countries?.length ? filter.countries : null,
      p_types: filter.types?.length ? filter.types : null,
      p_prefixes: filter.fieldPrefixes?.length ? filter.fieldPrefixes : null,
      p_after_institution: after?.institution ?? null,
      p_after_program: after?.program ?? null,
      p_limit: PAGE,
    };
    let res = await supabase.rpc('match_programs', args);
    // the first read after a quiet period can hit the database time limit (cold cache); the second one is fast
    for (let retry = 0; retry < 2 && res.error?.code === '57014'; retry++) res = await supabase.rpc('match_programs', args);
    if (res.error) {
      if (page === 0 && /match_programs|PGRST202/.test(`${res.error.code} ${res.error.message}`)) {
        useFunction = false;
        break;
      }
      throw res.error;
    }
    const list = (Array.isArray(res.data) ? res.data : []) as Row[];
    rows.push(...list);
    const last = list[list.length - 1];
    if (list.length < PAGE || !last) {
      page = MAX_PAGES;
      break;
    }
    after = { institution: String(rec(last.institutions).id), program: String(last.id) };
  }
  if (!useFunction) {
    for (let page = 0; page < MAX_PAGES; page++) {
      let query = supabase.from('programs').select(PROGRAM_COLUMNS).eq('status', 'published').order('id');
      if (filter.level) query = query.eq('level', filter.level);
      if (filter.countries?.length) query = query.in('institutions.country', filter.countries);
      if (filter.types?.length) query = query.in('institutions.type', filter.types);
      if (filter.fieldPrefixes?.length) query = query.or(filter.fieldPrefixes.map((p) => `isced_f.like.${p}%`).join(','));
      const res = await query.range(page * PAGE, page * PAGE + PAGE - 1);
      if (res.error) throw res.error;
      rows.push(...(res.data as unknown as Row[]));
      if (res.data.length < PAGE) break;
    }
  }  const countries = await supabase.from('country_data').select('country, currency, work_during_study, post_study_work_visa, recognition, cost_of_living').eq('status', 'published');
  if (countries.error) throw countries.error;
  return {
    programs: rows.flatMap((r) => toProgram(r) ?? []),
    countries: Object.fromEntries((countries.data as Row[]).flatMap((r) => toCountryFacts(r) ?? []).map((c) => [c.code, c])),
  };
}
