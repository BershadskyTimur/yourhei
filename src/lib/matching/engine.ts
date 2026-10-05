// The matching engine (SPEC.md section 11): hard filters, scores 0-100, three groups, reasons and gaps.
// Pure functions only: the same input always gives the same result, and it is covered by tests.
import { academicFit } from './academic';
import { BUDGET_TOLERANCE, failedFilter, usableLanguages } from './filters';
import { scoreProgram, tuitionYearly, whyNotes } from './scoring';
import type { Group, MatchContext, MatchInput, MatchProgram, MatchResult, Matches, Note } from './types';

/** A result is "safe" when every comparable requirement is met with at least this many points to spare. */
export const SAFE_MARGIN = 10;

/** How many results each group shows, depending on the strategy answer (SPEC.md section 11). */
export const GROUP_LIMITS: Record<MatchInput['strategy'], Record<Group, number>> = {
  safe: { safe: 10, suitable: 6, ambitious: 2 },
  balanced: { safe: 6, suitable: 6, ambitious: 4 },
  ambitious: { safe: 3, suitable: 6, ambitious: 8 },
};

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
  let passed = 0;

  for (const program of programs) {
    if (failedFilter(program, input, ctx) !== null) continue;
    const fit = academicFit(program, input);
    if (fit.hardFail) continue; // far below the requirements: not realistic, not even "ambitious"
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
  const pick = (group: Group) =>
    results
      .filter((r) => r.group === group)
      .sort((a, b) => b.score - a.score || a.program.id.localeCompare(b.program.id))
      .slice(0, limits[group]);

  return { safe: pick('safe'), suitable: pick('suitable'), ambitious: pick('ambitious'), checked: programs.length, passed };
}
