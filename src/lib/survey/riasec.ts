// A short interests test based on Holland's RIASEC model. The 12 statements are our own wording
// (see Survey.riasec.* in the translation files); two statements per type, each answered 1-5.

export const RIASEC_TYPES = ['R', 'I', 'A', 'S', 'E', 'C'] as const;
export type RiasecType = (typeof RIASEC_TYPES)[number];

/** Statement i belongs to type TYPE_OF_STATEMENT[i]. Keys: Survey.riasec.items.<i>. */
export const RIASEC_STATEMENTS: readonly RiasecType[] = ['R', 'I', 'A', 'S', 'E', 'C', 'R', 'I', 'A', 'S', 'E', 'C'];

/** For each type the specialties (ISCED-F detailed codes) that fit it best, most typical first. */
export const RIASEC_FIELDS: Record<RiasecType, string[]> = {
  R: ['0715', '0732', '0811', '0713'],
  I: ['0533', '0613', '0511', '0541', '0912'],
  A: ['0211', '0212', '0213', '0731'],
  S: ['0313', '0111', '0923', '0913'],
  E: ['0413', '0414', '0421', '0312'],
  C: ['0411', '0412', '0612', '0322'],
};

export type RiasecScores = Record<RiasecType, number>;

/** Scores per type from 12 answers (1-5 each); missing answers count as 0. */
export function riasecScores(answers: readonly (number | null | undefined)[]): RiasecScores {
  const scores: RiasecScores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  RIASEC_STATEMENTS.forEach((type, i) => {
    const v = answers[i];
    if (typeof v === 'number' && v >= 1 && v <= 5) scores[type] += v;
  });
  return scores;
}

/** The three strongest types; a tie keeps the order R, I, A, S, E, C. */
export function topTypes(scores: RiasecScores): RiasecType[] {
  return [...RIASEC_TYPES]
    .sort((a, b) => scores[b] - scores[a] || RIASEC_TYPES.indexOf(a) - RIASEC_TYPES.indexOf(b))
    .slice(0, 3);
}

/** 2-3 suggested specialties: two of the strongest type, one of the second (no duplicates). */
export function riasecSuggestions(scores: RiasecScores): string[] {
  const [first, second] = topTypes(scores);
  const picks = [...RIASEC_FIELDS[first].slice(0, 2), RIASEC_FIELDS[second][0]];
  return [...new Set(picks)];
}

export function isRiasecComplete(answers: readonly (number | null | undefined)[]): boolean {
  return RIASEC_STATEMENTS.every((_, i) => typeof answers[i] === 'number');
}
