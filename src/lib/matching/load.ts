import type { SupabaseClient } from '@supabase/supabase-js';
import { isInstitutionType } from '../institutions/types';
import { safeHttpUrl } from '../safe-url';
import { readCopy, writeCopy } from './cache';
import programmeCountries from '../../../data/generated/programme-countries.json';
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
const MAX_PAGES = 20; // at most 20 000 programmes in one search: more would make the page slow
/**
 * When no country was chosen, each country is read only up to this many pages (5000 programmes). The big countries have tens of
 * thousands (the US about 70 000 at bachelor level): reading them whole would take half a minute and make the page heavy, and a person who
 * did not choose a country gets the best of what is read from every country. When countries were chosen, they are read up to MAX_PAGES.
 */
const SAMPLE_PAGES = 5;
/** how many countries are read at the same time */
const PARALLEL = 5;
/** a country with more programmes than this is asked for the chosen fields in the database; the others are read whole and cut here (faster, and without the time limit of the field search) */
const BIG_STREAM = 3000;

type Page = { institution: string; program: string };
interface StreamArgs {
  level: string | null;
  countries: string[] | null;
  types: string[] | null;
  prefixes: string[] | null;
}
interface StreamResult {
  rows: Row[];
  partial: boolean;
  missingFunction: boolean;
}

// The lighter database function (migration 0037) is used when it exists; the answer is turned back into the rows of the older one.
let slimAvailable: boolean | null = null;
export const resetSlimCheck = () => {
  slimAvailable = null;
};

function expandSlim(payload: unknown): Row[] {
  const body = rec(payload);
  const institutions = rec(body.institutions);
  return arr(body.programs).map((p) => ({ ...rec(p), institutions: rec(institutions[String(rec(p).institution_id)]) }));
}

async function readPage(supabase: SupabaseClient, args: Record<string, unknown>): Promise<{ data: Row[] | null; error: { code: string; message: string } | null }> {
  if (slimAvailable !== false) {
    const res = await supabase.rpc('match_programs_slim', args);
    if (!res.error) {
      slimAvailable = true;
      return { data: expandSlim(res.data), error: null };
    }
    if (/match_programs_slim|PGRST202/.test(`${res.error.code} ${res.error.message}`)) slimAvailable = false;
    else return { data: null, error: res.error };
  }
  const res = await supabase.rpc('match_programs', args);
  return { data: res.error ? null : ((Array.isArray(res.data) ? res.data : []) as Row[]), error: res.error };
}

/** One stream: the pages of one search, read one after another (keyset paging). */
async function readStream(supabase: SupabaseClient, base: StreamArgs, deadline: number, maxPages = MAX_PAGES): Promise<StreamResult> {
  const rows: Row[] = [];
  let after: Page | null = null;
  for (let page = 0; page < maxPages; page++) {
    const args = {
      p_level: base.level,
      p_countries: base.countries,
      p_types: base.types,
      p_prefixes: base.prefixes,
      p_after_institution: after?.institution ?? null,
      p_after_program: after?.program ?? null,
      p_limit: PAGE,
    };
    // the database is slow right now (for example while it cleans up after a big load): stop and use what we have
    if (page > 0 && Date.now() > deadline) return { rows, partial: true, missingFunction: false };
    let res = await readPage(supabase, args);
    // the first read after a quiet period can hit the database time limit (cold cache); the second one is fast
    for (let retry = 0; retry < 3 && res.error?.code === '57014' && Date.now() < deadline; retry++) res = await readPage(supabase, args);
    if (res.error) {
      if (page === 0 && /match_programs|PGRST202/.test(`${res.error.code} ${res.error.message}`)) return { rows, partial: false, missingFunction: true };
      if (page > 0) return { rows, partial: true, missingFunction: false }; // a later page failed: the earlier ones are still good
      throw res.error;
    }
    const list = res.data ?? [];
    rows.push(...list);
    const last = list[list.length - 1];
    if (list.length < PAGE || !last) return { rows, partial: false, missingFunction: false };
    after = { institution: String(rec(last.institutions).id), program: String(last.id) };
  }
  return { rows, partial: false, missingFunction: false };
}

/** How many published programmes each country has at this level (migration 0036), or null when the function is not installed. */
async function countryCounts(supabase: SupabaseClient, level: string | null): Promise<Map<string, number> | null> {
  const res = await supabase.rpc('programme_country_counts', { p_level: level });
  if (res.error || !Array.isArray(res.data)) return null;
  const out = new Map<string, number>();
  for (const r of res.data as Row[]) if (str(r.country) && num(r.n) !== null) out.set(r.country as string, num(r.n) as number);
  return out;
}

/** Runs the jobs `limit` at a time, in the given order. */
async function pool<T>(jobs: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = new Array(jobs.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, jobs.length) }, async () => {
      while (next < jobs.length) {
        const i = next++;
        results[i] = await jobs[i]();
      }
    }),
  );
  return results;
}

const startsWithAny = (row: Row, prefixes: string[]) => typeof row.isced_f === 'string' && prefixes.some((p) => (row.isced_f as string).startsWith(p));

type Loaded = { programs: MatchProgram[]; countries: Record<string, CountryFacts>; partial: boolean };
// Programmes and country facts are the same for everybody: what was read a few minutes ago is reused (a second look at the matches,
// or the survey and the matches in a row, does not read the database again). Only complete reads are kept.
const CACHE_MS = 10 * 60_000;
/** how long a copy kept in the browser is used (the data changes rarely: a few times a day at most) */
const STORED_MS = 30 * 60_000;
const cache = new Map<string, { at: number; data: Loaded }>();
export const clearMatchCache = () => cache.clear();

/** The published programmes (that fit `filter`) and the facts about their countries. Throws if the database cannot be read. */
export async function loadMatchData(
  supabase: SupabaseClient,
  filter: ProgramFilter = {},
  /** the moment (Date.now()) after which no further page is requested: what was read so far is used (`partial`) */
  deadline = Date.now() + 40_000,
): Promise<Loaded> {
  const key = JSON.stringify([filter.level ?? '', [...(filter.countries ?? [])].sort(), [...(filter.types ?? [])].sort(), [...(filter.fieldPrefixes ?? [])].sort()]);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.data;

  const level = filter.level || null;
  const types = filter.types?.length ? filter.types : null;
  const prefixes = filter.fieldPrefixes?.length ? filter.fieldPrefixes : null;
  const rows: Row[] = [];
  let partial = false;

  // A copy kept in the browser from a little while ago (IndexedDB): no reading at all.
  const stored = await readCopy(key, STORED_MS);
  if (stored) {
    rows.push(...(stored as Row[]));
  } else {
    // The fast way (migrations 0014, 0036, 0037): the countries are read at the same time, each by keyset pages, and the chosen fields
    // are cut here for the small countries. Before migration 0036 the sizes are unknown: the chosen countries, or the countries of
    // our data files, are read as big ones.
    const counts =
      (await countryCounts(supabase, level)) ??
      new Map((filter.countries?.length ? filter.countries : (programmeCountries as { countries: string[] }).countries).map((c) => [c, BIG_STREAM + 1] as const));
    const wanted = filter.countries?.length ? filter.countries : [...counts.keys()];
    const streams = wanted.filter((c) => (counts.get(c) ?? 0) > 0).sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0));
    const results = await pool(
      streams.map((country) => async () => {
        const big = (counts.get(country) ?? 0) > BIG_STREAM && prefixes !== null;
        const base: StreamArgs = { level, countries: [country], types, prefixes: big ? prefixes : null };
        const maxPages = filter.countries?.length ? MAX_PAGES : SAMPLE_PAGES;
        let r: StreamResult & { cutHere?: boolean };
        try {
          r = await readStream(supabase, base, deadline, maxPages);
        } catch (error) {
          if (!big) throw error;
          r = { ...(await readStream(supabase, { ...base, prefixes: null }, deadline, maxPages)), cutHere: true }; // the field search timed out: read the country whole
        }
        // the database already cut the fields of a big country; the others were read whole and are cut here
        const cutHere = prefixes !== null && (!big || r.cutHere);
        const kept = cutHere ? r.rows.filter((row) => startsWithAny(row, prefixes)) : r.rows;
        return { rows: kept, partial: r.partial, missing: r.missingFunction };
      }),
      PARALLEL,
    );
    for (const r of results) {
      rows.push(...r.rows);
      if (r.partial) partial = true;
    }
    if (results.some((r) => r.missing)) {
      // the database function is not installed at all (before migration 0014): the plain, slow query
      rows.length = 0;
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
    }
  }
  const countryRows = await supabase.from('country_data').select('country, currency, work_during_study, post_study_work_visa, recognition, cost_of_living').eq('status', 'published');
  if (countryRows.error) throw countryRows.error;
  const data: Loaded = {
    partial,
    programs: rows.flatMap((r) => toProgram(r) ?? []),
    countries: Object.fromEntries((countryRows.data as Row[]).flatMap((r) => toCountryFacts(r) ?? []).map((c) => [c.code, c])),
  };
  if (!partial) {
    cache.set(key, { at: Date.now(), data });
    if (!stored) void writeCopy(key, rows);
  }
  return data;
}
