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

/** All published programmes and the facts about their countries. Throws if the database cannot be read. */
export async function loadMatchData(supabase: SupabaseClient): Promise<{ programs: MatchProgram[]; countries: Record<string, CountryFacts> }> {
  const [programs, countries] = await Promise.all([
    supabase.from('programs').select(PROGRAM_COLUMNS).eq('status', 'published').limit(2000),
    supabase.from('country_data').select('country, currency, work_during_study, post_study_work_visa, recognition, cost_of_living').eq('status', 'published'),
  ]);
  if (programs.error) throw programs.error;
  if (countries.error) throw countries.error;
  return {
    programs: (programs.data as unknown as Row[]).flatMap((r) => toProgram(r) ?? []),
    countries: Object.fromEntries((countries.data as Row[]).flatMap((r) => toCountryFacts(r) ?? []).map((c) => [c.code, c])),
  };
}
