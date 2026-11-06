import { visibleDeadlines } from '../institutions/deadlines';
import type { TuitionLine } from '../institutions/program-detail';
import { tuitionRange, type TuitionRange } from './tuition-range';

// The facts for the question-and-answer block and the price table of an institution page. Everything comes from the programmes the
// page has already read (no extra database reads); a fact that is not known is left out, and the page then asks no such question.

export interface ProgramFacts {
  level: string;
  tuition: TuitionLine[];
  durationYears: number | null;
  free: boolean;
  languages: string[];
  minScores: { exam: string; min: number }[];
  deadlines: { intake?: string | null; appliesTo?: string | null; date: string | null }[];
}

export interface ScoreSpan {
  exam: string;
  min: number;
  max: number;
}

export interface InstitutionFacts {
  programCount: number;
  /** the levels the institution teaches, in the order given */
  levels: string[];
  tuition: TuitionRange | null;
  freeCount: number;
  /** upcoming application dates (ISO), earliest first, at most three */
  deadlines: string[];
  /** the languages of teaching, the most used first, at most six */
  languages: string[];
  /** for each exam the lowest and the highest minimum over the programmes, the most asked exams first, at most four */
  scores: ScoreSpan[];
}

const MAX_DEADLINES = 3;
const MAX_LANGUAGES = 6;
const MAX_EXAMS = 4;

/** The values of a list, the most frequent first (equal counts keep the order of appearance). */
function byFrequency<T>(values: readonly T[]): T[] {
  const counts = new Map<T, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
}

/** `today` is an ISO date ("2026-11-07"): a date before it is not offered as a deadline. */
export function institutionFacts(programs: readonly ProgramFacts[], levelOrder: readonly string[], today: string): InstitutionFacts {
  const dates = new Set<string>();
  for (const p of programs) for (const d of visibleDeadlines(p.deadlines)) if (d.date && d.date >= today) dates.add(d.date);

  const spans = new Map<string, { min: number; max: number; programs: number }>();
  for (const p of programs) {
    for (const s of p.minScores) {
      const span = spans.get(s.exam);
      spans.set(s.exam, span ? { min: Math.min(span.min, s.min), max: Math.max(span.max, s.min), programs: span.programs + 1 } : { min: s.min, max: s.min, programs: 1 });
    }
  }

  return {
    programCount: programs.length,
    levels: levelOrder.filter((l) => programs.some((p) => p.level === l)),
    tuition: tuitionRange(programs),
    freeCount: programs.filter((p) => p.free).length,
    deadlines: [...dates].sort().slice(0, MAX_DEADLINES),
    languages: byFrequency(programs.flatMap((p) => p.languages)).slice(0, MAX_LANGUAGES),
    scores: [...spans.entries()]
      .sort((a, b) => b[1].programs - a[1].programs)
      .slice(0, MAX_EXAMS)
      .map(([exam, s]) => ({ exam, min: s.min, max: s.max })),
  };
}

export interface LevelRow {
  level: string;
  programs: number;
  /** the yearly price for students from abroad; null when no programme of the level has a known price */
  tuition: TuitionRange | null;
  /** every programme of the level is free */
  free: boolean;
}

/** One row per level for the price table. */
export function levelRows(programs: readonly ProgramFacts[], levelOrder: readonly string[]): LevelRow[] {
  return levelOrder.flatMap((level) => {
    const items = programs.filter((p) => p.level === level);
    return items.length === 0 ? [] : [{ level, programs: items.length, tuition: tuitionRange(items), free: items.every((p) => p.free) }];
  });
}

/** The table is shown only when it tells something: at least one level has a price or is free. */
export function hasPrices(rows: readonly LevelRow[]): boolean {
  return rows.some((r) => r.tuition !== null || r.free);
}
