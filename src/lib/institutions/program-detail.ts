import { safeHttpUrl } from '../safe-url';
import type { LocalizedText } from './types';

// Parsing of programme rows (no server code here: the compare page uses it in the browser too).

export interface Money {
  amount: number | null;
  currency: string;
}
export interface TuitionLine extends Money {
  period: 'year' | 'semester' | 'credit' | 'total';
  appliesTo: 'domestic' | 'international' | 'eu' | 'all';
}
export interface ProgramDetail {
  id: string;
  names: LocalizedText;
  level: string;
  iscedF: string | null;
  languages: string[];
  durationYears: number | null;
  intakes: string[];
  tuition: TuitionLine[];
  free: boolean;
  minScores: { exam: string; min: number }[];
  documents: string[];
  entrance: string | null;
  deadlines: { intake: string; appliesTo: string; date: string | null }[];
  applicationFee: Money | null;
  applicationUrl: string | null;
  academicYear: string | null;
}
export type Row = Record<string, unknown>;
export const str = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null);
export const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v !== '' && Number.isFinite(Number(v)) ? Number(v) : null);
export const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export const rec = (v: unknown): Row => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Row) : {});
export const texts = (v: unknown): LocalizedText => Object.fromEntries(Object.entries(rec(v)).filter(([, x]) => typeof x === 'string')) as LocalizedText;
export const oneOf = <T extends string>(v: unknown, allowed: readonly T[]): T | null => (typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : null);
const money = (v: unknown): Money | null => {
  const x = rec(v);
  return str(x.currency) ? { amount: num(x.amount), currency: x.currency as string } : null;
};

export function toProgramDetail(r: Row): ProgramDetail | null {
  if (!str(r.id)) return null;
  const req = rec(r.requirements);
  const tuition: TuitionLine[] = arr(r.tuition).flatMap((t) => {
    const x = rec(t);
    const period = oneOf(x.period, ['year', 'semester', 'credit', 'total'] as const);
    const money_ = money(x);
    return period && money_ ? [{ ...money_, period, appliesTo: oneOf(x.applies_to, ['domestic', 'international', 'eu', 'all'] as const) ?? 'all' }] : [];
  });
  return {
    id: r.id as string,
    names: texts(r.names),
    level: str(r.level) ?? 'bachelor',
    iscedF: str(r.isced_f),
    languages: arr(r.languages).filter((l): l is string => typeof l === 'string'),
    durationYears: num(r.duration_years),
    intakes: arr(r.intakes).filter((m): m is string => typeof m === 'string'),
    tuition,
    free: r.free === true,
    minScores: arr(req.min_scores).flatMap((s) => {
      const x = rec(s);
      return str(x.exam) && num(x.min) !== null ? [{ exam: x.exam as string, min: num(x.min) as number }] : [];
    }),
    documents: arr(req.documents).filter((d): d is string => typeof d === 'string'),
    entrance: typeof req.entrance_exams === 'string' ? req.entrance_exams : null,
    deadlines: arr(r.deadlines).flatMap((d) => {
      const x = rec(d);
      return str(x.intake) ? [{ intake: x.intake as string, appliesTo: str(x.applies_to) ?? 'all', date: str(x.date) }] : [];
    }),
    applicationFee: money(r.application_fee),
    applicationUrl: safeHttpUrl(r.application_url),
    academicYear: str(r.academic_year),
  };
}
