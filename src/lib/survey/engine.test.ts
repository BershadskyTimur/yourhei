import { describe, expect, it } from 'vitest';
import { PAGES, QUESTIONS, QUESTION_BY_ID, SURVEY_VERSION } from './config';
import {
  chosenFields,
  firstOpenPage,
  intakeOptions,
  isComplete,
  nextQuestion,
  pageAfter,
  pageErrors,
  progress,
  pruneAnswers,
  submitPage,
  validateAnswer,
  visiblePages,
  visibleQuestions,
  type Answers,
} from './engine';

const today = new Date(2026, 9, 5); // 5 October 2026
const ids = (answers: Answers) => visibleQuestions(answers).map((q) => q.id);
const required = (answers: Answers) => visibleQuestions(answers).filter((q) => q.required).map((q) => q.id);

const bachelor = (): Answers => ({
  level: 'bachelor',
  start: '2027-09',
  format: ['on_campus', 'blended'],
  field_certainty: 'sure',
  fields: ['0613'],
  education: { level: 'school_11', year: 2026 },
  grade: { system: 'five', value: 4.5 },
  languages: [{ lang: 'en', level: 'b2' }],
  study_languages: { languages: ['en'], prepYear: false },
  budget: { currency: 'EUR', tuition: 'to5', living: 'to10' },
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
  it('every question is on exactly one page, and the pages keep the order of the questions', () => {
    expect(PAGES.flatMap((p) => p.questions)).toEqual(QUESTIONS.map((q) => q.id));
  });
  it('the questions removed in version 3 are gone', () => {
    for (const id of ['achievements', 'funding', 'loan', 'size', 'city_size', 'work_during', 'after', 'family', 'accessibility']) {
      expect(QUESTION_BY_ID.has(id), id).toBe(false);
    }
  });
});

describe('adaptive questions', () => {
  it('starts with the general questions only', () => {
    expect(ids({})).toEqual(['level', 'start', 'format', 'languages', 'study_languages', 'budget', 'scholarship', 'climate', 'dorm', 'priorities']);
  });

  it('a bachelor applicant gets 13 required questions', () => {
    const a = bachelor();
    expect(required(a)).toHaveLength(13);
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
    expect(required(a)).toHaveLength(14);
  });

  it('a college applicant gets the college questions', () => {
    const a: Answers = { level: 'college' };
    expect(ids(a)).toEqual(expect.arrayContaining(['profession', 'college_to_uni', 'field_certainty']));
  });

  it('language courses skip education, grades, specialties and institution questions', () => {
    const a: Answers = { level: 'language_course' };
    expect(required(a)).toEqual(['level', 'start', 'format', 'languages', 'study_languages', 'budget', 'dorm', 'priorities']);
    expect(ids(a)).not.toContain('education');
    expect(ids(a)).not.toContain('strategy');
  });

  it('master and PhD applicants also get the research questions', () => {
    const a: Answers = { ...bachelor(), level: 'master' };
    expect(ids(a)).toEqual(expect.arrayContaining(['diploma_field', 'research']));
  });

  it('the previous diploma is asked right after the current education, and work and research are one question', () => {
    const a: Answers = { ...bachelor(), level: 'master' };
    const order = ids(a);
    expect(order.indexOf('diploma_field')).toBe(order.indexOf('education') + 1);
    expect(order).not.toContain('work_years');
    expect(order).not.toContain('research_topic');
  });

  it('study format: several can be chosen, at least one', () => {
    const q = visibleQuestions({}).find((x) => x.id === 'format')!;
    expect(validateAnswer(q, ['on_campus', 'blended'], {}, today)).toBeNull();
    expect(validateAnswer(q, [], {}, today)).toBe('required');
    expect(validateAnswer(q, ['online', 'online'], {}, today)).toBe('invalid');
    expect(validateAnswer(q, ['any'], {}, today)).toBe('invalid');
  });

  it('work experience and research topic: both optional, but valid when given', () => {
    const q = { ...visibleQuestions({ level: 'master' }).find((x) => x.id === 'research')! };
    expect(validateAnswer(q, { years: 3, topic: 'Graph theory' }, {}, today)).toBeNull();
    expect(validateAnswer(q, { years: 3 }, {}, today)).toBeNull();
    expect(validateAnswer(q, { topic: 'x' }, {}, today)).toBeNull();
    expect(validateAnswer(q, { years: 99 }, {}, today)).toBe('outOfRange');
  });

  it('"I do not know" leads to the interests test instead of the specialty list', () => {
    const a: Answers = { ...bachelor(), field_certainty: 'unknown' };
    expect(ids(a)).toContain('riasec');
    expect(ids(a)).not.toContain('fields');
  });

  it('the scholarship question is asked whatever the budget', () => {
    expect(ids({ ...bachelor(), budget: { currency: 'USD', tuition: 'free', living: 'to5' } })).toContain('scholarship');
    expect(ids(bachelor())).toContain('scholarship');
  });

  it('a typical path stays within the promised size', () => {
    const a = bachelor();
    expect(required(a).length).toBeLessThanOrEqual(15);
    expect(ids(a).length).toBeLessThanOrEqual(26);
    expect(visiblePages(a).length).toBeLessThanOrEqual(8);
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
  });

  it('counts done and required-left', () => {
    const p = progress(bachelor(), today);
    expect(p.requiredLeft).toBe(0);
    expect(p.done).toBe(13);
    expect(p.total).toBeGreaterThan(13);
  });
});

describe('pages', () => {
  const page = (a: Answers, id: string) => visiblePages(a).find((p) => p.id === id)!;

  it('a bachelor sees the topic pages, without the school page', () => {
    expect(visiblePages(bachelor()).map((p) => p.id)).toEqual(['goal', 'direction', 'studies', 'languages', 'extra', 'money', 'institution', 'final']);
    expect(page(bachelor(), 'goal').questions.map((q) => q.id)).toEqual(['level', 'situation', 'start', 'format']);
  });

  it('a page shows only the questions shown to this person, and changes with the answers on it', () => {
    expect(page({ level: 'bachelor' }, 'goal').questions.map((q) => q.id)).toContain('situation');
    expect(page({ level: 'master' }, 'goal').questions.map((q) => q.id)).not.toContain('situation');
    expect(page({ level: 'bachelor', field_certainty: 'unknown' }, 'direction').questions.map((q) => q.id)).toEqual(['field_certainty', 'riasec']);
  });

  it('a page with a required answer missing has an error for that question only; empty optional ones are fine', () => {
    const a: Answers = { level: 'bachelor', start: '2027-09' };
    expect(pageErrors(page(a, 'goal'), a, today)).toEqual({ format: 'required' });
    expect(pageErrors(page(bachelor(), 'goal'), bachelor(), today)).toEqual({});
  });

  it('an optional answer that is given must still be valid', () => {
    const a: Answers = { ...bachelor(), situation: 'nonsense' };
    expect(pageErrors(page(a, 'goal'), a, today)).toEqual({ situation: 'invalid' });
  });

  it('sending a page marks its empty optional questions as skipped, and an answered one as no longer skipped', () => {
    const sent = submitPage(page(bachelor(), 'goal'), bachelor());
    expect(sent._skipped).toEqual(['situation']);
    const again = submitPage(page(sent, 'goal'), { ...sent, situation: 'first' });
    expect(again._skipped).toBeUndefined();
    expect(again.situation).toBe('first');
  });

  it('"Next" goes to the following page; the last page finishes when nothing required is missing', () => {
    expect(pageAfter(bachelor(), 'goal', today)).toEqual({ kind: 'go', id: 'direction' });
    expect(pageAfter(bachelor(), 'final', today)).toEqual({ kind: 'finish' });
  });

  it('on the last page with a required answer missing elsewhere it goes back to that page', () => {
    const open = { ...bachelor() };
    delete open.grade;
    expect(pageAfter(open, 'final', today)).toEqual({ kind: 'go', id: 'studies' });
  });

  it('a continued survey opens on the page of the first open question', () => {
    expect(firstOpenPage({}, today)).toBe('goal');
    const a: Answers = { ...bachelor(), _skipped: ['situation', 'subjects', 'exams', 'olympiads', 'entrance', 'scholarship', 'rating', 'ownership', 'extras', 'recognition', 'climate'] };
    delete a.languages;
    expect(firstOpenPage(a, today)).toBe('languages');
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
    expect(validateAnswer(q('entrance'), ['interview', 'entrance_exams'], {})).toBeNull();
    expect(validateAnswer(q('entrance'), ['interview', 'interview'], {})).toBe('invalid');
    expect(validateAnswer(q('entrance'), ['nonsense'], {})).toBe('invalid');
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

  it('budget: dollars or euros and a range for tuition and for living', () => {
    expect(validateAnswer(q('budget'), { currency: 'EUR', tuition: 'to10', living: 'to5' }, {})).toBeNull();
    expect(validateAnswer(q('budget'), { currency: 'USD', tuition: 'free', living: 'over15' }, {})).toBeNull();
    expect(validateAnswer(q('budget'), { currency: 'EUR', tuition: 'to10' }, {})).toBe('required');
    expect(validateAnswer(q('budget'), { currency: 'GEL', tuition: 'to10', living: 'to5' }, {})).toBe('invalid');
    expect(validateAnswer(q('budget'), { currency: 'EUR', tuition: 'to7', living: 'to5' }, {})).toBe('invalid');
    // the numbers of an older survey are asked again as ranges
    expect(validateAnswer(q('budget'), { currency: 'EUR', tuition: 5000, living: 7000 }, {})).toBe('invalid');
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
