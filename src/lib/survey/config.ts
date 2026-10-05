// The survey is described by data (SPEC.md section 10): to add a question, add an entry here and
// its texts under Survey.q.<id> in messages/*.json. The engine (engine.ts) does the rest.
//
// Bump SURVEY_VERSION whenever a question is added, removed or changes meaning; every attempt
// stores the version it was answered with.
export const SURVEY_VERSION = 1;

export type QuestionType =
  | 'single'
  | 'multi'
  | 'number'
  | 'text'
  | 'intake'
  | 'specialty'
  | 'education'
  | 'grade'
  | 'subjects'
  | 'exams'
  | 'languages'
  | 'studyLanguages'
  | 'budget'
  | 'olympiads'
  | 'riasec'
  | 'priorities';

/** What the answer is used for when matching (stage 5): a hard filter, a score component, or just information. */
export type Purpose = 'filter' | 'score' | 'info';

export type Block = 'goal' | 'direction' | 'school' | 'results' | 'money' | 'institution' | 'life' | 'final';

/** A condition on an earlier answer. A list of conditions means "all of them". */
export interface Condition {
  q: string;
  in?: string[]; // the (single) answer is one of these
  notIn?: string[]; // the (single) answer is given and is none of these
  includes?: string; // a multi-choice answer contains this
}

export interface Question {
  id: string;
  block: Block;
  type: QuestionType;
  required: boolean;
  purpose: Purpose;
  options?: readonly string[]; // for single / multi: the values; labels are Survey.q.<id>.options.<value>
  max?: number; // multi / specialty: how many may be chosen
  min?: number; // number
  showIf?: Condition | Condition[];
}

const HIGHER = ['college', 'foundation', 'bachelor', 'master', 'phd'];
const NOT_LANG_COURSE: Condition = { q: 'level', notIn: ['language_course'] };

export const QUESTIONS: readonly Question[] = [
  // A. Goal
  { id: 'level', block: 'goal', type: 'single', required: true, purpose: 'filter',
    options: ['school', 'college', 'foundation', 'bachelor', 'master', 'phd', 'language_course'] },
  { id: 'situation', block: 'goal', type: 'single', required: false, purpose: 'info',
    options: ['first', 'transfer', 'second_degree'], showIf: { q: 'level', in: ['college', 'bachelor'] } },
  { id: 'start', block: 'goal', type: 'intake', required: true, purpose: 'filter' },
  { id: 'format', block: 'goal', type: 'single', required: true, purpose: 'filter',
    options: ['on_campus', 'online', 'blended', 'any'] },

  // B. Direction
  { id: 'field_certainty', block: 'direction', type: 'single', required: true, purpose: 'info',
    options: ['sure', 'few', 'unknown'], showIf: { q: 'level', in: HIGHER } },
  { id: 'fields', block: 'direction', type: 'specialty', required: true, purpose: 'score', max: 3,
    showIf: { q: 'field_certainty', in: ['sure', 'few'] } },
  { id: 'riasec', block: 'direction', type: 'riasec', required: true, purpose: 'score',
    showIf: { q: 'field_certainty', in: ['unknown'] } },
  { id: 'diploma_field', block: 'direction', type: 'specialty', required: false, purpose: 'info', max: 1,
    showIf: { q: 'level', in: ['master', 'phd'] } },

  // G. Schools only
  { id: 'school_profile', block: 'school', type: 'single', required: true, purpose: 'score',
    options: ['physmath', 'chembio', 'humanities', 'socioeconomic', 'linguistic', 'arts', 'ib', 'alevel', 'general', 'other'],
    showIf: { q: 'level', in: ['school'] } },
  { id: 'school_grade', block: 'school', type: 'number', required: true, purpose: 'filter', min: 1, max: 12,
    showIf: { q: 'level', in: ['school'] } },
  { id: 'school_program', block: 'school', type: 'single', required: true, purpose: 'filter',
    options: ['national', 'ib', 'alevel', 'american'], showIf: { q: 'level', in: ['school'] } },
  { id: 'school_boarding', block: 'school', type: 'single', required: false, purpose: 'filter',
    options: ['boarding', 'family', 'any'], showIf: { q: 'level', in: ['school'] } },
  { id: 'school_coed', block: 'school', type: 'single', required: false, purpose: 'filter',
    options: ['coed', 'single_sex', 'any'], showIf: { q: 'level', in: ['school'] } },
  // H. Colleges only
  { id: 'profession', block: 'school', type: 'text', required: false, purpose: 'info',
    showIf: { q: 'level', in: ['college'] } },
  { id: 'college_to_uni', block: 'school', type: 'single', required: false, purpose: 'info',
    options: ['yes', 'no', 'maybe'], showIf: { q: 'level', in: ['college'] } },

  // C. Studies and results
  { id: 'education', block: 'results', type: 'education', required: true, purpose: 'info', showIf: NOT_LANG_COURSE },
  { id: 'grade', block: 'results', type: 'grade', required: true, purpose: 'score', showIf: NOT_LANG_COURSE },
  { id: 'subjects', block: 'results', type: 'subjects', required: false, purpose: 'score', max: 5,
    showIf: { q: 'level', in: ['school', 'college', 'foundation', 'bachelor'] } },
  { id: 'exams', block: 'results', type: 'exams', required: false, purpose: 'score', max: 6, showIf: NOT_LANG_COURSE },
  { id: 'languages', block: 'results', type: 'languages', required: true, purpose: 'filter', max: 8 },
  { id: 'study_languages', block: 'results', type: 'studyLanguages', required: true, purpose: 'filter' },
  { id: 'olympiads', block: 'results', type: 'olympiads', required: false, purpose: 'score', max: 5,
    showIf: { q: 'level', in: ['school', 'college', 'bachelor'] } },
  { id: 'achievements', block: 'results', type: 'multi', required: false, purpose: 'score',
    options: ['projects', 'publications', 'sport', 'creative', 'volunteering'], showIf: NOT_LANG_COURSE },
  { id: 'work_years', block: 'results', type: 'number', required: false, purpose: 'info', min: 0, max: 60,
    showIf: { q: 'level', in: ['master', 'phd'] } },
  { id: 'research_topic', block: 'results', type: 'text', required: false, purpose: 'info',
    showIf: { q: 'level', in: ['master', 'phd'] } },
  { id: 'entrance', block: 'results', type: 'multi', required: false, purpose: 'filter',
    options: ['entrance_exams', 'interview', 'creative_contest'], showIf: NOT_LANG_COURSE },

  // D. Money
  { id: 'funding', block: 'money', type: 'single', required: true, purpose: 'filter',
    options: ['free', 'paid', 'both'] },
  { id: 'budget', block: 'money', type: 'budget', required: true, purpose: 'filter' },
  { id: 'scholarship', block: 'money', type: 'single', required: false, purpose: 'score',
    options: ['yes', 'no', 'maybe'], showIf: { q: 'funding', notIn: ['free'] } },
  { id: 'loan', block: 'money', type: 'single', required: false, purpose: 'info',
    options: ['yes', 'no'], showIf: { q: 'funding', notIn: ['free'] } },

  // E. Institution
  { id: 'rating', block: 'institution', type: 'single', required: false, purpose: 'score',
    options: ['top_world', 'top_country', 'any'], showIf: { q: 'level', in: HIGHER } },
  { id: 'ownership', block: 'institution', type: 'single', required: false, purpose: 'score',
    options: ['public', 'private', 'any'], showIf: NOT_LANG_COURSE },
  { id: 'size', block: 'institution', type: 'single', required: false, purpose: 'score',
    options: ['large', 'small', 'any'], showIf: NOT_LANG_COURSE },
  { id: 'strategy', block: 'institution', type: 'single', required: true, purpose: 'score',
    options: ['safe', 'balanced', 'ambitious'], showIf: NOT_LANG_COURSE },
  { id: 'extras', block: 'institution', type: 'multi', required: false, purpose: 'score',
    options: ['internship', 'double_degree', 'exchange'], showIf: { q: 'level', in: ['bachelor', 'master', 'phd'] } },
  { id: 'recognition', block: 'institution', type: 'single', required: false, purpose: 'score',
    options: ['yes', 'no', 'any'], showIf: NOT_LANG_COURSE },

  // F. Life
  { id: 'city_size', block: 'life', type: 'single', required: false, purpose: 'score',
    options: ['megapolis', 'medium', 'small_student', 'any'] },
  { id: 'climate', block: 'life', type: 'single', required: false, purpose: 'score',
    options: ['warm', 'temperate', 'cold', 'any'] },
  { id: 'dorm', block: 'life', type: 'single', required: true, purpose: 'score', options: ['yes', 'no', 'any'] },
  { id: 'work_during', block: 'life', type: 'single', required: false, purpose: 'score',
    options: ['yes', 'no', 'maybe'], showIf: { q: 'level', notIn: ['school', 'language_course'] } },
  { id: 'after', block: 'life', type: 'single', required: false, purpose: 'score',
    options: ['stay', 'return', 'unknown'], showIf: { q: 'level', in: ['college', 'bachelor', 'master', 'phd'] } },
  { id: 'family', block: 'life', type: 'multi', required: false, purpose: 'info',
    options: ['partner', 'children'], showIf: { q: 'level', in: ['bachelor', 'master', 'phd'] } },
  { id: 'accessibility', block: 'life', type: 'single', required: false, purpose: 'info',
    options: ['yes', 'no', 'prefer_not'] },

  // I. Final
  { id: 'priorities', block: 'final', type: 'priorities', required: true, purpose: 'score' },
];

/** The six things a person can mark as most important (question "priorities"). */
export const PRIORITY_OPTIONS = ['price', 'prestige', 'location', 'chances', 'field', 'career'] as const;
export const PRIORITIES_COUNT = 3;

export const EDUCATION_LEVELS = ['school_9', 'school_11', 'college', 'bachelor', 'master', 'other'] as const;

export const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));
