import { describe, expect, it } from 'vitest';
import { hasPrices, institutionFacts, levelRows, type ProgramFacts } from './institution-faq';

const ORDER = ['school', 'college', 'foundation', 'bachelor', 'master', 'phd', 'language_course'];

const program = (over: Partial<ProgramFacts>): ProgramFacts => ({
  level: 'bachelor',
  tuition: [],
  durationYears: 3,
  free: false,
  languages: [],
  minScores: [],
  deadlines: [],
  ...over,
});
const year = (amount: number, currency = 'EUR', appliesTo: 'all' | 'eu' | 'international' = 'international') => ({ amount, currency, period: 'year' as const, appliesTo });

describe('institutionFacts', () => {
  it('knows nothing about an institution without programmes', () => {
    expect(institutionFacts([], ORDER, '2026-11-07')).toEqual({ programCount: 0, levels: [], tuition: null, freeCount: 0, deadlines: [], languages: [], scores: [] });
  });

  it('levels come in the given order, not the order of the programmes', () => {
    const f = institutionFacts([program({ level: 'master' }), program({ level: 'bachelor' }), program({ level: 'master' })], ORDER, '2026-11-07');
    expect(f.levels).toEqual(['bachelor', 'master']);
    expect(f.programCount).toBe(3);
  });

  it('tuition is the range for students from abroad; free programmes are counted apart', () => {
    const f = institutionFacts([program({ tuition: [year(8000)] }), program({ tuition: [year(12000)] }), program({ free: true })], ORDER, '2026-11-07');
    expect(f.tuition).toEqual({ min: 8000, max: 12000, currency: 'EUR' });
    expect(f.freeCount).toBe(1);
  });

  it('only upcoming deadlines, each date once, earliest first, at most three', () => {
    const d = (date: string) => ({ intake: '9', appliesTo: 'all', date });
    const f = institutionFacts(
      [program({ deadlines: [d('2026-01-15'), d('2027-03-01'), d('2026-12-01')] }), program({ deadlines: [d('2027-03-01'), d('2027-05-01'), d('2027-06-01')] })],
      ORDER,
      '2026-11-07',
    );
    expect(f.deadlines).toEqual(['2026-12-01', '2027-03-01', '2027-05-01']);
  });

  it('a deadline on the day itself still counts; no upcoming date means no deadlines', () => {
    const d = (date: string) => ({ intake: '9', appliesTo: 'all', date });
    expect(institutionFacts([program({ deadlines: [d('2026-11-07')] })], ORDER, '2026-11-07').deadlines).toEqual(['2026-11-07']);
    expect(institutionFacts([program({ deadlines: [d('2026-01-15')] })], ORDER, '2026-11-07').deadlines).toEqual([]);
  });

  it('languages: the most used first, each once', () => {
    const f = institutionFacts([program({ languages: ['de'] }), program({ languages: ['en', 'de'] }), program({ languages: ['en'] }), program({ languages: ['en'] })], ORDER, '2026-11-07');
    expect(f.languages).toEqual(['en', 'de']);
  });

  it('minimum scores: the lowest and the highest per exam', () => {
    const f = institutionFacts(
      [program({ minScores: [{ exam: 'ielts', min: 6 }] }), program({ minScores: [{ exam: 'ielts', min: 7 }, { exam: 'toefl', min: 90 }] }), program({ minScores: [{ exam: 'ielts', min: 6.5 }] })],
      ORDER,
      '2026-11-07',
    );
    expect(f.scores).toEqual([
      { exam: 'ielts', min: 6, max: 7 },
      { exam: 'toefl', min: 90, max: 90 },
    ]);
  });
});

describe('levelRows', () => {
  const programs = [
    program({ level: 'master', tuition: [year(15000)] }),
    program({ level: 'bachelor', tuition: [year(8000)] }),
    program({ level: 'bachelor', tuition: [year(10000)] }),
    program({ level: 'phd', free: true }),
    program({ level: 'foundation' }),
  ];

  it('one row per level in the given order, with the count and the price range', () => {
    const rows = levelRows(programs, ORDER);
    expect(rows.map((r) => [r.level, r.programs])).toEqual([
      ['foundation', 1],
      ['bachelor', 2],
      ['master', 1],
      ['phd', 1],
    ]);
    expect(rows.find((r) => r.level === 'bachelor')?.tuition).toEqual({ min: 8000, max: 10000, currency: 'EUR' });
    expect(rows.find((r) => r.level === 'foundation')?.tuition).toBeNull();
    expect(rows.find((r) => r.level === 'phd')?.free).toBe(true);
  });

  it('the table is shown only when some level has a price or is free', () => {
    expect(hasPrices(levelRows(programs, ORDER))).toBe(true);
    expect(hasPrices(levelRows([program({}), program({ level: 'master' })], ORDER))).toBe(false);
    expect(hasPrices([])).toBe(false);
  });
});
