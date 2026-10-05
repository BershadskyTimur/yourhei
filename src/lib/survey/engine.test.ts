import { describe, expect, it } from 'vitest';
import { QUESTIONS, QUESTION_BY_ID, SURVEY_VERSION } from './config';
import {
  chosenFields,
  intakeOptions,
  isComplete,
  nextQuestion,
  progress,
  pruneAnswers,
  skipAllOptional,
  validateAnswer,
  visibleQuestions,
  type Answers,
} from './engine';

const today = new Date(2026, 9, 5); // 5 October 2026
const ids = (answers: Answers) => visibleQuestions(answers).map((q) => q.id);
const required = (answers: Answers) => visibleQuestions(answers).filter((q) => q.required).map((q) => q.id);

const bachelor = (): Answers => ({
  level: 'bachelor',
  start: '2027-09',
  format: 'on_campus',
  field_certainty: 'sure',
  fields: ['0613'],
  education: { level: 'school_11', year: 2026 },
  grade: { system: 'five', value: 4.5 },
  languages: [{ lang: 'en', level: 'b2' }],
  study_languages: { languages: ['en'], prepYear: false },
  funding: 'both',
  budget: { currency: 'EUR', tuition: 5000, living: 8000 },
  strategy: 'balanced',
  dorm: 'yes',
  priorities: ['price', 'field', 'chances'],
});

describe('config', () => {
  it('has unique ids and a version', () => {
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(QUESTIONS.length);
    expect(SURVEY_VERSION).toBeGreaterThanOrEqual(1);
  });
  it('every condition refers to a question that exists and comes earlier', () => {
    QUESTIONS.forEach((q, i) => {
      const conds = q.showIf ? (Array.isArray(q.showIf) ? q.showIf : [q.showIf]) : [];
      for (const c of conds) {
        const at = QUESTIONS.findIndex((x) => x.id === c.q);
        expect(at, `${q.id} -> ${c.q}`).toBeGreaterThanOrEqual(0);
        expect(at, `${q.id} must come after ${c.q}`).toBeLessThan(i);
      }
    });
  });
  it('choice questions have options', () => {
    for (const q of QUESTIONS) if (q.type === 'single' || q.type === 'multi') expect(q.options?.length).toBeGreaterThan(1);
  });
});

describe('adaptive questions', () => {
  it('starts with the general questions only', () => {
    expect(ids({})).toEqual(['level', 'start', 'format', 'languages', 'study_languages', 'funding', 'budget', 'city_size', 'climate', 'dorm', 'accessibility', 'priorities']);
  });

  it('a bachelor applicant gets 14 required questions', () => {
    const a = bachelor();
    expect(required(a)).toHaveLength(14);
    expect(ids(a)).toContain('situation');
    expect(ids(a)).toContain('extras');
    expect(ids(a)).not.toContain('school_profile');
    expect(ids(a)).not.toContain('diploma_field');
    expect(ids(a)).not.toContain('riasec');
  });

  it('a school applicant gets school questions and no specialty questions', () => {
    const a: Answers = { level: 'school' };
    expect(ids(a)).toEqual(expect.arrayContaining(['school_profile', 'school_grade', 'school_program']));
    expect(ids(a)).not.toContain('field_certainty');
    expect(ids(a)).not.toContain('situation');
    expect(required(a)).toHaveLength(15);
  });

  it('a college applicant gets the college questions', () => {
    const a: Answers = { level: 'college' };
    expect(ids(a)).toEqual(expect.arrayContaining(['profession', 'college_to_uni', 'field_certainty']));
  });

  it('language courses skip education, grades, specialties and institution questions', () => {
    const a: Answers = { level: 'language_course' };
    expect(required(a)).toEqual(['level', 'start', 'format', 'languages', 'study_languages', 'funding', 'budget', 'dorm', 'priorities']);
    expect(ids(a)).not.toContain('education');
    expect(ids(a)).not.toContain('strategy');
  });

  it('master and PhD applicants also get the research questions', () => {
    const a: Answers = { ...bachelor(), level: 'master' };
    expect(ids(a)).toEqual(expect.arrayContaining(['diploma_field', 'work_years', 'research_topic']));
  });

  it('"I do not know" leads to the interests test instead of the specialty list', () => {
    const a: Answers = { ...bachelor(), field_certainty: 'unknown' };
    expect(ids(a)).toContain('riasec');
    expect(ids(a)).not.toContain('fields');
  });

  it('free education removes the money follow-ups', () => {
    const paid = ids({ ...bachelor(), funding: 'paid' });
    const free = ids({ ...bachelor(), funding: 'free' });
    expect(paid).toEqual(expect.arrayContaining(['scholarship', 'loan']));
    expect(free).not.toContain('scholarship');
    expect(free).not.toContain('loan');
  });

  it('a typical path stays within the promised size', () => {
    const a = bachelor();
    expect(required(a).length).toBeLessThanOrEqual(20);
    expect(ids(a).length).toBeLessThanOrEqual(34);
  });
});

describe('progress and completion', () => {
  it('asks in order, optional questions included, until they are answered or skipped', () => {
    expect(nextQuestion({})!.id).toBe('level');
    expect(nextQuestion({ level: 'bachelor' })!.id).toBe('situation'); // optional, but asked in its place
    expect(nextQuestion({ level: 'bachelor', _skipped: ['situation'] })!.id).toBe('start');
  });

  it('is complete when all required answers are valid, even with optional ones empty', () => {
    expect(isComplete(bachelor(), today)).toBe(true);
  });

  it('is not complete while a required answer is missing', () => {
    const a = bachelor();
    delete a.priorities;
    expect(isComplete(a, today)).toBe(false);
    expect(nextQuestion(skipAllOptional(a, today), today)!.id).toBe('priorities');
  });

  it('counts done and required-left', () => {
    const p = progress(bachelor(), today);
    expect(p.requiredLeft).toBe(0);
    expect(p.done).toBe(14);
    expect(p.total).toBeGreaterThan(14);
  });

  it('"skip all optional" finishes the optional part in one step', () => {
    const skipped = skipAllOptional(bachelor(), today);
    expect(nextQuestion(skipped, today)).toBeNull();
    expect(progress(skipped, today).done).toBe(progress(skipped, today).total);
  });

  it('a required question cannot be skipped', () => {
    const a: Answers = { ...bachelor(), _skipped: ['priorities'] };
    delete a.priorities;
    expect(isComplete(a, today)).toBe(false);
    expect(nextQuestion(skipAllOptional(a, today), today)!.id).toBe('priorities');
  });
});
describe('prune and chosen fields', () => {
  it('drops answers of questions that are no longer shown', () => {
    const a: Answers = { ...bachelor(), school_profile: 'physmath', _skipped: ['situation', 'school_coed'] };
    const pruned = pruneAnswers({ ...a, level: 'bachelor' });
    expect(pruned.school_profile).toBeUndefined();
    expect(pruned._skipped).toEqual(['situation']);
    expect(pruned.level).toBe('bachelor');
  });

  it('keeps the fields from the direct choice or the accepted test result', () => {
    expect(chosenFields(bachelor())).toEqual(['0613']);
    expect(chosenFields({ riasec: { answers: Array(12).fill(3), accepted: ['0533', '0541'] } })).toEqual(['0533', '0541']);
    expect(chosenFields({})).toEqual([]);
  });
});

describe('validateAnswer', () => {
  const q = (id: string) => QUESTION_BY_ID.get(id)!;

  it('single and multi choice', () => {
    expect(validateAnswer(q('level'), 'bachelor', {})).toBeNull();
    expect(validateAnswer(q('level'), 'phd2', {})).toBe('invalid');
    expect(validateAnswer(q('level'), '', {})).toBe('required');
    expect(validateAnswer(q('achievements'), ['sport', 'projects'], {})).toBeNull();
    expect(validateAnswer(q('achievements'), ['sport', 'sport'], {})).toBe('invalid');
    expect(validateAnswer(q('achievements'), ['nonsense'], {})).toBe('invalid');
  });

  it('numbers respect their range', () => {
    expect(validateAnswer(q('school_grade'), 9, {})).toBeNull();
    expect(validateAnswer(q('school_grade'), 13, {})).toBe('outOfRange');
    expect(validateAnswer(q('school_grade'), '9', {})).toBe('outOfRange');
  });

  it('intake must be an upcoming spring or autumn start', () => {
    expect(intakeOptions(today)[0]).toBe('2027-02');
    expect(validateAnswer(q('start'), '2027-09', {}, today)).toBeNull();
    expect(validateAnswer(q('start'), '2025-09', {}, today)).toBe('invalid');
    expect(validateAnswer(q('start'), '2027-05', {}, today)).toBe('invalid');
  });

  it('specialties: known codes, up to three', () => {
    expect(validateAnswer(q('fields'), ['0613', '0711'], {})).toBeNull();
    expect(validateAnswer(q('fields'), ['9999'], {})).toBe('invalid');
    expect(validateAnswer(q('fields'), ['0613', '0711', '0911', '0912'], {})).toBe('tooMany');
    expect(validateAnswer(q('fields'), [], {})).toBe('required');
  });

  it('grade needs a system and a value that fits it, or "no grades"', () => {
    expect(validateAnswer(q('grade'), { system: 'gpa4', value: 3.6 }, {})).toBeNull();
    expect(validateAnswer(q('grade'), { system: 'gpa4', value: 4.6 }, {})).toBe('outOfRange');
    expect(validateAnswer(q('grade'), { system: 'german', value: 1.3 }, {})).toBeNull();
    expect(validateAnswer(q('grade'), { none: true }, {})).toBeNull();
    expect(validateAnswer(q('grade'), { system: 'nope', value: 3 }, {})).toBe('outOfRange');
  });

  it('subject grades use the grading system chosen before', () => {
    const answers: Answers = { grade: { system: 'five', value: 4 } };
    expect(validateAnswer(q('subjects'), [{ subject: 'math', grade: 5 }], answers)).toBeNull();
    expect(validateAnswer(q('subjects'), [{ subject: 'math', grade: 95 }], answers)).toBe('outOfRange');
    expect(validateAnswer(q('subjects'), [{ subject: 'math', grade: 5 }, { subject: 'math', grade: 4 }], answers)).toBe('invalid');
  });

  it('exams are checked against their own scale', () => {
    expect(validateAnswer(q('exams'), [{ exam: 'sat', score: 1450 }], {})).toBeNull();
    expect(validateAnswer(q('exams'), [{ exam: 'sat', score: 1650 }], {})).toBe('outOfRange');
    expect(validateAnswer(q('exams'), [{ exam: 'zzz', score: 1 }], {})).toBe('invalid');
  });

  it('languages: self-assessment, optional certificate that must fit its scale', () => {
    const ok = [{ lang: 'en', level: 'c1', cert: { id: 'ielts', value: 7.5 } }, { lang: 'ka', level: 'native' }];
    expect(validateAnswer(q('languages'), ok, {})).toBeNull();
    expect(validateAnswer(q('languages'), [{ lang: 'en', level: 'c1', cert: { id: 'ielts', value: 12 } }], {})).toBe('outOfRange');
    expect(validateAnswer(q('languages'), [{ lang: 'en', level: 'x' }], {})).toBe('invalid');
    expect(validateAnswer(q('languages'), [{ lang: 'en', level: 'a1' }, { lang: 'en', level: 'b1' }], {})).toBe('invalid');
    expect(validateAnswer(q('languages'), [], {})).toBe('required');
  });

  it('study languages', () => {
    expect(validateAnswer(q('study_languages'), { languages: ['en', 'de'], prepYear: true }, {})).toBeNull();
    expect(validateAnswer(q('study_languages'), { languages: [], prepYear: true }, {})).toBe('required');
    expect(validateAnswer(q('study_languages'), { languages: ['en'] }, {})).toBe('invalid');
  });

  it('budget needs living costs, and tuition unless education must be free', () => {
    const paid: Answers = { funding: 'paid' };
    expect(validateAnswer(q('budget'), { currency: 'EUR', tuition: 5000, living: 7000 }, paid)).toBeNull();
    expect(validateAnswer(q('budget'), { currency: 'EUR', tuition: null, living: 7000 }, paid)).toBe('invalid');
    expect(validateAnswer(q('budget'), { currency: 'EUR', tuition: null, living: 7000 }, { funding: 'free' })).toBeNull();
    expect(validateAnswer(q('budget'), { currency: 'XXX', tuition: 1, living: 1 }, paid)).toBe('invalid');
    expect(validateAnswer(q('budget'), { currency: 'EUR', tuition: -5, living: 1 }, paid)).toBe('invalid');
  });

  it('priorities: exactly three different ones', () => {
    expect(validateAnswer(q('priorities'), ['price', 'field', 'career'], {})).toBeNull();
    expect(validateAnswer(q('priorities'), ['price', 'field'], {})).toBe('priorities');
    expect(validateAnswer(q('priorities'), ['price', 'price', 'career'], {})).toBe('priorities');
    expect(validateAnswer(q('priorities'), ['price', 'field', 'nonsense'], {})).toBe('priorities');
  });

  it('interests test: 12 answers 1-5 and at least one accepted specialty', () => {
    const answers = Array(12).fill(4);
    expect(validateAnswer(q('riasec'), { answers, accepted: ['0533'] }, {})).toBeNull();
    expect(validateAnswer(q('riasec'), { answers: answers.slice(1), accepted: ['0533'] }, {})).toBe('invalid');
    expect(validateAnswer(q('riasec'), { answers: Array(12).fill(6), accepted: ['0533'] }, {})).toBe('invalid');
    expect(validateAnswer(q('riasec'), { answers, accepted: [] }, {})).toBe('required');
  });

  it('education level and year', () => {
    expect(validateAnswer(q('education'), { level: 'school_11', year: 2026 }, {}, today)).toBeNull();
    expect(validateAnswer(q('education'), { level: 'kindergarten', year: 2026 }, {}, today)).toBe('invalid');
    expect(validateAnswer(q('education'), { level: 'college', year: 1900 }, {}, today)).toBe('invalid');
  });

  it('olympiads', () => {
    expect(validateAnswer(q('olympiads'), [{ subject: 'math', level: 'national', place: 3 }], {})).toBeNull();
    expect(validateAnswer(q('olympiads'), [{ subject: 'math', level: 'galactic', place: 3 }], {})).toBe('invalid');
    expect(validateAnswer(q('olympiads'), [{ subject: 'math', level: 'national', place: 0 }], {})).toBe('outOfRange');
  });
});
