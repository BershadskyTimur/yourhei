import { EXAMS, GRADING_SYSTEMS } from './references';

interface Scale {
  min: number;
  max: number;
  reverse?: boolean;
}

/** Maps a value on a scale to 0-100 (100 = the best possible); null if it does not fit the scale. */
function toHundred(scale: Scale, value: number): number | null {
  if (!Number.isFinite(value) || value < scale.min || value > scale.max) return null;
  const share = (value - scale.min) / (scale.max - scale.min);
  const result = (scale.reverse ? 1 - share : share) * 100;
  return Math.round(result * 10) / 10;
}

/**
 * A grade in one of the supported grading systems, converted to about 0-100.
 * The conversion is a simple straight line, so it is only approximate (the interface says so).
 */
export function normalizeGrade(systemId: string, value: number): number | null {
  const system = GRADING_SYSTEMS.find((s) => s.id === systemId);
  return system ? toHundred(system, value) : null;
}

/** An exam score, converted to about 0-100 within that exam's own scale. */
export function normalizeExam(examId: string, score: number): number | null {
  const exam = EXAMS.find((e) => e.id === examId);
  return exam ? toHundred(exam, score) : null;
}

/** Is the value inside the allowed range of the grading system / exam? */
export function gradeInRange(systemId: string, value: number): boolean {
  return normalizeGrade(systemId, value) !== null;
}
export function examInRange(examId: string, value: number): boolean {
  return normalizeExam(examId, value) !== null;
}
