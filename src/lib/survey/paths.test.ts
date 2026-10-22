// Walks the survey like thousands of different people and runs the matching on every result.
// It checks that: every route through the questions can be finished; every answer made by the walk is valid; the
// answers turn into a matcher input without errors; and the matcher keeps its promises (levels, countries, free
// places, formats, limits). With LIVE=1 the matching also runs on real programmes from the database.
import { describe, expect, it } from 'vitest';
import { GROUP_LIMITS, MAX_PER_INSTITUTION, matchPrograms } from '../matching/engine';
import { buildMatchInput } from '../matching/input';
import type { MatchContext, MatchInput, MatchInstitution, MatchProgram, Matches } from '../matching/types';
import { PRIORITIES_COUNT, PRIORITY_OPTIONS, QUESTIONS, type Question } from './config';
import { educationLevelsFor, intakeOptions, isComplete, isDone, nextQuestion, optionsFor, pruneAnswers, skipAllOptional, stepAfter, validateAnswer, visibleQuestions, type Answers } from './engine';
import { CERTIFICATES, CURRENCIES, EXAMS, GRADING_SYSTEMS, ISCED, LANGUAGE_CODES, OLYMPIAD_LEVELS, SELF_LEVELS, SUBJECTS } from './references';
import { RIASEC_FIELDS } from './riasec';

// ---------------------------------------------------------------- a small seeded random generator (same run every time)
function rng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(next() * list.length)];
  const chance = (p: number) => next() < p;
  const between = (lo: number, hi: number) => lo + next() * (hi - lo);
  const some = <T,>(list: readonly T[], lo: number, hi: number): T[] => {
    const n = lo + Math.floor(next() * (hi - lo + 1));
    const left = [...list];
    const out: T[] = [];
    while (out.length < n && left.length) out.push(left.splice(Math.floor(next() * left.length), 1)[0]);
    return out;
  };
  return { next, pick, chance, between, some };
}
type Rng = ReturnType<typeof rng>;

const TODAY = new Date(2026, 9, 22);
const DETAILED = ISCED.filter((e) => e.c.length === 4).map((e) => e.c);

// ---------------------------------------------------------------- a valid answer to any question
function answerFor(q: Question, a: Answers, r: Rng): unknown {
  switch (q.type) {
    case 'single':
      return r.pick(optionsFor(q, a));
    case 'multi': {
      const all = q.options!;
      const picked = r.some(all, q.required ? 1 : 0, Math.min(all.length, q.max ?? all.length));
      return picked;
    }
    case 'number':
      return Math.round(r.between(q.min ?? 0, q.max ?? 100));
    case 'text':
      return 'a topic';
    case 'intake':
      return r.pick(intakeOptions(TODAY));
    case 'specialty':
      return r.some(DETAILED, 1, q.max ?? 3);
    case 'education':
      return { level: r.pick(educationLevelsFor(a)), year: TODAY.getFullYear() + Math.floor(r.between(-6, 4)) };
    case 'grade': {
      if (r.chance(0.1)) return { none: true };
      const s = r.pick(GRADING_SYSTEMS);
      return { system: s.id, value: Math.round(r.between(s.min, s.max) * 10) / 10 };
    }
    case 'subjects': {
      const system = (a.grade as { system?: string } | undefined)?.system ?? 'hundred';
      const s = GRADING_SYSTEMS.find((x) => x.id === system) ?? GRADING_SYSTEMS.find((x) => x.id === 'hundred')!;
      return r.some(SUBJECTS, 0, q.max ?? 5).map((sub) => ({ subject: sub.id, grade: Math.round(r.between(s.min, s.max) * 10) / 10 }));
    }
    case 'exams':
      return r.some(EXAMS, 0, 3).map((e) => ({ exam: e.id, score: Math.round(r.between(e.min, e.max)) }));
    case 'languages': {
      const langs = ['en', ...r.some(LANGUAGE_CODES.filter((l) => l !== 'en'), 0, 3)];
      return r.some(langs, 1, langs.length).map((lang) => {
        const row: Record<string, unknown> = { lang, level: r.pick(SELF_LEVELS) };
        if (r.chance(0.4)) {
          const cert = r.pick(CERTIFICATES);
          const value = cert.scoreBands ? Math.round(r.between(cert.scoreBands.min, cert.scoreBands.max) * 2) / 2 : r.pick(cert.levels!)[0];
          row.cert = { id: cert.id, value };
        }
        return row;
      });
    }
    case 'studyLanguages':
      return { prepYear: r.chance(0.3), languages: r.some(['en', 'ru', 'de', 'tr', 'fr', 'es', 'pl'], 1, 3) };
    case 'budget': {
      const row: Record<string, unknown> = { currency: r.pick(CURRENCIES), living: Math.round(r.between(0, 30000)) };
      if (a.funding !== 'free') row.tuition = Math.round(r.between(0, 40000));
      return row;
    }
    case 'olympiads':
      return r.some(SUBJECTS, 0, 3).map((s) => ({ subject: s.id, level: r.pick(OLYMPIAD_LEVELS), place: 1 + Math.floor(r.next() * 20) }));
    case 'research':
      return r.chance(0.5) ? { years: Math.floor(r.between(0, 20)), topic: 'graph theory' } : { topic: 'x' };
    case 'riasec': {
      const types = Object.keys(RIASEC_FIELDS) as (keyof typeof RIASEC_FIELDS)[];
      return {
        answers: Array.from({ length: 12 }, () => 1 + Math.floor(r.next() * 5)),
        accepted: r.some(RIASEC_FIELDS[r.pick(types)], 1, 3),
      };
    }
    case 'priorities':
      return r.some(PRIORITY_OPTIONS, PRIORITIES_COUNT, PRIORITIES_COUNT);
  }
}

/** Fills the survey the way the page does: ask the first open question, answer it (or skip an optional one). */
function walk(r: Rng, forced: Answers = {}): { answers: Answers; asked: string[] } {
  const answers: Answers = {};
  const asked: string[] = [];
  for (let step = 0; step < 200; step++) {
    const q = nextQuestion(answers, TODAY);
    if (!q) return { answers, asked };
    asked.push(q.id);
    if (!q.required && r.chance(0.35)) {
      answers._skipped = [...new Set([...(answers._skipped ?? []), q.id])];
      continue;
    }
    const value = q.id in forced ? forced[q.id] : answerFor(q, answers, r);
    expect(validateAnswer(q, value, answers, TODAY), `the walk gave an invalid answer to "${q.id}": ${JSON.stringify(value)}`).toBeNull();
    answers[q.id] = value;
  }
  throw new Error(`the survey did not end: ${asked.slice(-8).join(' > ')}`);
}

// ---------------------------------------------------------------- synthetic programmes and countries
const COUNTRIES = ['GE', 'AM', 'KZ', 'DE', 'NL', 'GB', 'CZ', 'FI', 'TR', 'AU', 'US', 'PL', 'ES'];
const FIELDS = ['0111', '0231', '0311', '0312', '0411', '0413', '0511', '0533', '0613', '0714', '0732', '0912', '1015'];
const LEVELS = ['school', 'college', 'foundation', 'bachelor', 'master', 'phd', 'language_course'] as const;
const TYPES = ['university', 'college', 'school', 'language_school', 'foundation', 'vocational'] as const;

function makePrograms(r: Rng, n: number): MatchProgram[] {
  const institutions: MatchInstitution[] = Array.from({ length: 60 }, (_, i) => ({
    id: `i${i}`, slug: `uni-${i}`, type: r.pick(TYPES), country: r.pick(COUNTRIES), city: { en: 'City' }, names: { en: `Uni ${i}` },
    ownership: r.pick(['public', 'private', null] as const), size: r.pick(['large', 'small', null] as const),
    citySize: r.pick(['megapolis', 'medium', 'small_student', null] as const), climate: r.pick(['warm', 'temperate', 'cold', null] as const),
    dormitory: r.pick([true, false, null] as const), features: r.some(['internship', 'double_degree', 'exchange'], 0, 3),
    rankings: r.chance(0.4) ? [{ name: 'QS', year: 2026, position: String(1 + Math.floor(r.next() * 800)), scope: r.pick(['world', 'country'] as const) }] : [],
    verifiedAt: '2026-01-01',
  }));
  return Array.from({ length: n }, (_, i) => {
    const free = r.chance(0.2);
    return {
      id: `p${i}`, institution: r.pick(institutions), names: { en: `Programme ${i}` }, level: r.pick(LEVELS), iscedF: r.chance(0.9) ? r.pick(FIELDS) : null,
      languages: r.some(['en', 'ru', 'de', 'tr', 'fr', 'es', 'pl'], 0, 2), durationYears: r.pick([null, 1, 2, 3, 4]), format: r.pick(['on_campus', 'online', 'blended', null] as const),
      intakes: r.some(['02', '09'], 0, 2),
      tuition: free ? [] : r.chance(0.8)
        ? [{ amount: r.pick([null, 0, 500, 3000, 9000, 25000]), currency: r.pick(['EUR', 'USD', 'GEL', 'KZT', 'GBP', 'XXX']), period: r.pick(['year', 'semester', 'credit', 'total'] as const), appliesTo: r.pick(['all', 'international', 'eu', 'domestic'] as const) }]
        : [],
      free,
      requirements: {
        minGpa: r.chance(0.3) ? { system: r.pick(['hundred', 'gpa4', 'german', 'five']), value: r.pick([1, 2, 3, 60, 75]) } : null,
        minScores: r.chance(0.3) ? [{ exam: r.pick(EXAMS).id, min: r.pick([100, 500, 1000]) }] : [],
        documents: [],
      },
      applicationFee: null, applicationUrl: null,
    };
  });
}

const ctx: MatchContext = {
  rates: { USD: 1, EUR: 0.92, GBP: 0.8, GEL: 2.7, KZT: 480, TRY: 40 },
  countries: Object.fromEntries(
    COUNTRIES.map((c) => [c, { code: c, currency: null, workDuringStudy: c === 'GE' ? true : null, postStudyWorkVisa: null, recognition: c === 'DE' ? true : null, costOfLiving: [] }]),
  ),
  today: TODAY,
};

function checkMatches(input: MatchInput, m: Matches, programs: readonly MatchProgram[], label: string) {
  const all = [...m.safe, ...m.suitable, ...m.ambitious];
  const limits = GROUP_LIMITS[input.strategy];
  expect(m.safe.length, label).toBeLessThanOrEqual(limits.safe);
  expect(m.suitable.length, label).toBeLessThanOrEqual(limits.suitable);
  expect(m.ambitious.length, label).toBeLessThanOrEqual(limits.ambitious);
  expect(m.checked, label).toBe(programs.length);
  expect(m.passed, label).toBeLessThanOrEqual(m.checked);
  expect(all.length, label).toBeLessThanOrEqual(m.passed);
  expect(new Set(all.map((x) => x.program.id)).size, `${label}: duplicates`).toBe(all.length);
  for (const x of all) {
    expect(x.score, label).toBeGreaterThanOrEqual(0);
    expect(x.score, label).toBeLessThanOrEqual(100);
    expect(Number.isFinite(x.score), label).toBe(true);
    expect(x.program.level, `${label}: wrong level`).toBe(input.level);
    if (input.countries.length > 0) expect(input.countries, `${label}: wrong country`).toContain(x.program.institution.country);
    if (input.types.length > 0) expect(input.types, `${label}: wrong type`).toContain(x.program.institution.type);
    if (input.funding === 'free') expect(x.program.free || x.program.tuition.every((t) => t.amount === 0), `${label}: not free`).toBe(true);
    if (input.format.length > 0 && x.program.format && x.program.format !== 'blended') expect(input.format, `${label}: wrong format`).toContain(x.program.format);
  }
  // at most MAX_PER_INSTITUTION programmes of one institution in each of the three lists
  for (const list of [m.safe, m.suitable, m.ambitious]) {
    const perInst = new Map<string, number>();
    for (const x of list) perInst.set(x.program.institution.id, (perInst.get(x.program.institution.id) ?? 0) + 1);
    for (const n of perInst.values()) expect(n, label).toBeLessThanOrEqual(MAX_PER_INSTITUTION);
  }
  for (let i = 1; i < m.safe.length; i++) expect(m.safe[i - 1].score).toBeGreaterThanOrEqual(m.safe[i].score);
}

// ---------------------------------------------------------------- the tests
describe('every question accepts every one of its own options', () => {
  it('each option of each choice question is a valid answer', () => {
    for (const q of QUESTIONS) {
      if (q.type === 'single') {
        // an option that depends on the level is checked with a level it is offered for
        for (const o of q.options!) {
          const level = q.optionLevels?.[o]?.[0];
          expect(validateAnswer(q, o, level ? { level } : {}, TODAY), `${q.id}=${o}`).toBeNull();
        }
      }
      if (q.type === 'multi') {
        for (const o of q.options!) expect(validateAnswer(q, [o], {}, TODAY), `${q.id}=[${o}]`).toBeNull();
        if (!q.max || q.max >= q.options!.length) expect(validateAnswer(q, [...q.options!], {}, TODAY), `${q.id}=all`).toBeNull();
      }
    }
  });
  it('options that depend on the level: second degree only for a bachelor, education levels for school and college', () => {
    const situation = QUESTIONS.find((x) => x.id === 'situation')!;
    expect(optionsFor(situation, { level: 'college' })).toEqual(['first', 'transfer']);
    expect(optionsFor(situation, { level: 'bachelor' })).toEqual(['first', 'transfer', 'second_degree']);
    expect(validateAnswer(situation, 'second_degree', { level: 'college' }, TODAY)).toBe('invalid');
    expect(validateAnswer(situation, 'second_degree', { level: 'bachelor' }, TODAY)).toBeNull();
    const education = QUESTIONS.find((x) => x.id === 'education')!;
    expect(validateAnswer(education, { level: 'master', year: 2026 }, { level: 'school' }, TODAY)).toBe('invalid');
    expect(validateAnswer(education, { level: 'school_9', year: 2026 }, { level: 'school' }, TODAY)).toBeNull();
    expect(validateAnswer(education, { level: 'bachelor', year: 2026 }, { level: 'master' }, TODAY)).toBeNull();
    expect(visibleQuestions({ level: 'foundation' }).some((x) => x.id === 'olympiads')).toBe(true);
  });
  it('all 120 ordered triples of priorities are valid, and nothing else is', () => {
    const q = QUESTIONS.find((x) => x.id === 'priorities')!;
    let valid = 0;
    for (const a of PRIORITY_OPTIONS) for (const b of PRIORITY_OPTIONS) for (const c of PRIORITY_OPTIONS) {
      const ok = validateAnswer(q, [a, b, c], {}, TODAY) === null;
      expect(ok).toBe(new Set([a, b, c]).size === 3);
      if (ok) valid++;
    }
    expect(valid).toBe(120);
    expect(validateAnswer(q, [PRIORITY_OPTIONS[0], PRIORITY_OPTIONS[1]], {}, TODAY)).toBe('priorities');
  });
});

describe('every level, certainty of direction and funding choice can be finished', () => {
  const levels = QUESTIONS.find((q) => q.id === 'level')!.options!;
  const certainties = QUESTIONS.find((q) => q.id === 'field_certainty')!.options!;
  const fundings = QUESTIONS.find((q) => q.id === 'funding')!.options!;
  for (const level of levels) {
    for (const certainty of [...certainties, undefined]) {
      for (const funding of fundings) {
        it(`${level} / ${certainty ?? 'no direction question'} / ${funding}`, () => {
          for (let seed = 1; seed <= 6; seed++) {
            const r = rng(seed * 7919 + level.length);
            const forced: Answers = { level, funding };
            if (certainty) forced.field_certainty = certainty;
            const { answers, asked } = walk(r, forced);
            const label = `${level}/${certainty}/${funding}/seed${seed}`;
            // finished: nothing left to ask, all required answers valid
            expect(nextQuestion(answers, TODAY), label).toBeNull();
            expect(isComplete(answers, TODAY), label).toBe(true);
            // the final step of the page: unused answers are removed; the survey is still complete
            const pruned = pruneAnswers(answers);
            expect(isComplete(pruned, TODAY), `${label}: complete after pruning`).toBe(true);
            // the direction question matches the level
            const ids = new Set(visibleQuestions(answers).map((q) => q.id));
            if (level === 'school' || level === 'language_course') expect(ids.has('field_certainty'), label).toBe(false);
            else if (certainty === 'unknown') expect(ids.has('riasec'), label).toBe(true);
            else if (certainty) expect(ids.has('fields'), label).toBe(true);
            // free education: no tuition question follow-ups
            if (funding === 'free') expect(ids.has('scholarship') || ids.has('loan'), label).toBe(false);
            // priorities is always last
            expect(asked.at(-1), label).toBe('priorities');
            // every answer in the pruned set belongs to a shown question
            for (const k of Object.keys(pruned)) if (k !== '_skipped') expect(ids.has(k), `${label}: stray answer ${k}`).toBe(true);
            // each shown required question is answered
            for (const q of visibleQuestions(pruned)) if (q.required) expect(isDone(q, pruned, TODAY), `${label}: ${q.id}`).toBe(true);
          }
        });
      }
    }
  }
});

// The page itself: "Back", changing an earlier answer, "Skip", "Skip all the rest", "Next" / "Finish" in any order.
// stepAfter() is what the page calls after each save; the survey must always end, never get stuck or loop.
describe('a restless person: back, changed answers, skips, skip-all', () => {
  it('3000 such people always reach "Finish" with a complete survey', () => {
    let finished = 0;
    let backs = 0;
    for (let i = 0; i < 3000; i++) {
      const r = rng(50000 + i);
      let answers: Answers = {};
      let current = nextQuestion(answers, TODAY)!.id;
      let done = false;
      for (let step = 0; step < 800 && !done; step++) {
        const shown = visibleQuestions(answers);
        const idx = Math.max(0, shown.findIndex((q) => q.id === current));
        const q = shown[idx];
        if (idx > 0 && r.chance(0.15)) {
          current = shown[idx - 1].id; // "Back"
          backs++;
          continue;
        }
        const withoutSkip = (a: Answers): Answers => ({ ...a, _skipped: (a._skipped ?? []).filter((id) => id !== q.id) });
        let next: Answers;
        let mode: 'step' | 'forward' = 'step';
        if (!q.required && r.chance(0.25)) {
          const rest = { ...answers };
          delete rest[q.id];
          next = { ...rest, _skipped: [...new Set([...(answers._skipped ?? []), q.id])] }; // "Skip"
        } else if (!q.required && r.chance(0.1)) {
          next = skipAllOptional({ ...answers }, TODAY); // "Skip all the rest"
          mode = 'forward';
        } else {
          const value = answerFor(q, answers, r);
          expect(validateAnswer(q, value, answers, TODAY), `person ${i}: ${q.id}`).toBeNull();
          next = withoutSkip({ ...answers, [q.id]: value });
        }
        const move = stepAfter(next, q.id, mode, TODAY);
        expect(move.kind, `person ${i} got stuck after "${q.id}"`).not.toBe('stuck');
        // the last question with every required answer valid: "Finish" must finish, whatever optional question is open
        if (visibleQuestions(next).at(-1)?.id === q.id && isComplete(next, TODAY)) {
          expect(move.kind, `person ${i}: "Finish" did not finish after "${q.id}"`).toBe('finish');
        }
        if (move.kind === 'finish') {
          expect(isComplete(pruneAnswers(next), TODAY), `person ${i}: finished, but not complete`).toBe(true);
          finished++;
          done = true;
        } else if (move.kind === 'go') {
          answers = next;
          current = move.id;
          expect(visibleQuestions(answers).some((x) => x.id === move.id), `person ${i}: sent to a question that is not shown`).toBe(true);
        }
      }
      expect(done, `person ${i} never reached "Finish"`).toBe(true);
    }
    expect(finished).toBe(3000);
    expect(backs).toBeGreaterThan(1000);
  });
});

describe('2000 random people through the survey and the matching', () => {
  const r0 = rng(20261022);
  const programs = makePrograms(r0, 500);
  it('the walk, the matcher input and the matches all hold together', () => {
    let withMatches = 0;
    let withNone = 0;
    const profileOf = (r: Rng) => ({
      residence: r.pick(COUNTRIES),
      citizenships: r.some(COUNTRIES, 1, 2),
      countries: r.chance(0.4) ? r.some(COUNTRIES, 1, 4) : [],
      types: r.chance(0.3) ? r.some([...TYPES], 1, 2) : [],
    });
    for (let i = 0; i < 2000; i++) {
      const r = rng(1000 + i);
      const { answers } = walk(r);
      const pruned = pruneAnswers(answers);
      expect(isComplete(pruned, TODAY), `person ${i}`).toBe(true);
      const input = buildMatchInput(pruned, profileOf(r));
      expect(LEVELS, `person ${i}`).toContain(input.level);
      expect(input.priorities.length, `person ${i}`).toBe(PRIORITIES_COUNT);
      expect(['safe', 'balanced', 'ambitious'], `person ${i}`).toContain(input.strategy);
      if (['school', 'language_course'].includes(input.level)) expect(input.fields.length, `person ${i}: fields for ${input.level}`).toBe(0);
      const m = matchPrograms(programs, input, ctx);
      checkMatches(input, m, programs, `person ${i} (${input.level})`);
      if (m.safe.length + m.suitable.length + m.ambitious.length > 0) withMatches++;
      else withNone++;
    }
    // sanity of the test itself: a good share of people must get matches, otherwise the check proves nothing
    expect(withMatches).toBeGreaterThan(300);
    console.log(`random people: ${withMatches} got matches, ${withNone} got none`);
  });
});

describe('the answers of older surveys still work', () => {
  it('a text format ("any" or one value) from the first survey version is understood', () => {
    const base = walk(rng(5)).answers;
    for (const old of ['any', 'on_campus', 'online', 'blended']) {
      const input = buildMatchInput({ ...pruneAnswers(base), format: old }, { residence: 'GE', citizenships: ['GE'], countries: [], types: [] });
      expect(input.format).toEqual(old === 'any' ? [] : [old]);
    }
  });
});

// ---------------------------------------------------------------- real programmes (npm run: LIVE=1 npx vitest run paths)
describe.skipIf(!process.env.LIVE)('real programmes from the database', () => {
  it('2000 random people on 7000 real programmes: no errors, and the promises hold', async () => {
    const { readFileSync } = await import('node:fs');
    const { createClient } = await import('@supabase/supabase-js');
    const { loadMatchData } = await import('../matching/load');
    const env = Object.fromEntries(
      readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
    );
    const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });
    const real: MatchProgram[] = [];
    const countries: Record<string, import('../matching/types').CountryFacts> = {};
    for (const level of LEVELS) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const data = await loadMatchData(supabase, { level });
          real.push(...data.programs.slice(0, 1000));
          Object.assign(countries, data.countries);
          break;
        } catch {
          /* the first read after a quiet period can time out: try again */
        }
      }
    }
    expect(real.length).toBeGreaterThan(3000);
    const realCtx: MatchContext = { rates: ctx.rates, countries, today: TODAY };
    const byLevel: Record<string, { people: number; withMatches: number }> = {};
    // for the people who got nothing: which rule removed most of the programmes of their level
    const blockers: Record<string, Record<string, number>> = {};
    const t0 = Date.now();
    for (let i = 0; i < 2000; i++) {
      const r = rng(777 + i);
      const { answers } = walk(r);
      const pruned = pruneAnswers(answers);
      const input = buildMatchInput(pruned, { residence: 'GE', citizenships: ['GE'], countries: [], types: [] });
      // like the page: only the programmes of the person's level are read from the database
      const ofLevel = real.filter((p) => p.level === input.level);
      const m = matchPrograms(ofLevel, input, realCtx);
      checkMatches(input, m, ofLevel, `real person ${i} (${input.level})`);
      const s = (byLevel[input.level] ??= { people: 0, withMatches: 0 });
      s.people++;
      if (m.safe.length + m.suitable.length + m.ambitious.length > 0) s.withMatches++;
      else {
        const top = Object.entries(m.rejected).sort((a, b) => b[1] - a[1])[0]?.[0] ?? (m.passed === 0 ? 'nothing checked' : 'passed but dropped');
        const row = (blockers[input.level] ??= {});
        row[top] = (row[top] ?? 0) + 1;
      }
    }
    console.log('main reason for people with no matches, by level:');
    console.table(blockers);
    console.log(`real data: ${real.length} programmes, 2000 people in ${Date.now() - t0} ms`);
    console.table(byLevel);
  }, 600_000);
});
