import { describe, expect, it } from 'vitest';
import { normalizeExam, normalizeGrade } from './normalize';
import { canStudyIn, cefrOfCertificate, iscedPath } from './references';

describe('normalizeGrade', () => {
  it.each([
    ['five', 5, 100],
    ['five', 3, 50], // the pass mark of a 5-point scale lands in the middle
    ['five', 1, 0],
    ['ten', 10, 100],
    ['twelve', 12, 100],
    ['twenty', 10, 50],
    ['hundred', 73, 73],
    ['percent', 0, 0],
    ['gpa4', 3, 75],
    ['gpa4', 4, 100],
    ['ib', 7, 100],
    ['ib', 4, 50],
  ])('%s %s -> %s', (system, value, expected) => {
    expect(normalizeGrade(system, value)).toBe(expected);
  });

  it('treats the German scale as reversed: 1 is best', () => {
    expect(normalizeGrade('german', 1)).toBe(100);
    expect(normalizeGrade('german', 6)).toBe(0);
    expect(normalizeGrade('german', 2)!).toBeGreaterThan(normalizeGrade('german', 3)!);
  });

  it('rejects values outside the scale and unknown systems', () => {
    expect(normalizeGrade('five', 6)).toBeNull();
    expect(normalizeGrade('gpa4', -0.1)).toBeNull();
    expect(normalizeGrade('german', 0)).toBeNull();
    expect(normalizeGrade('nope', 3)).toBeNull();
    expect(normalizeGrade('five', Number.NaN)).toBeNull();
  });

  it('rounds to one decimal', () => {
    expect(normalizeGrade('twelve', 7)).toBe(54.5);
  });
});

describe('normalizeExam', () => {
  it.each([
    ['ege', 100, 100],
    ['ege', 50, 50],
    ['sat', 1600, 100],
    ['sat', 400, 0],
    ['sat', 1000, 50],
    ['ent', 70, 50],
    ['nmt', 150, 50],
    ['act', 36, 100],
    ['gaokao', 375, 50],
  ])('%s %s -> %s', (exam, score, expected) => {
    expect(normalizeExam(exam, score)).toBe(expected);
  });

  it('reverses the Abitur average mark (1.0 is best)', () => {
    expect(normalizeExam('abitur', 1)).toBe(100);
    expect(normalizeExam('abitur', 4)).toBe(0);
  });

  it('rejects scores outside the exam scale', () => {
    expect(normalizeExam('sat', 1700)).toBeNull();
    expect(normalizeExam('ege', 101)).toBeNull();
    expect(normalizeExam('unknown', 5)).toBeNull();
  });
});

describe('cefrOfCertificate', () => {
  it.each([
    ['ielts', 6.5, 'B2'],
    ['ielts', 7, 'C1'],
    ['ielts', 5, 'B1'],
    ['ielts', 8.5, 'C2'],
    ['toefl', 90, 'B2'],
    ['toefl', 100, 'C1'],
    ['goethe', 'B2', 'B2'],
    ['jlpt', 'N2', 'B2'],
    ['hsk', '5', 'B2'],
    ['topik', 4, 'B2'],
    ['dsh', '2', 'C1'],
  ] as const)('%s %s -> %s', (cert, value, expected) => {
    expect(cefrOfCertificate(cert, value)).toBe(expected);
  });
  it('returns null for impossible values and unknown certificates', () => {
    expect(cefrOfCertificate('ielts', 10)).toBeNull();
    expect(cefrOfCertificate('toefl', -1)).toBeNull();
    expect(cefrOfCertificate('jlpt', 'N9')).toBeNull();
    expect(cefrOfCertificate('nope', 1)).toBeNull();
  });
});

describe('language helpers', () => {
  it('a person can study in a language from B2 up', () => {
    expect(canStudyIn('b1')).toBe(false);
    expect(canStudyIn('b2')).toBe(true);
    expect(canStudyIn('native')).toBe(true);
  });
  it('builds the ISCED-F path from a detailed code', () => {
    expect(iscedPath('0613')).toEqual(['06', '061', '0613']);
    expect(iscedPath('06')).toEqual(['06']);
  });
});
