import { describe, expect, it } from 'vitest';
import { academicFit, academicScore } from './academic';
import { convert, pickTuition, yearlyAmount } from './currency';
import { GROUP_LIMITS, groupFor, matchPrograms } from './engine';
import { failedFilter, usableLanguages } from './filters';
import { buildMatchInput } from './input';
import { BASE_WEIGHTS, fieldMatch, marginScore, scoreProgram, weightsFor } from './scoring';
import type { MatchContext, MatchInput, MatchInstitution, MatchProgram } from './types';

const rates = { USD: 1, EUR: 0.92, GEL: 2.7, KZT: 480 };
const ctx: MatchContext = {
  rates,
  countries: {
    GE: { code: 'GE', currency: 'GEL', workDuringStudy: true, postStudyWorkVisa: false, recognition: true, costOfLiving: [{ city: { en: 'Tbilisi' }, amountPerMonth: 800, currency: 'GEL' }] },
    KZ: { code: 'KZ', currency: 'KZT', workDuringStudy: false, postStudyWorkVisa: null, recognition: null, costOfLiving: [] },
  },
};

const institution = (over: Partial<MatchInstitution> = {}): MatchInstitution => ({
  id: 'i1', slug: 'uni', type: 'university', country: 'GE', city: { en: 'Tbilisi' }, names: { en: 'Uni' },
  ownership: 'public', size: 'large', citySize: 'megapolis', climate: 'temperate', dormitory: true,
  features: ['internship', 'exchange'], rankings: [{ name: 'QS', year: 2026, position: '801-1000', scope: 'world' }],
  verifiedAt: '2026-01-01', ...over,
});

const program = (over: Partial<MatchProgram> = {}): MatchProgram => ({
  id: 'p1', institution: institution(), names: { en: 'Software engineering' }, level: 'bachelor', iscedF: '0613',
  languages: ['en'], durationYears: 4, format: 'on_campus', intakes: ['09'],
  tuition: [{ amount: 8000, currency: 'GEL', period: 'year', appliesTo: 'international' }], free: false,
  requirements: { minGpa: null, minScores: [], documents: [] }, applicationFee: null, applicationUrl: null, ...over,
});

const input = (over: Partial<MatchInput> = {}): MatchInput => ({
  level: 'bachelor', start: '2027-09', format: 'on_campus', funding: 'both',
  budget: { currency: 'USD', tuition: 4000, living: 6000 }, countries: [], types: [], citizenships: ['KZ'], residence: 'KZ',
  languages: [{ lang: 'en', level: 'b2', cert: null }], studyLanguages: ['en'], prepYear: false, fields: ['0613'],
  grade: { normalized: 80, system: 'hundred', value: 80 }, exams: [], rating: null, ownership: null, size: null, citySize: null,
  climate: null, dorm: null, workDuring: null, after: null, recognition: null, extras: [], strategy: 'balanced',
  priorities: ['field', 'price', 'chances'], ...over,
});

describe('currency', () => {
  it('converts through dollars', () => {
    expect(convert(2.7, 'GEL', 'USD', rates)).toBeCloseTo(1);
    expect(convert(480, 'KZT', 'GEL', rates)).toBeCloseTo(2.7);
    expect(convert(10, 'EUR', 'EUR', {})).toBe(10);
    expect(convert(10, 'XXX', 'USD', rates)).toBeNull();
  });
  it('picks the tuition line that applies to the person', () => {
    const tuition = [
      { amount: 1000, currency: 'GEL', period: 'year' as const, appliesTo: 'domestic' as const },
      { amount: 5000, currency: 'EUR', period: 'year' as const, appliesTo: 'eu' as const },
      { amount: 9000, currency: 'GEL', period: 'year' as const, appliesTo: 'international' as const },
    ];
    const p = program({ tuition });
    expect(pickTuition(p, ['GE'])!.amount).toBe(1000);
    expect(pickTuition(p, ['DE'])!.amount).toBe(5000);
    expect(pickTuition(p, ['KZ'])!.amount).toBe(9000);
    expect(pickTuition(program({ tuition: [{ amount: null, currency: 'GEL', period: 'year', appliesTo: 'all' }] }), [])).toBeNull();
  });
  it('turns periods into yearly amounts', () => {
    expect(yearlyAmount({ amount: 100, currency: 'X', period: 'semester', appliesTo: 'all' }, 4)).toBe(200);
    expect(yearlyAmount({ amount: 8000, currency: 'X', period: 'total', appliesTo: 'all' }, 4)).toBe(2000);
    expect(yearlyAmount({ amount: 8000, currency: 'X', period: 'total', appliesTo: 'all' }, null)).toBeNull();
    expect(yearlyAmount({ amount: 50, currency: 'X', period: 'credit', appliesTo: 'all' }, 4)).toBeNull();
  });
});

describe('hard filters', () => {
  const fail = (p: MatchProgram, i: MatchInput) => failedFilter(p, i, ctx);

  it('passes a fitting programme', () => expect(fail(program(), input())).toBeNull());
  it('level must match', () => expect(fail(program({ level: 'master' }), input())).toBe('level'));
  it('country must be one of the chosen ones; none chosen = any', () => {
    expect(fail(program(), input({ countries: ['KZ'] }))).toBe('country');
    expect(fail(program(), input({ countries: ['GE', 'KZ'] }))).toBeNull();
  });
  it('type must be one of the chosen ones', () => {
    expect(fail(program(), input({ types: ['college'] }))).toBe('type');
  });
  it('the language of instruction must be one the person can study in', () => {
    expect(fail(program({ languages: ['ka'] }), input())).toBe('language');
    expect(fail(program({ languages: ['ka'] }), input({ prepYear: true }))).toBeNull(); // preparatory year
    expect(fail(program({ languages: [] }), input())).toBeNull(); // no data
  });
  it('self-assessment B2 or a B2 certificate makes a language usable', () => {
    const i = input({ studyLanguages: [], languages: [{ lang: 'de', level: 'a2', cert: { id: 'goethe', value: 'C1' } }, { lang: 'fr', level: 'c1', cert: null }, { lang: 'es', level: 'b1', cert: null }] });
    expect([...usableLanguages(i)].sort()).toEqual(['de', 'fr']);
  });
  it('format must match unless the person accepts any or the programme is blended', () => {
    expect(fail(program({ format: 'online' }), input())).toBe('format');
    expect(fail(program({ format: 'online' }), input({ format: 'any' }))).toBeNull();
    expect(fail(program({ format: 'blended' }), input())).toBeNull();
    expect(fail(program({ format: null }), input())).toBeNull();
  });
  it('"free only" needs confirmed free tuition; unknown does not count', () => {
    expect(fail(program(), input({ funding: 'free' }))).toBe('free');
    expect(fail(program({ free: true }), input({ funding: 'free' }))).toBeNull();
    expect(fail(program({ tuition: [] }), input({ funding: 'free' }))).toBe('free');
    expect(fail(program({ tuition: [{ amount: 0, currency: 'GEL', period: 'year', appliesTo: 'all' }] }), input({ funding: 'free' }))).toBeNull();
  });
  it('tuition may exceed the budget by 15 % and no more (with currency conversion)', () => {
    // 8000 GEL = 2963 USD
    expect(fail(program(), input({ budget: { currency: 'USD', tuition: 2600, living: null } }))).toBeNull(); // 2963 <= 2990
    expect(fail(program(), input({ budget: { currency: 'USD', tuition: 2500, living: null } }))).toBe('budget'); // 2963 > 2875
  });
  it('an unknown tuition or rate is not a reason to drop the programme', () => {
    expect(fail(program({ tuition: [] }), input())).toBeNull();
    expect(fail(program({ tuition: [{ amount: 9e9, currency: 'XXX', period: 'year', appliesTo: 'all' }] }), input())).toBeNull();
  });
  it('the start month must be an intake of the programme', () => {
    expect(fail(program({ intakes: ['02'] }), input())).toBe('intake');
    expect(fail(program({ intakes: [] }), input())).toBeNull();
  });
});

describe('field match', () => {
  it.each([
    ['0613', '0613', 100, 'exact'],
    ['0613', '0612', 70, 'narrow'],
    ['0613', '0711', 0, 'none'],
    ['0613', '0511', 0, 'none'],
    ['0613', '0521', 0, 'none'],
    ['0613', '061', 85, 'narrow'],
    ['0613', '06', 55, 'broad'],
    ['0511', '0533', 40, 'broad'],
  ] as const)('%s vs %s -> %s', (wanted, code, score, kind) => {
    expect(fieldMatch(wanted, code)).toEqual({ score, kind });
  });
});

describe('academic fit', () => {
  it('a grade above the requirement is met with a margin', () => {
    const p = program({ requirements: { minGpa: { system: 'hundred', value: 60 }, minScores: [], documents: [] } });
    const fit = academicFit(p, input());
    expect(fit.minMargin).toBe(20);
    expect(fit.met).toBe(true);
    expect(academicScore(fit)).toBe(100);
  });
  it('a grade slightly below is "ambitious", far below is dropped', () => {
    const slightly = academicFit(program({ requirements: { minGpa: { system: 'hundred', value: 90 }, minScores: [], documents: [] } }), input());
    expect(slightly.met).toBe(false);
    expect(slightly.hardFail).toBe(false);
    expect(slightly.gaps[0].key).toBe('gap.gpa');
    const far = academicFit(program({ requirements: { minGpa: { system: 'hundred', value: 99 }, minScores: [], documents: [] } }), input());
    expect(far.hardFail).toBe(true);
  });
  it('requirements in another grading system are compared after conversion', () => {
    const p = program({ requirements: { minGpa: { system: 'gpa4', value: 3 }, minScores: [], documents: [] } }); // 75
    expect(academicFit(p, input()).minMargin).toBe(5);
  });
  it('a language certificate below the requirement is a gap with both numbers', () => {
    const p = program({ requirements: { minGpa: null, minScores: [{ exam: 'ielts', min: 6.5 }], documents: [] } });
    const i = input({ languages: [{ lang: 'en', level: 'b2', cert: { id: 'ielts', value: 6 } }] });
    const fit = academicFit(p, i);
    expect(fit.met).toBe(false);
    expect(fit.gaps[0]).toEqual({ key: 'gap.language', params: { exam: 'IELTS', need: 6.5, have: 6 } });
    expect(fit.hardFail).toBe(false);
  });
  it('listed language certificates are alternatives: the best one counts', () => {
    const p = program({ requirements: { minGpa: null, minScores: [{ exam: 'ielts', min: 6 }, { exam: 'toefl', min: 78 }], documents: [] } });
    // IELTS 7 is far above 6; TOEFL is not needed
    const strong = academicFit(p, input({ languages: [{ lang: 'en', level: 'b2', cert: { id: 'ielts', value: 7 } }] }));
    expect(strong.margins).toHaveLength(1);
    expect(strong.met).toBe(true);
    expect(strong.gaps).toEqual([]);
    // only a weak IELTS: one gap is reported, not two
    const weak = academicFit(p, input({ languages: [{ lang: 'en', level: 'b1', cert: { id: 'ielts', value: 5 } }] }));
    expect(weak.met).toBe(false);
    expect(weak.gaps).toHaveLength(1);
  });

  it('a certificate above the requirement is met', () => {
    const p = program({ requirements: { minGpa: null, minScores: [{ exam: 'ielts', min: 6 }], documents: [] } });
    const i = input({ languages: [{ lang: 'en', level: 'b2', cert: { id: 'ielts', value: 7.5 } }] });
    expect(academicFit(p, i).met).toBe(true);
  });
  it('without a certificate the self-assessment is compared with the required level', () => {
    const p = program({ requirements: { minGpa: null, minScores: [{ exam: 'ielts', min: 6.5 }], documents: [] } }); // B2
    expect(academicFit(p, input({ languages: [{ lang: 'en', level: 'b2', cert: null }] })).met).toBe(true);
    expect(academicFit(p, input({ languages: [{ lang: 'en', level: 'b1', cert: null }] })).met).toBe(false);
  });
  it('a required exam the person has not taken is a gap, not a failure', () => {
    const p = program({ requirements: { minGpa: null, minScores: [{ exam: 'sat', min: 1200 }], documents: [] } });
    const fit = academicFit(p, input());
    expect(fit.gaps[0].key).toBe('gap.exam_missing');
    expect(fit.hardFail).toBe(false);
  });
  it('an exam result is compared on its own scale', () => {
    const p = program({ requirements: { minGpa: null, minScores: [{ exam: 'sat', min: 1000 }], documents: [] } }); // 50
    const i = input({ exams: [{ exam: 'sat', score: 1300, normalized: 75 }] });
    expect(academicFit(p, i).minMargin).toBe(25);
  });
  it('no requirement data means no academic score', () => {
    const fit = academicFit(program(), input());
    expect(fit.margins).toEqual([]);
    expect(academicScore(fit)).toBeNull();
    expect(fit.met).toBe(true);
  });
  it('the person has no grade: nothing to compare', () => {
    const p = program({ requirements: { minGpa: { system: 'hundred', value: 60 }, minScores: [], documents: [] } });
    expect(academicFit(p, input({ grade: null })).margins).toEqual([]);
  });
});

describe('scoring', () => {
  it('weights: priorities strengthen their components', () => {
    const w = weightsFor(['field', 'price', 'chances']);
    expect(w.field).toBe(BASE_WEIGHTS.field * 2);
    expect(w.budget).toBe(BASE_WEIGHTS.budget * 1.75);
    expect(w.academic).toBe(BASE_WEIGHTS.academic * 1.5);
    expect(w.prestige).toBe(BASE_WEIGHTS.prestige);
    expect(weightsFor([])).toEqual(BASE_WEIGHTS);
  });

  it('budget margin: cheap = 100, the budget = 50, over the tolerance = 0', () => {
    expect(marginScore(100, 1000)).toBe(100);
    expect(marginScore(1000, 1000)).toBe(50);
    expect(marginScore(1150, 1000)).toBe(25);
    expect(marginScore(1200, 1000)).toBe(0);
    expect(marginScore(0, 0)).toBe(100);
  });

  it('components without data are left out; only what the person asked for counts as missing data', () => {
    const p = program();
    const i = input({ fields: ['0613'], budget: null, grade: null });
    const s = scoreProgram(p, i, ctx, academicFit(p, i));
    // the person asked for a field (known) and implicitly for the requirements (unknown): nothing else was asked
    expect(s.missing).toEqual(['academic']);
    expect(s.components.find((c) => c.id === 'field')!.score).toBe(100);
    // an exact field match, but a quarter of what was asked is unknown: the score is pulled down
    expect(s.score).toBeLessThan(100);
    expect(s.score).toBeGreaterThan(70);
  });

  it('a programme checked on every point the person cares about beats one with an unknown price', () => {
    const i = input({ fields: ['0613'], budget: { currency: 'GEL', tuition: 20000, living: null } });
    const known = program({ tuition: [{ amount: 9000, currency: 'GEL', period: 'year', appliesTo: 'international' }] });
    const unknown = program({ tuition: [] });
    const a = scoreProgram(known, i, ctx, academicFit(known, i));
    const b = scoreProgram(unknown, i, ctx, academicFit(unknown, i));
    expect(b.missing).toContain('budget');
    expect(a.score).toBeGreaterThan(b.score);
  });

  it('a programme with no data at all scores 0 instead of failing', () => {
    const p = program({ iscedF: null });
    const i = input({ fields: [], budget: null, grade: null });
    expect(scoreProgram(p, i, ctx, academicFit(p, i)).score).toBe(0);
  });

  it('second and third priority fields count a little less', () => {
    const p = program({ iscedF: '0511' });
    const a = scoreProgram(p, input({ fields: ['0511'] }), ctx, academicFit(p, input()));
    const b = scoreProgram(p, input({ fields: ['0613', '0511'] }), ctx, academicFit(p, input()));
    expect(a.components.find((c) => c.id === 'field')!.score).toBe(100);
    expect(b.components.find((c) => c.id === 'field')!.score).toBe(90);
  });

  it('preferences compare what the person asked for with what is known', () => {
    const p = program();
    const same = scoreProgram(p, input({ ownership: 'public', citySize: 'megapolis', climate: 'temperate' }), ctx, academicFit(p, input()));
    const other = scoreProgram(p, input({ ownership: 'private', citySize: 'small_student', climate: 'cold' }), ctx, academicFit(p, input()));
    expect(same.components.find((c) => c.id === 'preferences')!.score).toBe(100);
    // ownership 0, city 0, climate "cold" vs "temperate" 50 -> 16.7
    expect(other.components.find((c) => c.id === 'preferences')!.score).toBeCloseTo(16.7, 1);
    const unknown = scoreProgram(program({ institution: institution({ ownership: null, size: null, citySize: null, climate: null }) }), input({ ownership: 'public' }), ctx, academicFit(p, input()));
    expect(unknown.components.find((c) => c.id === 'preferences')!.score).toBeNull();
  });

  it('prestige uses the best ranking number of the wanted kind', () => {
    const ranked = program({ institution: institution({ rankings: [{ name: 'QS', year: 2026, position: '151-200', scope: 'world' }] }) });
    const s = scoreProgram(ranked, input({ rating: 'top_world' }), ctx, academicFit(ranked, input()));
    expect(s.components.find((c) => c.id === 'prestige')!.score).toBe(75);
    const none = scoreProgram(ranked, input({ rating: 'top_country' }), ctx, academicFit(ranked, input()));
    expect(none.components.find((c) => c.id === 'prestige')!.score).toBeNull();
  });

  it('life: dormitory and the country\'s work rules', () => {
    const p = program();
    const s = scoreProgram(p, input({ dorm: 'yes', workDuring: 'yes', after: 'stay' }), ctx, academicFit(p, input()));
    // dorm 100, work 100, post-study visa false -> 0
    expect(s.components.find((c) => c.id === 'life')!.score).toBeCloseTo(66.7, 1);
  });

  it('extras: share of the wished-for features the institution has', () => {
    const p = program();
    const s = scoreProgram(p, input({ extras: ['internship', 'double_degree'] }), ctx, academicFit(p, input()));
    expect(s.components.find((c) => c.id === 'extras')!.score).toBe(50);
  });

  it('budget: free programmes score 100, living costs are converted', () => {
    const free = program({ free: true });
    expect(scoreProgram(free, input({ budget: { currency: 'USD', tuition: 4000, living: null } }), ctx, academicFit(free, input())).components.find((c) => c.id === 'budget')!.score).toBe(100);
    // 800 GEL x 12 = 9600 GEL = 3556 USD vs 6000 USD living budget -> ratio 0.59
    const p = program({ tuition: [] });
    const s = scoreProgram(p, input({ budget: { currency: 'USD', tuition: null, living: 6000 } }), ctx, academicFit(p, input()));
    expect(s.components.find((c) => c.id === 'budget')!.score).toBeCloseTo(90.7, 0);
  });
});

describe('groups and results', () => {
  it('groups by the margin over the requirements', () => {
    expect(groupFor(25, true)).toBe('safe');
    expect(groupFor(10, true)).toBe('safe');
    expect(groupFor(5, true)).toBe('suitable');
    expect(groupFor(null, true)).toBe('suitable');
    expect(groupFor(-5, false)).toBe('ambitious');
  });

  const gpa = (value: number) => ({ minGpa: { system: 'hundred', value }, minScores: [], documents: [] });
  const set = [
    program({ id: 'safe1', requirements: gpa(50) }),
    program({ id: 'safe2', requirements: gpa(60) }),
    program({ id: 'fit1', requirements: gpa(75) }),
    program({ id: 'reach1', requirements: gpa(90) }),
    program({ id: 'toofar', requirements: gpa(99) }),
    program({ id: 'wrong-level', level: 'master' }),
    program({ id: 'wrong-lang', languages: ['ka'] }),
  ];

  it('sorts programmes into the three groups and drops the unrealistic and the filtered', () => {
    const m = matchPrograms(set, input(), ctx);
    expect(m.safe.map((r) => r.program.id).sort()).toEqual(['safe1', 'safe2']);
    expect(m.suitable.map((r) => r.program.id)).toEqual(['fit1']);
    expect(m.ambitious.map((r) => r.program.id)).toEqual(['reach1']);
    expect(m.checked).toBe(7);
    expect(m.passed).toBe(4);
  });

  it('an ambitious result says what is missing', () => {
    const reach = matchPrograms(set, input(), ctx).ambitious[0];
    expect(reach.gaps).toEqual([{ key: 'gap.gpa', params: { need: 90, have: 80 } }]);
  });

  it('sorts by score within a group, best first', () => {
    const m = matchPrograms([
      program({ id: 'a', iscedF: '0711' }),
      program({ id: 'b', iscedF: '0613' }),
      program({ id: 'c', iscedF: '0612' }),
    ], input(), ctx);
    expect(m.suitable.map((r) => r.program.id)).toEqual(['b', 'c', 'a']);
    expect(m.suitable[0].score).toBeGreaterThan(m.suitable[1].score);
  });

  it('the strategy changes how many results each group shows', () => {
    const many = Array.from({ length: 12 }, (_, i) => program({ id: `s${i}`, requirements: gpa(10) }));
    expect(matchPrograms(many, input({ strategy: 'safe' }), ctx).safe).toHaveLength(GROUP_LIMITS.safe.safe);
    expect(matchPrograms(many, input({ strategy: 'balanced' }), ctx).safe).toHaveLength(GROUP_LIMITS.balanced.safe);
    expect(matchPrograms(many, input({ strategy: 'ambitious' }), ctx).safe).toHaveLength(GROUP_LIMITS.ambitious.safe);
  });

  it('"why it fits" names up to three good components, most important first', () => {
    const r = matchPrograms([program({ requirements: gpa(60) })], input(), ctx).safe[0];
    expect(r.why.length).toBeGreaterThan(0);
    expect(r.why.length).toBeLessThanOrEqual(3);
    expect(r.why[0].key).toBe('why.field');
    expect(r.why[0].params).toEqual({ match: 'exact' });
  });

  it('shows the tuition in the person\'s currency, and 0 for free programmes', () => {
    const r = matchPrograms([program({ requirements: gpa(10) }), program({ id: 'free', free: true })], input(), ctx);
    const paid = [...r.safe, ...r.suitable].find((x) => x.program.id === 'p1')!;
    expect(paid.tuitionShown!.currency).toBe('USD');
    expect(paid.tuitionShown!.amount).toBeCloseTo(2963, 0);
    expect([...r.safe, ...r.suitable].find((x) => x.program.id === 'free')!.tuitionShown!.amount).toBe(0);
  });

  it('over the budget but within 15 % is shown with a gap', () => {
    const r = matchPrograms([program()], input({ budget: { currency: 'USD', tuition: 2600, living: null } }), ctx);
    const result = [...r.safe, ...r.suitable][0];
    expect(result.gaps[0].key).toBe('gap.over_budget');
  });

  it('a person who needs a preparatory year is told so when the language does not fit', () => {
    const r = matchPrograms([program({ languages: ['ka'] })], input({ prepYear: true }), ctx);
    const result = [...r.safe, ...r.suitable][0];
    expect(result.gaps.some((g) => g.key === 'gap.prep_year')).toBe(true);
  });

  it('is deterministic', () => {
    expect(matchPrograms(set, input(), ctx)).toEqual(matchPrograms(set, input(), ctx));
  });

  it('works with no programmes at all', () => {
    expect(matchPrograms([], input(), ctx)).toEqual({ safe: [], suitable: [], ambitious: [], checked: 0, passed: 0 });
  });
});

describe('buildMatchInput', () => {
  const answers = {
    level: 'master', start: '2027-09', format: 'any', funding: 'paid',
    budget: { currency: 'EUR', tuition: 6000, living: 9000 },
    fields: ['0613', '0612'],
    grade: { system: 'gpa4', value: 3.5 },
    exams: [{ exam: 'sat', score: 1300 }, { exam: 'nope', score: 1 }],
    languages: [{ lang: 'en', level: 'c1', cert: { id: 'ielts', value: 7 } }, { lang: 'ka', level: 'native' }],
    study_languages: { languages: ['en'], prepYear: true },
    rating: 'top_world', ownership: 'public', dorm: 'yes', strategy: 'ambitious',
    priorities: ['field', 'price', 'career'], extras: ['internship'],
  };
  const profile = { residence: 'GE', citizenships: ['GE'], countries: ['DE', 'PL'], types: ['university', 'bogus'] };

  it('converts survey answers and the profile into the matcher input', () => {
    const i = buildMatchInput(answers, profile);
    expect(i.level).toBe('master');
    expect(i.grade).toEqual({ normalized: 87.5, system: 'gpa4', value: 3.5 });
    expect(i.exams).toEqual([{ exam: 'sat', score: 1300, normalized: 75 }]); // unknown exam dropped
    expect(i.languages).toHaveLength(2);
    expect(i.languages[0].cert).toEqual({ id: 'ielts', value: 7 });
    expect(i.studyLanguages).toEqual(['en']);
    expect(i.prepYear).toBe(true);
    expect(i.fields).toEqual(['0613', '0612']);
    expect(i.countries).toEqual(['DE', 'PL']);
    expect(i.types).toEqual(['university']); // unknown type dropped
    expect(i.strategy).toBe('ambitious');
    expect(i.priorities).toEqual(['field', 'price', 'career']);
  });

  it('survives an empty survey', () => {
    const i = buildMatchInput({}, { residence: null, citizenships: [], countries: [], types: [] });
    expect(i.level).toBe('bachelor');
    expect(i.funding).toBe('both');
    expect(i.strategy).toBe('balanced');
    expect(i.grade).toBeNull();
    expect(i.budget).toBeNull();
  });

  it('takes the specialties accepted after the interests test', () => {
    const i = buildMatchInput({ riasec: { answers: Array(12).fill(3), accepted: ['0533'] } }, profile);
    expect(i.fields).toEqual(['0533']);
  });
});
