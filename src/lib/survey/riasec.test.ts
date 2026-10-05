import { describe, expect, it } from 'vitest';
import { iscedEntry } from './references';
import {
  RIASEC_FIELDS,
  RIASEC_STATEMENTS,
  isRiasecComplete,
  riasecScores,
  riasecSuggestions,
  topTypes,
} from './riasec';

const answers = (high: string) => RIASEC_STATEMENTS.map((t) => (high.includes(t) ? 5 : 1));

describe('riasec', () => {
  it('has 12 statements, two per type', () => {
    expect(RIASEC_STATEMENTS).toHaveLength(12);
    for (const t of ['R', 'I', 'A', 'S', 'E', 'C']) {
      expect(RIASEC_STATEMENTS.filter((x) => x === t)).toHaveLength(2);
    }
  });

  it('sums two answers per type', () => {
    const s = riasecScores(answers('A'));
    expect(s.A).toBe(10);
    expect(s.R).toBe(2);
  });

  it('ignores missing and out-of-range answers', () => {
    const s = riasecScores([5, 9, null, undefined, 0]);
    expect(s.R).toBe(5);
    expect(s.I).toBe(0);
  });

  it('ranks the strongest types and breaks ties in the fixed order', () => {
    expect(topTypes(riasecScores(answers('IS')))).toEqual(['I', 'S', 'R']);
    expect(topTypes(riasecScores(RIASEC_STATEMENTS.map(() => 3)))).toEqual(['R', 'I', 'A']);
  });

  it('suggests 3 specialties: two of the top type and one of the second', () => {
    const suggestions = riasecSuggestions(riasecScores(answers('IS')));
    expect(suggestions).toEqual([...RIASEC_FIELDS.I.slice(0, 2), RIASEC_FIELDS.S[0]]);
  });

  it('every suggested code exists in the ISCED-F reference', () => {
    for (const codes of Object.values(RIASEC_FIELDS)) {
      for (const code of codes) expect(iscedEntry(code), code).toBeDefined();
    }
  });

  it('knows when all 12 are answered', () => {
    expect(isRiasecComplete(answers('R'))).toBe(true);
    expect(isRiasecComplete(answers('R').slice(0, 11))).toBe(false);
  });
});
