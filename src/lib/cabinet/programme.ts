import { safeHttpUrl } from '../safe-url';

// What an institution's representative types in the cabinet, turned into the database format.
// Pure functions: the form checks the values with them and they are covered by tests.

export const PERIODS = ['year', 'semester', 'total'] as const;
export type CabinetPeriod = (typeof PERIODS)[number];
export const CABINET_LEVELS = ['school', 'college', 'foundation', 'bachelor', 'master', 'phd', 'language_course'] as const;

export interface TuitionLine {
  amount: number | null;
  currency: string;
  period: string;
  applies_to: string;
}
export interface Deadline {
  intake: string;
  applies_to: string;
  date: string | null;
}

export interface ProgrammeForm {
  nameEn: string;
  nameOriginal: string;
  level: string;
  languages: string;
  durationYears: string;
  free: boolean;
  amount: string;
  currency: string;
  period: CabinetPeriod;
  deadline: string;
  applicationUrl: string;
}

export type ProgrammeError = 'name' | 'level' | 'languages' | 'duration' | 'amount' | 'currency' | 'deadline' | 'url';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** "en, ru ; ka" -> ["en", "ru", "ka"]; null when something is not a two-letter language code. */
export function parseLanguages(text: string): string[] | null {
  const list = text.split(/[,;\s]+/).map((l) => l.trim().toLowerCase()).filter(Boolean);
  return list.every((l) => /^[a-z]{2}$/.test(l)) ? [...new Set(list)] : null;
}

/** The international tuition line is replaced (or added); lines for other groups of applicants stay as they were. */
export function withInternationalTuition(existing: TuitionLine[], amount: number | null, currency: string, period: string): TuitionLine[] {
  const others = existing.filter((t) => t.applies_to !== 'international' && !(t.applies_to === 'all' && amount !== null));
  return amount === null ? others : [...others, { amount, currency, period, applies_to: 'international' }];
}

export function withInternationalDeadline(existing: Deadline[], date: string): Deadline[] {
  const others = existing.filter((d) => d.applies_to !== 'international');
  return DATE.test(date) ? [...others, { intake: date.slice(0, 7), applies_to: 'international', date }] : others;
}

export interface ProgrammeRow {
  names: Record<string, string>;
  level: string;
  languages: string[];
  duration_years: number | null;
  free: boolean;
  tuition: TuitionLine[];
  deadlines: Deadline[];
  application_url: string | null;
}

/** Checks the form and builds the row; returns the list of problems when something is wrong. */
export function buildProgrammeRow(
  form: ProgrammeForm,
  existing: { names?: Record<string, string>; tuition?: TuitionLine[]; deadlines?: Deadline[] } = {},
): { ok: true; row: ProgrammeRow } | { ok: false; errors: ProgrammeError[] } {
  const errors: ProgrammeError[] = [];
  const nameEn = form.nameEn.trim();
  const nameOriginal = form.nameOriginal.trim();
  if (!nameEn && !nameOriginal) errors.push('name');
  if (!(CABINET_LEVELS as readonly string[]).includes(form.level)) errors.push('level');
  const languages = parseLanguages(form.languages);
  if (!languages) errors.push('languages');
  const duration = form.durationYears.trim() === '' ? null : Number(form.durationYears.replace(',', '.'));
  if (duration !== null && !(Number.isFinite(duration) && duration > 0 && duration <= 12)) errors.push('duration');
  const amount = form.free || form.amount.trim() === '' ? null : Number(form.amount.replace(/\s/g, '').replace(',', '.'));
  if (amount !== null && !(Number.isFinite(amount) && amount >= 0 && amount < 10_000_000)) errors.push('amount');
  if (amount !== null && !/^[A-Z]{3}$/.test(form.currency)) errors.push('currency');
  if (form.deadline !== '' && !DATE.test(form.deadline)) errors.push('deadline');
  const url = form.applicationUrl.trim() === '' ? null : safeHttpUrl(form.applicationUrl.trim());
  if (form.applicationUrl.trim() !== '' && !url) errors.push('url');
  if (errors.length > 0 || !languages) return { ok: false, errors };
  return {
    ok: true,
    row: {
      names: { ...(existing.names ?? {}), ...(nameOriginal ? { original: nameOriginal } : {}), ...(nameEn ? { en: nameEn } : {}) },
      level: form.level,
      languages,
      duration_years: duration,
      free: form.free,
      tuition: form.free ? [] : withInternationalTuition(existing.tuition ?? [], amount, form.currency, form.period),
      deadlines: withInternationalDeadline(existing.deadlines ?? [], form.deadline),
      application_url: url,
    },
  };
}
