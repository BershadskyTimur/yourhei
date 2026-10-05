import { CERTIFICATES, cefrOfCertificate, cefrRank, canStudyIn } from '../survey/references';
import { convert, pickTuition, yearlyAmount } from './currency';
import type { MatchContext, MatchInput, MatchProgram } from './types';

/** The budget may be exceeded by this much and the programme is still shown (SPEC.md section 11). */
export const BUDGET_TOLERANCE = 1.15;

/** Languages the person can study in: the ones they named, plus any with self-assessment B2+ or a B2+ certificate. */
export function usableLanguages(input: MatchInput): Set<string> {
  const set = new Set(input.studyLanguages);
  for (const l of input.languages) {
    if (canStudyIn(l.level)) set.add(l.lang);
    if (l.cert && CERTIFICATES.some((c) => c.id === l.cert!.id)) {
      const level = cefrOfCertificate(l.cert.id, l.cert.value);
      if (level && cefrRank(level) >= cefrRank('B2')) set.add(l.lang);
    }
  }
  return set;
}

export type FilterFailure =
  | 'level'
  | 'country'
  | 'type'
  | 'language'
  | 'format'
  | 'free'
  | 'budget'
  | 'intake';

/** The hard filters of SPEC.md section 11. Returns the first one the programme fails, or null if it passes. */
export function failedFilter(program: MatchProgram, input: MatchInput, ctx: MatchContext): FilterFailure | null {
  if (program.level !== input.level) return 'level';
  if (input.countries.length > 0 && !input.countries.includes(program.institution.country)) return 'country';
  if (input.types.length > 0 && !input.types.includes(program.institution.type)) return 'type';

  // Language of instruction: a language the person can study in, or readiness for a preparatory year.
  if (program.languages.length > 0 && !input.prepYear) {
    const usable = usableLanguages(input);
    if (!program.languages.some((l) => usable.has(l))) return 'language';
  }

  if (input.format && input.format !== 'any' && program.format && program.format !== 'blended' && program.format !== input.format) {
    return 'format';
  }

  const tuition = pickTuition(program, input.citizenships);
  if (input.funding === 'free') {
    // "Free" must be confirmed by the data: an unknown price does not count as free.
    const confirmedFree = program.free || (tuition !== null && tuition.amount === 0);
    if (!confirmedFree) return 'free';
  } else if (input.budget?.tuition != null && tuition) {
    const yearly = yearlyAmount(tuition, program.durationYears);
    const converted = yearly === null ? null : convert(yearly, tuition.currency, input.budget.currency, ctx.rates);
    if (converted !== null && converted > input.budget.tuition * BUDGET_TOLERANCE) return 'budget';
  }

  if (input.start && program.intakes.length > 0 && !program.intakes.includes(input.start.slice(5, 7))) return 'intake';
  return null;
}
