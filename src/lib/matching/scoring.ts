import { academicScore, type AcademicFit } from './academic';
import { convert, pickTuition, yearlyAmount } from './currency';
import type { ComponentId, ComponentScore, MatchContext, MatchInput, MatchProgram, Note, Ranking } from './types';

/** Base weights; the three priorities of the survey boost theirs (SPEC.md section 11). */
export const BASE_WEIGHTS: Record<ComponentId, number> = {
  academic: 20,
  field: 25,
  prestige: 8,
  preferences: 10,
  extras: 5,
  life: 12,
  budget: 20,
};

/** Which components each survey priority strengthens. */
const PRIORITY_COMPONENTS: Record<string, ComponentId[]> = {
  price: ['budget'],
  prestige: ['prestige'],
  location: ['preferences'],
  chances: ['academic'],
  field: ['field'],
  career: ['life', 'extras'],
};
/** The boost of the first, second and third priority. */
export const PRIORITY_BOOST = [2, 1.75, 1.5];

export function weightsFor(priorities: string[]): Record<ComponentId, number> {
  const weights = { ...BASE_WEIGHTS };
  priorities.slice(0, 3).forEach((p, i) => {
    for (const c of PRIORITY_COMPONENTS[p] ?? []) weights[c] = BASE_WEIGHTS[c] * PRIORITY_BOOST[i];
  });
  return weights;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));
const round1 = (n: number) => Math.round(n * 10) / 10;
const average = (xs: number[]): number | null => (xs.length ? round1(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

// ------------------------------------------------------------------ field match
function commonPrefix(a: string, b: string): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

/** Same detailed specialty = 100, same narrow field = 70, same broad field = 40 (SPEC.md section 11). */
export function fieldMatch(wanted: string, programCode: string): { score: number; kind: 'exact' | 'narrow' | 'broad' | 'none' } {
  const k = commonPrefix(wanted, programCode);
  const shallow = Math.min(wanted.length, programCode.length);
  if (k >= 4) return { score: 100, kind: 'exact' };
  // The programme is described more broadly than the wish (or the other way round) and they agree as far as they go.
  if (k === shallow && shallow === 3) return { score: 85, kind: 'narrow' };
  if (k === shallow && shallow === 2) return { score: 55, kind: 'broad' };
  if (k === 3) return { score: 70, kind: 'narrow' };
  if (k === 2) return { score: 40, kind: 'broad' };
  return { score: 0, kind: 'none' };
}

const PRIORITY_RANK_FACTOR = [1, 0.9, 0.8];

function fieldScore(program: MatchProgram, input: MatchInput): { score: number | null; kind?: string } {
  if (input.fields.length === 0 || !program.iscedF) return { score: null };
  let best = { score: -1, kind: 'none' as string };
  input.fields.forEach((f, i) => {
    const m = fieldMatch(f, program.iscedF!);
    const scaled = m.score * (PRIORITY_RANK_FACTOR[i] ?? 0.8);
    if (scaled > best.score) best = { score: scaled, kind: m.kind };
  });
  return { score: round1(best.score), kind: best.kind };
}

// ------------------------------------------------------------------ prestige
function bestPosition(r: Ranking): number | null {
  const m = /\d+/.exec(r.position);
  return m ? Number(m[0]) : null;
}

function prestigeScore(program: MatchProgram, input: MatchInput): number | null {
  if (!input.rating || input.rating === 'any') return null;
  const scope = input.rating === 'top_world' ? 'world' : 'country';
  const positions = program.institution.rankings
    .filter((r) => r.scope === scope)
    .map(bestPosition)
    .filter((p): p is number => p !== null);
  if (positions.length === 0) return null;
  const p = Math.min(...positions);
  if (scope === 'world') return p <= 50 ? 100 : p <= 100 ? 90 : p <= 250 ? 75 : p <= 500 ? 60 : p <= 1000 ? 45 : 30;
  return p <= 1 ? 100 : p <= 3 ? 95 : p <= 5 ? 85 : p <= 10 ? 75 : p <= 20 ? 60 : 40;
}

// ------------------------------------------------------------------ preferences (ownership, size, city, climate)
function preferencesScore(program: MatchProgram, input: MatchInput): number | null {
  const inst = program.institution;
  const parts: number[] = [];
  const exact = (want: string | null, have: string | null) => {
    if (!want || want === 'any' || have === null) return;
    parts.push(want === have ? 100 : 0);
  };
  exact(input.ownership, inst.ownership);
  exact(input.size, inst.size);
  exact(input.citySize, inst.citySize);
  if (input.climate && input.climate !== 'any' && inst.climate) {
    // warm and cold are far apart, "temperate" is in between
    parts.push(input.climate === inst.climate ? 100 : input.climate === 'temperate' || inst.climate === 'temperate' ? 50 : 0);
  }
  return average(parts);
}

// ------------------------------------------------------------------ extras
function extrasScore(program: MatchProgram, input: MatchInput): number | null {
  if (input.extras.length === 0 || program.institution.features.length === 0) return null;
  const hit = input.extras.filter((e) => program.institution.features.includes(e)).length;
  return round1((hit / input.extras.length) * 100);
}

// ------------------------------------------------------------------ life: dormitory, work, recognition
function lifeScore(program: MatchProgram, input: MatchInput, ctx: MatchContext): number | null {
  const country = ctx.countries[program.institution.country];
  const parts: number[] = [];
  if (input.dorm === 'yes' && program.institution.dormitory !== null) parts.push(program.institution.dormitory ? 100 : 0);
  if (input.workDuring === 'yes' && country?.workDuringStudy != null) parts.push(country.workDuringStudy ? 100 : 0);
  if (input.workDuring === 'maybe' && country?.workDuringStudy != null) parts.push(country.workDuringStudy ? 100 : 60);
  if (input.after === 'stay' && country?.postStudyWorkVisa != null) parts.push(country.postStudyWorkVisa ? 100 : 0);
  if (input.recognition === 'yes' && country?.recognition != null) parts.push(country.recognition ? 100 : 0);
  return average(parts);
}

// ------------------------------------------------------------------ budget margin
/** 100 up to half the budget, 50 at the budget, 25 at the tolerance limit, then 0. */
export function marginScore(cost: number, budget: number): number {
  if (budget <= 0) return cost <= 0 ? 100 : 0;
  const r = cost / budget;
  if (r <= 0.5) return 100;
  if (r <= 1) return round1(100 - (r - 0.5) * 100);
  if (r <= 1.15) return round1(50 - ((r - 1) / 0.15) * 25);
  return 0;
}

function citySlug(program: MatchProgram) {
  return (program.institution.city.en ?? Object.values(program.institution.city)[0] ?? '').toLowerCase();
}

/** Yearly living cost in the person's currency for the institution's city (or the country's first city). */
export function livingYearly(program: MatchProgram, input: MatchInput, ctx: MatchContext): number | null {
  if (!input.budget) return null;
  const list = ctx.countries[program.institution.country]?.costOfLiving ?? [];
  const here = list.find((c) => (c.city.en ?? '').toLowerCase() === citySlug(program) && c.amountPerMonth !== null) ?? list.find((c) => c.amountPerMonth !== null);
  if (!here || here.amountPerMonth === null) return null;
  return convert(here.amountPerMonth * 12, here.currency, input.budget.currency, ctx.rates);
}

export function tuitionYearly(program: MatchProgram, input: MatchInput, ctx: MatchContext): { amount: number; currency: string } | null {
  const tuition = pickTuition(program, input.citizenships);
  if (!tuition) return null;
  const yearly = yearlyAmount(tuition, program.durationYears);
  if (yearly === null) return null;
  const currency = input.budget?.currency ?? tuition.currency;
  const converted = convert(yearly, tuition.currency, currency, ctx.rates);
  return converted === null ? { amount: yearly, currency: tuition.currency } : { amount: converted, currency };
}

function budgetScore(program: MatchProgram, input: MatchInput, ctx: MatchContext): number | null {
  if (!input.budget) return null;
  const parts: number[] = [];
  if (program.free) parts.push(100);
  else if (input.budget.tuition !== null) {
    const t = tuitionYearly(program, input, ctx);
    if (t && t.currency === input.budget.currency) parts.push(marginScore(t.amount, input.budget.tuition));
  }
  if (input.budget.living !== null) {
    const living = livingYearly(program, input, ctx);
    if (living !== null) parts.push(marginScore(living, input.budget.living));
  }
  return average(parts);
}

// ------------------------------------------------------------------ everything together
export interface Scored {
  components: ComponentScore[];
  score: number;
  missing: ComponentId[];
  fieldKind?: string;
}

/** Does the person's answer ask for this component at all? (A component nobody asked for is not "missing data".) */
function asked(id: ComponentId, input: MatchInput): boolean {
  const set = (v: string | null) => v !== null && v !== 'any';
  switch (id) {
    case 'academic':
      return true;
    case 'field':
      return input.fields.length > 0;
    case 'prestige':
      return set(input.rating);
    case 'preferences':
      return set(input.ownership) || set(input.size) || set(input.citySize) || set(input.climate);
    case 'extras':
      return input.extras.length > 0;
    case 'life':
      return input.dorm === 'yes' || input.workDuring === 'yes' || input.workDuring === 'maybe' || input.after === 'stay' || input.recognition === 'yes';
    case 'budget':
      return input.budget !== null && (input.budget.tuition !== null || input.budget.living !== null);
  }
}

/**
 * How strongly missing data pulls a score towards the neutral 50: a programme whose price, requirements or
 * ranking are unknown must not beat one that was checked on every point the person cares about.
 */
export const MISSING_DATA_PULL = 0.8;
const NEUTRAL = 50;

export function scoreProgram(program: MatchProgram, input: MatchInput, ctx: MatchContext, fit: AcademicFit): Scored {
  const weights = weightsFor(input.priorities);
  const field = fieldScore(program, input);
  const raw: Record<ComponentId, number | null> = {
    academic: academicScore(fit),
    field: field.score,
    prestige: prestigeScore(program, input),
    preferences: preferencesScore(program, input),
    extras: extrasScore(program, input),
    life: lifeScore(program, input, ctx),
    budget: budgetScore(program, input, ctx),
  };
  const components = (Object.keys(raw) as ComponentId[]).map((id) => ({ id, score: raw[id], weight: weights[id] }));
  const present = components.filter((c) => c.score !== null);
  // A component without data is left out and the weights of the others are re-normalised ...
  const total = present.reduce((s, c) => s + c.weight, 0);
  const base = total === 0 ? 0 : present.reduce((s, c) => s + (c.score as number) * c.weight, 0) / total;
  // ... but the more of what the person asked for is unknown, the less the score can be trusted.
  const wanted = components.filter((c) => asked(c.id, input));
  const wantedWeight = wanted.reduce((s, c) => s + c.weight, 0);
  const unknownWeight = wanted.filter((c) => c.score === null).reduce((s, c) => s + c.weight, 0);
  const pull = wantedWeight === 0 ? 0 : MISSING_DATA_PULL * (unknownWeight / wantedWeight);
  const score = total === 0 ? 0 : clamp(round1(base * (1 - pull) + NEUTRAL * pull));
  return {
    components,
    score,
    missing: wanted.filter((c) => c.score === null).map((c) => c.id),
    fieldKind: field.kind,
  };
}
/** The three components that contributed most (and are good): the "why this fits" of the result. */
export function whyNotes(scored: Scored): Note[] {
  return scored.components
    .filter((c) => c.score !== null && c.score >= 60)
    .sort((a, b) => (b.score as number) * b.weight - (a.score as number) * a.weight)
    .slice(0, 3)
    .map((c) => ({
      key: `why.${c.id}`,
      params: c.id === 'field' && scored.fieldKind ? { match: scored.fieldKind } : undefined,
    }));
}
