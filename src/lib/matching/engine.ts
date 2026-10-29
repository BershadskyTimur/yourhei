// The matching engine (SPEC.md section 11): hard filters, scores 0-100, three groups, reasons and gaps.
// Pure functions only: the same input always gives the same result, and it is covered by tests.
import { academicFit } from './academic';
import { BUDGET_TOLERANCE, failedFilter, usableLanguages, type FilterFailure } from './filters';
import { scoreProgram, tuitionYearly, whyNotes } from './scoring';
import type { Group, MatchContext, MatchInput, MatchProgram, MatchResult, Matches, Note } from './types';

/** A result is "safe" when every comparable requirement is met with at least this many points to spare. */
export const SAFE_MARGIN = 10;

/** How many results each group shows, depending on the strategy answer (SPEC.md section 11). */
export const GROUP_LIMITS: Record<MatchInput['strategy'], Record<Group, number>> = {
  safe: { safe: 12, suitable: 8, ambitious: 3 },
  balanced: { safe: 8, suitable: 10, ambitious: 6 },
  ambitious: { safe: 4, suitable: 8, ambitious: 10 },
};

/** At most this many programmes of one institution are shown in one group, so the list is varied. */
export const MAX_PER_INSTITUTION = 2;
/**
 * At most this many programmes of one country are shown in one group, unless the person chose exactly one country.
 * Without it one country with many cheap programmes of the same score (Czechia, October 2026) filled every list.
 * When the other countries have too few results, the best of the held-back ones fill the rest of the group.
 */
export const MAX_PER_COUNTRY = 3;

/** How many of the components have data: on an equal score, the better-checked programme comes first. */
const evidence = (r: MatchResult) => r.components.filter((c) => c.score !== null).length;
const byRank = (a: MatchResult, b: MatchResult) => b.score - a.score || evidence(b) - evidence(a) || a.program.id.localeCompare(b.program.id);

/** The best results of one group, at most `limit`, with at most two per institution and (when `capCountries`) three per country. */
export function pickGroup(results: readonly MatchResult[], limit: number, capCountries: boolean): MatchResult[] {
  const perInstitution = new Map<string, number>();
  const perCountry = new Map<string, number>();
  const chosen: MatchResult[] = [];
  const heldBack: MatchResult[] = [];
  const take = (r: MatchResult) => {
    chosen.push(r);
    perInstitution.set(r.program.institution.id, (perInstitution.get(r.program.institution.id) ?? 0) + 1);
    perCountry.set(r.program.institution.country, (perCountry.get(r.program.institution.country) ?? 0) + 1);
  };
  for (const r of [...results].sort(byRank)) {
    if (chosen.length >= limit) break;
    if ((perInstitution.get(r.program.institution.id) ?? 0) >= MAX_PER_INSTITUTION) continue;
    if (capCountries && (perCountry.get(r.program.institution.country) ?? 0) >= MAX_PER_COUNTRY) {
      heldBack.push(r);
      continue;
    }
    take(r);
  }
  for (const r of heldBack) {
    if (chosen.length >= limit) break;
    if ((perInstitution.get(r.program.institution.id) ?? 0) >= MAX_PER_INSTITUTION) continue;
    take(r);
  }
  return chosen.sort(byRank);
}

export function groupFor(minMargin: number | null, met: boolean): Group {
  if (!met) return 'ambitious';
  return minMargin !== null && minMargin >= SAFE_MARGIN ? 'safe' : 'suitable';
}

function extraGaps(program: MatchProgram, input: MatchInput, ctx: MatchContext): Note[] {
  const gaps: Note[] = [];
  const usable = usableLanguages(input);
  if (program.languages.length > 0 && !program.languages.some((l) => usable.has(l))) {
    gaps.push({ key: 'gap.prep_year', params: { languages: program.languages.join(', ') } });
  }
  const t = tuitionYearly(program, input, ctx);
  if (t && input.budget?.tuition != null && t.currency === input.budget.currency && t.amount > input.budget.tuition && t.amount <= input.budget.tuition * BUDGET_TOLERANCE) {
    gaps.push({ key: 'gap.over_budget', params: { cost: Math.round(t.amount), budget: Math.round(input.budget.tuition), currency: t.currency } });
  }
  return gaps;
}

/** Runs the whole matching for one person over the given (published, verified) programmes. */
export function matchPrograms(programs: readonly MatchProgram[], input: MatchInput, ctx: MatchContext): Matches {
  const results: MatchResult[] = [];
  const rejected: Partial<Record<FilterFailure | 'academic', number>> = {};
  let passed = 0;

  for (const program of programs) {
    const failed = failedFilter(program, input, ctx);
    if (failed !== null) {
      rejected[failed] = (rejected[failed] ?? 0) + 1;
      continue;
    }
    const fit = academicFit(program, input);
    if (fit.hardFail) {
      rejected.academic = (rejected.academic ?? 0) + 1; // far below the requirements: not realistic, not even "ambitious"
      continue;
    }
    passed++;

    const scored = scoreProgram(program, input, ctx, fit);
    const tuition = tuitionYearly(program, input, ctx);
    results.push({
      program,
      score: scored.score,
      group: groupFor(fit.minMargin, fit.met),
      components: scored.components,
      missing: scored.missing,
      why: whyNotes(scored),
      gaps: [...fit.gaps, ...extraGaps(program, input, ctx)],
      tuitionShown: program.free ? { amount: 0, currency: tuition?.currency ?? input.budget?.currency ?? 'USD', period: 'year' } : tuition ? { ...tuition, period: 'year' } : null,
    });
  }

  const limits = GROUP_LIMITS[input.strategy];
  const capCountries = input.countries.length !== 1;
  const pick = (group: Group) => pickGroup(results.filter((r) => r.group === group), limits[group], capCountries);

  return { safe: pick('safe'), suitable: pick('suitable'), ambitious: pick('ambitious'), checked: programs.length, passed, rejected };
}
