// The survey engine: pure functions over the config (config.ts) and the answers.
// No browser or database code here, so everything can be tested.
import {
  EDUCATION_LEVELS,
  PRIORITIES_COUNT,
  PRIORITY_OPTIONS,
  QUESTIONS,
  QUESTION_BY_ID,
  type Condition,
  type Question,
} from './config';
import { examInRange, gradeInRange } from './normalize';
import {
  CERTIFICATES,
  CURRENCIES,
  EXAMS,
  GRADING_SYSTEMS,
  LANGUAGE_CODES,
  OLYMPIAD_LEVELS,
  SELF_LEVELS,
  SUBJECTS,
  cefrOfCertificate,
  iscedEntry,
} from './references';

/** Answers by question id; `_skipped` lists optional questions the person chose to skip. */
export type Answers = { [questionId: string]: unknown } & { _skipped?: string[] };

// ------------------------------------------------------------------ which questions are shown
function conditionHolds(cond: Condition, answers: Answers): boolean {
  const value = answers[cond.q];
  if (value === undefined || value === null) return false;
  if (cond.in && !(typeof value === 'string' && cond.in.includes(value))) return false;
  if (cond.notIn && !(typeof value === 'string' && !cond.notIn.includes(value))) return false;
  if (cond.includes && !(Array.isArray(value) && value.includes(cond.includes))) return false;
  return true;
}

export function isVisible(question: Question, answers: Answers): boolean {
  const { showIf } = question;
  if (!showIf) return true;
  return (Array.isArray(showIf) ? showIf : [showIf]).every((c) => conditionHolds(c, answers));
}

/** The questions this person is asked, in order. Changes as the answers change. */
export function visibleQuestions(answers: Answers): Question[] {
  return QUESTIONS.filter((q) => isVisible(q, answers));
}

// ------------------------------------------------------------------ answers
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isStr = (v: unknown): v is string => typeof v === 'string';

/** "2026-09" and "2027-02": the next intakes (spring and autumn) for the next three years. */
export function intakeOptions(today: Date = new Date()): string[] {
  const out: string[] = [];
  for (let y = today.getFullYear(); y <= today.getFullYear() + 3; y++) {
    for (const m of ['02', '09']) {
      const candidate = `${y}-${m}`;
      const now = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
      if (candidate >= now) out.push(candidate);
    }
  }
  return out.slice(0, 6);
}

/** The error code of an invalid answer (a key of Survey.errors.*), or null when it is fine. */
export function validateAnswer(q: Question, value: unknown, answers: Answers, today: Date = new Date()): string | null {
  if (value === undefined || value === null || value === '') return 'required';
  switch (q.type) {
    case 'single':
      return isStr(value) && q.options?.includes(value) ? null : 'invalid';
    case 'multi': {
      if (!Array.isArray(value) || !value.every((v) => isStr(v) && q.options?.includes(v))) return 'invalid';
      if (new Set(value).size !== value.length) return 'invalid';
      if (q.max && value.length > q.max) return 'tooMany';
      return value.length === 0 && q.required ? 'required' : null;
    }
    case 'number':
      return isNum(value) && value >= (q.min ?? 0) && value <= (q.max ?? 1e9) ? null : 'outOfRange';
    case 'text':
      return isStr(value) && value.trim().length > 0 && value.length <= 500 ? null : 'invalid';
    case 'intake':
      return isStr(value) && intakeOptions(today).includes(value) ? null : 'invalid';
    case 'specialty': {
      if (!Array.isArray(value) || value.length === 0) return 'required';
      if (!value.every((c) => isStr(c) && iscedEntry(c))) return 'invalid';
      if (new Set(value).size !== value.length) return 'invalid';
      return q.max && value.length > q.max ? 'tooMany' : null;
    }
    case 'education': {
      if (!record(value)) return 'invalid';
      const year = value.year;
      const levelOk = isStr(value.level) && (EDUCATION_LEVELS as readonly string[]).includes(value.level);
      return levelOk && isNum(year) && Number.isInteger(year) && year >= 1980 && year <= today.getFullYear() + 12
        ? null
        : 'invalid';
    }
    case 'grade': {
      if (!record(value)) return 'invalid';
      if (value.none === true) return null; // "I have no grades yet"
      return isStr(value.system) && GRADING_SYSTEMS.some((s) => s.id === value.system) &&
        isNum(value.value) && gradeInRange(value.system, value.value)
        ? null
        : 'outOfRange';
    }
    case 'subjects': {
      if (!Array.isArray(value)) return 'invalid';
      if (q.max && value.length > q.max) return 'tooMany';
      const system = record(answers.grade) && isStr(answers.grade.system) ? answers.grade.system : 'hundred';
      for (const row of value) {
        if (!record(row) || !SUBJECTS.some((s) => s.id === row.subject)) return 'invalid';
        if (!isNum(row.grade) || !gradeInRange(system, row.grade)) return 'outOfRange';
      }
      return new Set(value.map((r) => (r as { subject: string }).subject)).size === value.length ? null : 'invalid';
    }
    case 'exams': {
      if (!Array.isArray(value)) return 'invalid';
      if (q.max && value.length > q.max) return 'tooMany';
      for (const row of value) {
        if (!record(row) || !EXAMS.some((e) => e.id === row.exam)) return 'invalid';
        if (!isNum(row.score) || !isStr(row.exam) || !examInRange(row.exam, row.score)) return 'outOfRange';
      }
      return null;
    }
    case 'languages': {
      if (!Array.isArray(value) || value.length === 0) return 'required';
      if (q.max && value.length > q.max) return 'tooMany';
      const seen = new Set<string>();
      for (const row of value) {
        if (!record(row) || !isStr(row.lang) || !LANGUAGE_CODES.includes(row.lang)) return 'invalid';
        if (seen.has(row.lang)) return 'invalid';
        seen.add(row.lang);
        if (!isStr(row.level) || !(SELF_LEVELS as readonly string[]).includes(row.level)) return 'invalid';
        if (row.cert !== undefined && row.cert !== null) {
          const cert = row.cert;
          if (!record(cert) || !isStr(cert.id) || !CERTIFICATES.some((c) => c.id === cert.id)) return 'invalid';
          if (cefrOfCertificate(cert.id, cert.value as string | number) === null) return 'outOfRange';
        }
      }
      return null;
    }
    case 'studyLanguages': {
      if (!record(value) || typeof value.prepYear !== 'boolean') return 'invalid';
      const langs = value.languages;
      if (!Array.isArray(langs) || langs.length === 0) return 'required';
      return langs.every((l) => isStr(l) && LANGUAGE_CODES.includes(l)) && new Set(langs).size === langs.length
        ? null
        : 'invalid';
    }
    case 'budget': {
      if (!record(value) || !isStr(value.currency) || !(CURRENCIES as readonly string[]).includes(value.currency)) {
        return 'invalid';
      }
      const money = (v: unknown) => isNum(v) && v >= 0 && v <= 1e9;
      if (!money(value.living)) return 'invalid';
      const needsTuition = answers.funding !== 'free';
      return needsTuition && !money(value.tuition) ? 'invalid' : null;
    }
    case 'olympiads': {
      if (!Array.isArray(value)) return 'invalid';
      if (q.max && value.length > q.max) return 'tooMany';
      for (const row of value) {
        if (!record(row) || !SUBJECTS.some((s) => s.id === row.subject)) return 'invalid';
        if (!isStr(row.level) || !(OLYMPIAD_LEVELS as readonly string[]).includes(row.level)) return 'invalid';
        if (!isNum(row.place) || !Number.isInteger(row.place) || row.place < 1 || row.place > 1000) return 'outOfRange';
      }
      return null;
    }
    case 'riasec': {
      if (!record(value) || !Array.isArray(value.answers) || value.answers.length !== 12) return 'invalid';
      if (!value.answers.every((a) => isNum(a) && a >= 1 && a <= 5)) return 'invalid';
      const accepted = value.accepted;
      if (!Array.isArray(accepted) || accepted.length === 0) return 'required';
      return accepted.length <= 3 && accepted.every((c) => isStr(c) && iscedEntry(c)) ? null : 'invalid';
    }
    case 'priorities': {
      if (!Array.isArray(value) || value.length !== PRIORITIES_COUNT) return 'priorities';
      const ok = value.every((v) => isStr(v) && (PRIORITY_OPTIONS as readonly string[]).includes(v));
      return ok && new Set(value).size === value.length ? null : 'priorities';
    }
  }
}

export function isSkipped(q: Question, answers: Answers): boolean {
  return answers._skipped?.includes(q.id) ?? false;
}

/** Answered (validly) or, for an optional question, skipped on purpose. */
export function isDone(q: Question, answers: Answers, today?: Date): boolean {
  if (!q.required && isSkipped(q, answers)) return true;
  return validateAnswer(q, answers[q.id], answers, today) === null;
}

/** The first shown question that is not done yet, or null when everything is done. */
export function nextQuestion(answers: Answers, today?: Date): Question | null {
  return visibleQuestions(answers).find((q) => !isDone(q, answers, today)) ?? null;
}

/** Done = every shown required question has a valid answer. Optional ones may be left unanswered. */
export function isComplete(answers: Answers, today?: Date): boolean {
  return visibleQuestions(answers).every((q) => !q.required || validateAnswer(q, answers[q.id], answers, today) === null);
}

export interface Progress {
  done: number;
  total: number;
  requiredLeft: number;
}
export function progress(answers: Answers, today?: Date): Progress {
  const shown = visibleQuestions(answers);
  const done = shown.filter((q) => isDone(q, answers, today)).length;
  return {
    done,
    total: shown.length,
    requiredLeft: shown.filter((q) => q.required && !isDone(q, answers, today)).length,
  };
}

/** Marks every shown, still unanswered optional question as skipped ("skip all the rest"). */
export function skipAllOptional(answers: Answers, today?: Date): Answers {
  const skipped = new Set(answers._skipped ?? []);
  for (const q of visibleQuestions(answers)) {
    if (!q.required && !isDone(q, answers, today)) skipped.add(q.id);
  }
  return { ...answers, _skipped: [...skipped] };
}

/**
 * Removes answers to questions that are no longer shown (the person changed an earlier answer,
 * e.g. level), so they cannot leak into the result.
 */
export function pruneAnswers(answers: Answers): Answers {
  const shown = new Set(visibleQuestions(answers).map((q) => q.id));
  const out: Answers = {};
  for (const [id, value] of Object.entries(answers)) {
    if (id === '_skipped') continue;
    if (shown.has(id)) out[id] = value;
  }
  const skipped = (answers._skipped ?? []).filter((id) => shown.has(id));
  if (skipped.length > 0) out._skipped = skipped;
  return out;
}

/** The specialties the person wants: chosen directly or accepted after the interests test. */
export function chosenFields(answers: Answers): string[] {
  const direct = answers.fields;
  if (Array.isArray(direct)) return direct.filter(isStr);
  const test = answers.riasec;
  if (record(test) && Array.isArray(test.accepted)) return test.accepted.filter(isStr);
  return [];
}

export { QUESTIONS, QUESTION_BY_ID };
