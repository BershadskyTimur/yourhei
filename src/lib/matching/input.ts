import { normalizeExam, normalizeGrade } from '../survey/normalize';
import { LIVING_BANDS, TUITION_BANDS } from '../survey/config';
import { chosenFields, type Answers } from '../survey/engine';
import type { SelfLevel } from '../survey/references';
import type { InstitutionType } from '../institutions/types';
import type { Level, MatchInput, StudyFormat } from './types';

const isStr = (v: unknown): v is string => typeof v === 'string';
const rec = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | null => (isStr(v) && (allowed as readonly string[]).includes(v) ? (v as T) : null);

const FORMATS = ['on_campus', 'online', 'blended'] as const;
/** The study formats the person accepts. An older survey saved one text ("any" or a single format); all three = any. */
function formatsOf(v: unknown): StudyFormat[] {
  const chosen = (isStr(v) ? [v] : arr(v)).filter((f): f is StudyFormat => isStr(f) && (FORMATS as readonly string[]).includes(f));
  return chosen.length === FORMATS.length ? [] : [...new Set(chosen)];
}

export interface ProfileFacts {
  residence: string | null;
  citizenships: string[];
  countries: string[];
  types: string[];
}

/**
 * Turns a completed survey (answers by question id) and the profile into the input of the matcher.
 * Missing or odd values become null, so one bad answer cannot break the matching.
 */
export function buildMatchInput(answers: Answers, profile: ProfileFacts): MatchInput {
  const level = (oneOf(answers.level, ['school', 'college', 'foundation', 'bachelor', 'master', 'phd', 'language_course'] as const) ?? 'bachelor') as Level;

  const gradeAnswer = rec(answers.grade);
  const grade =
    isStr(gradeAnswer.system) && typeof gradeAnswer.value === 'number'
      ? (() => {
          const normalized = normalizeGrade(gradeAnswer.system as string, gradeAnswer.value as number);
          return normalized === null ? null : { normalized, system: gradeAnswer.system as string, value: gradeAnswer.value as number };
        })()
      : null;

  const exams = arr(answers.exams).flatMap((row) => {
    const r = rec(row);
    if (!isStr(r.exam) || typeof r.score !== 'number') return [];
    const normalized = normalizeExam(r.exam, r.score);
    return normalized === null ? [] : [{ exam: r.exam, score: r.score, normalized }];
  });

  const languages = arr(answers.languages).flatMap((row) => {
    const r = rec(row);
    if (!isStr(r.lang) || !isStr(r.level)) return [];
    const cert = rec(r.cert);
    return [
      {
        lang: r.lang,
        level: r.level as SelfLevel,
        cert: isStr(cert.id) && (typeof cert.value === 'string' || typeof cert.value === 'number') ? { id: cert.id, value: cert.value } : null,
      },
    ];
  });

  const study = rec(answers.study_languages);
  const budget = rec(answers.budget);
  // The budget is a range (survey version 3): its upper end is the limit, "more than ..." has none. An older survey saved numbers.
  const money = (v: unknown, bands: readonly { id: string; max: number | null }[]) =>
    typeof v === 'number' && Number.isFinite(v) ? v : (bands.find((b) => b.id === v)?.max ?? null);
  const freeOnly = budget.tuition === 'free' || answers.funding === 'free';

  return {
    level,
    start: isStr(answers.start) ? answers.start : null,
    format: formatsOf(answers.format),
    funding: freeOnly ? 'free' : (oneOf(answers.funding, ['free', 'paid', 'both'] as const) ?? 'both'),
    budget: isStr(budget.currency) ? { currency: budget.currency, tuition: money(budget.tuition, TUITION_BANDS), living: money(budget.living, LIVING_BANDS) } : null,
    countries: profile.countries,
    types: profile.types.filter((t): t is InstitutionType => ['university', 'college', 'school', 'language_school', 'foundation', 'vocational'].includes(t)),
    citizenships: profile.citizenships,
    residence: profile.residence,
    languages,
    studyLanguages: arr(study.languages).filter(isStr),
    prepYear: study.prepYear === true,
    fields: chosenFields(answers),
    grade,
    exams,
    rating: oneOf(answers.rating, ['top_world', 'top_country', 'any'] as const),
    ownership: oneOf(answers.ownership, ['public', 'private', 'any'] as const),
    size: oneOf(answers.size, ['large', 'small', 'any'] as const),
    citySize: oneOf(answers.city_size, ['megapolis', 'medium', 'small_student', 'any'] as const),
    climate: oneOf(answers.climate, ['warm', 'temperate', 'cold', 'any'] as const),
    dorm: oneOf(answers.dorm, ['yes', 'no', 'any'] as const),
    workDuring: oneOf(answers.work_during, ['yes', 'no', 'maybe'] as const),
    after: oneOf(answers.after, ['stay', 'return', 'unknown'] as const),
    recognition: oneOf(answers.recognition, ['yes', 'no', 'any'] as const),
    extras: arr(answers.extras).filter(isStr),
    strategy: oneOf(answers.strategy, ['safe', 'balanced', 'ambitious'] as const) ?? 'balanced',
    priorities: arr(answers.priorities).filter(isStr),
  };
}
