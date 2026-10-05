import { normalizeExam, normalizeGrade } from '../survey/normalize';
import {
  CERTIFICATES,
  EXAMS,
  SELF_LEVELS,
  cefrOfCertificate,
  cefrRank,
  type Cefr,
} from '../survey/references';
import type { MatchInput, MatchProgram, Note } from './types';

/** How far below a requirement still counts as "slightly below" (an ambitious choice). */
export const HARD_GAP = 15;
/** One CEFR level is worth this many normalised points when comparing with a requirement. */
const POINTS_PER_CEFR_LEVEL = 15;

export interface AcademicFit {
  /** one margin per requirement we could compare, in normalised points (negative = below) */
  margins: number[];
  /** the smallest margin, null when nothing could be compared */
  minMargin: number | null;
  gaps: Note[];
  /** every comparable requirement is met */
  met: boolean;
  /** far below at least one requirement: the programme is not realistic */
  hardFail: boolean;
}

/** The CEFR level the person has in a language: the best of the certificate and the self-assessment. */
function userCefr(input: MatchInput, langs: string[], certId?: string): Cefr | null {
  let best: Cefr | null = null;
  const consider = (c: Cefr | null) => {
    if (c && (best === null || cefrRank(c) > cefrRank(best))) best = c;
  };
  for (const l of input.languages) {
    if (certId && l.cert?.id === certId) consider(cefrOfCertificate(l.cert.id, l.cert.value));
    else if (!certId && l.cert) consider(cefrOfCertificate(l.cert.id, l.cert.value));
    if (langs.includes(l.lang)) {
      const i = SELF_LEVELS.indexOf(l.level);
      consider(i >= 5 ? 'C2' : (['A1', 'A2', 'B1', 'B2', 'C1'] as const)[i] ?? null);
    }
  }
  return best;
}

/** Compares the person with the programme's requirements (grades, exams, language certificates). */
export function academicFit(program: MatchProgram, input: MatchInput): AcademicFit {
  const margins: number[] = [];
  const gaps: Note[] = [];
  const { minGpa, minScores } = program.requirements;

  if (minGpa && input.grade) {
    const required = normalizeGrade(minGpa.system, minGpa.value);
    if (required !== null) {
      const margin = input.grade.normalized - required;
      margins.push(margin);
      if (margin < 0) gaps.push({ key: 'gap.gpa', params: { need: minGpa.value, have: input.grade.value } });
    }
  }

  // Language certificates listed for a programme are alternatives ("IELTS 6.0 or TOEFL 78"):
  // the best one counts, and a gap is reported only when even the best one is not reached.
  const certOptions: { margin: number; gap: Note }[] = [];

  for (const { exam, min } of minScores) {
    const cert = CERTIFICATES.find((c) => c.id === exam);
    if (cert) {
      const needed = cefrOfCertificate(exam, min);
      const have = userCefr(input, program.languages, exam);
      if (!needed || !have) continue; // no way to compare: "no data", not a failure
      const sameScore = input.languages.find((l) => l.cert?.id === exam)?.cert?.value;
      let margin: number;
      if (cert.scoreBands && typeof sameScore === 'number') {
        margin = ((sameScore - min) / (cert.scoreBands.max - cert.scoreBands.min)) * 100;
      } else {
        margin = (cefrRank(have) - cefrRank(needed)) * POINTS_PER_CEFR_LEVEL;
      }
      certOptions.push({
        margin,
        gap: { key: 'gap.language', params: { exam: exam.toUpperCase(), need: min, have: typeof sameScore === 'number' ? sameScore : have } },
      });
      continue;
    }

    if (EXAMS.some((e) => e.id === exam)) {
      const requiredNorm = normalizeExam(exam, min);
      const taken = input.exams.find((e) => e.exam === exam);
      if (requiredNorm === null) continue;
      if (taken) {
        const margin = taken.normalized - requiredNorm;
        margins.push(margin);
        if (margin < 0) gaps.push({ key: 'gap.exam', params: { exam: exam.toUpperCase(), need: min, have: taken.score } });
      } else {
        // The exam is required but the person has no result: a gap, treated as slightly below.
        margins.push(-10);
        gaps.push({ key: 'gap.exam_missing', params: { exam: exam.toUpperCase(), need: min } });
      }
    }
  }

  if (certOptions.length > 0) {
    const best = certOptions.reduce((a, b) => (b.margin > a.margin ? b : a));
    margins.push(best.margin);
    if (best.margin < 0) gaps.push(best.gap);
  }

  const minMargin = margins.length ? Math.min(...margins) : null;
  return {
    margins,
    minMargin,
    gaps,
    met: minMargin === null || minMargin >= 0,
    hardFail: minMargin !== null && minMargin < -HARD_GAP,
  };
}

/** The academic component score: 70 on the requirement itself, 100 with a margin of 20 points or more. */
export function academicScore(fit: AcademicFit): number | null {
  if (fit.margins.length === 0) return null;
  const parts = fit.margins.map((m) => Math.max(0, Math.min(100, 70 + m * 1.5)));
  return Math.round((parts.reduce((a, b) => a + b, 0) / parts.length) * 10) / 10;
}
