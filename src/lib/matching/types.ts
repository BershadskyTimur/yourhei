// Matching (SPEC.md section 11): types shared by the whole matching module.
// Everything here is plain data, so the engine stays a set of pure, testable functions.
import type { InstitutionType } from '../institutions/types';
import type { SelfLevel } from '../survey/references';

export type Level = 'school' | 'college' | 'foundation' | 'bachelor' | 'master' | 'phd' | 'language_course';
export type StudyFormat = 'on_campus' | 'online' | 'blended';
export type Period = 'year' | 'semester' | 'credit' | 'total';
export type AppliesTo = 'domestic' | 'international' | 'eu' | 'all';

export interface Money {
  amount: number | null;
  currency: string;
}
export interface Tuition extends Money {
  period: Period;
  appliesTo: AppliesTo;
}

export interface Ranking {
  name: string;
  year: number;
  /** "801-1000" or "152"; only the best (lowest) number is used */
  position: string;
  scope: 'world' | 'country';
}

/** The institution as the matcher needs it. Missing facts are null: they are "no data", not "no". */
export interface MatchInstitution {
  id: string;
  slug: string;
  type: InstitutionType;
  country: string;
  city: Record<string, string>;
  names: Record<string, string>;
  ownership: 'public' | 'private' | null;
  size: 'large' | 'small' | null;
  citySize: 'megapolis' | 'medium' | 'small_student' | null;
  climate: 'warm' | 'temperate' | 'cold' | null;
  dormitory: boolean | null;
  /** internship, double_degree, exchange */
  features: string[];
  rankings: Ranking[];
  verifiedAt: string | null;
}

export interface Requirements {
  /** a minimum average grade in some grading system */
  minGpa: { system: string; value: number } | null;
  /** minimum exam scores, e.g. {exam: "ielts", min: 6.5} (language certificates use the survey ids) */
  minScores: { exam: string; min: number }[];
  documents: string[];
}

export interface MatchProgram {
  id: string;
  institution: MatchInstitution;
  names: Record<string, string>;
  level: Level;
  /** ISCED-F code of any depth ("06", "061", "0613") */
  iscedF: string | null;
  /** ISO 639-1 codes of the languages of instruction */
  languages: string[];
  durationYears: number | null;
  format: StudyFormat | null;
  /** months of the year when a study period starts: "02", "09" */
  intakes: string[];
  tuition: Tuition[];
  /** the programme is free of charge for everyone it applies to */
  free: boolean;
  requirements: Requirements;
  applicationFee: Money | null;
  applicationUrl: string | null;
}

/** Facts about a country that are the same for all its institutions (SPEC.md section 13). */
export interface CountryFacts {
  code: string;
  currency: string | null;
  workDuringStudy: boolean | null;
  postStudyWorkVisa: boolean | null;
  /** monthly cost of living by city */
  costOfLiving: { city: Record<string, string>; amountPerMonth: number | null; currency: string }[];
  /** the country recognises foreign diplomas (agreements), null = unknown */
  recognition: boolean | null;
}

/** Units of each currency per 1 US dollar. */
export type Rates = Record<string, number>;

export interface MatchInput {
  level: Level;
  /** "YYYY-MM" the person wants to start */
  start: string | null;
  format: StudyFormat | 'any' | null;
  funding: 'free' | 'paid' | 'both';
  budget: { currency: string; tuition: number | null; living: number | null } | null;
  /** countries the person chose (empty = no restriction) */
  countries: string[];
  types: InstitutionType[];
  citizenships: string[];
  residence: string | null;
  languages: { lang: string; level: SelfLevel; cert: { id: string; value: string | number } | null }[];
  /** languages the person is ready to study in */
  studyLanguages: string[];
  prepYear: boolean;
  /** ISCED-F codes, the first one is the most important */
  fields: string[];
  /** average grade, normalised to 0-100 */
  grade: { normalized: number; system: string; value: number } | null;
  exams: { exam: string; score: number; normalized: number }[];
  rating: 'top_world' | 'top_country' | 'any' | null;
  ownership: 'public' | 'private' | 'any' | null;
  size: 'large' | 'small' | 'any' | null;
  citySize: 'megapolis' | 'medium' | 'small_student' | 'any' | null;
  climate: 'warm' | 'temperate' | 'cold' | 'any' | null;
  dorm: 'yes' | 'no' | 'any' | null;
  workDuring: 'yes' | 'no' | 'maybe' | null;
  after: 'stay' | 'return' | 'unknown' | null;
  recognition: 'yes' | 'no' | 'any' | null;
  extras: string[];
  strategy: 'safe' | 'balanced' | 'ambitious';
  /** the three things that matter most, most important first */
  priorities: string[];
}

export type ComponentId = 'academic' | 'field' | 'prestige' | 'preferences' | 'extras' | 'life' | 'budget';

/** A reason or a gap: a template key plus the numbers to put into the text. */
export interface Note {
  key: string;
  params?: Record<string, string | number>;
}

export type Group = 'safe' | 'suitable' | 'ambitious';

export interface ComponentScore {
  id: ComponentId;
  /** 0-100, or null = no data for this programme (excluded, SPEC.md section 11) */
  score: number | null;
  weight: number;
}

export interface MatchResult {
  program: MatchProgram;
  /** 0-100 */
  score: number;
  group: Group;
  components: ComponentScore[];
  /** components without data: shown as "no data" */
  missing: ComponentId[];
  why: Note[];
  gaps: Note[];
  /** the tuition shown to the person, in their currency when it could be converted */
  tuitionShown: { amount: number; currency: string; period: Period } | null;
}

export interface MatchContext {
  countries: Record<string, CountryFacts>;
  rates: Rates;
  today?: Date;
}

export interface Matches {
  safe: MatchResult[];
  suitable: MatchResult[];
  ambitious: MatchResult[];
  /** how many programmes were checked, and how many passed the hard filters */
  checked: number;
  passed: number;
  /** how many of the checked programmes each rule removed (the first rule a programme failed) */
  rejected: Partial<Record<'level' | 'country' | 'type' | 'language' | 'format' | 'free' | 'budget' | 'intake' | 'academic', number>>;
}

/** Later (paid plan) an AI can write the explanations: it only has to implement this. */
export interface ExplanationProvider {
  explain(result: MatchResult, locale: string): Promise<string[]>;
}
