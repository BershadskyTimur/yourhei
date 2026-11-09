import { describe, expect, it } from 'vitest';
import { formatTuitionRange, shortAcademicYear, tuitionRange, tuitionYear } from './tuition-range';

describe('formatTuitionRange', () => {
  it('writes both ends, or one price when they are equal', () => {
    expect(formatTuitionRange('en', { min: 8000, max: 12000, currency: 'EUR' })).toBe('€8,000 – €12,000');
    expect(formatTuitionRange('en', { min: 8000, max: 8000, currency: 'EUR' })).toBe('€8,000');
  });
  it('an unknown currency code is written as it is', () => {
    expect(formatTuitionRange('en', { min: 5, max: 5, currency: 'not-a-code' })).toBe('5 not-a-code');
  });
});

const line = (amount: number | null, currency = 'USD', period: 'year' | 'semester' | 'total' | 'credit' = 'year', appliesTo: 'all' | 'eu' | 'international' | 'domestic' = 'all') => ({ amount, currency, period, appliesTo });

describe('tuitionRange', () => {
  it('is the cheapest and the dearest yearly price', () => {
    expect(tuitionRange([{ tuition: [line(9000)], durationYears: 4 }, { tuition: [line(15000)], durationYears: 2 }])).toEqual({ min: 9000, max: 15000, currency: 'USD' });
  });
  it('turns semesters and totals into years, and leaves out credits', () => {
    expect(tuitionRange([{ tuition: [line(3000, 'EUR', 'semester')], durationYears: 2 }, { tuition: [line(20000, 'EUR', 'total')], durationYears: 2 }, { tuition: [line(100, 'EUR', 'credit')], durationYears: 2 }])).toEqual({ min: 6000, max: 10000, currency: 'EUR' });
  });
  it('uses the prices for students from abroad, not for the EU or the country\'s own citizens', () => {
    expect(tuitionRange([{ tuition: [line(0, 'EUR', 'year', 'eu'), line(12000, 'EUR', 'year', 'international')], durationYears: 2 }])).toEqual({ min: 12000, max: 12000, currency: 'EUR' });
    expect(tuitionRange([{ tuition: [line(500, 'EUR', 'year', 'domestic')], durationYears: 2 }])).toBeNull();
  });
  it('does not mix currencies: the one most programmes use', () => {
    expect(tuitionRange([{ tuition: [line(100, 'GEL')], durationYears: 1 }, { tuition: [line(5000, 'USD')], durationYears: 1 }, { tuition: [line(7000, 'USD')], durationYears: 1 }])).toEqual({ min: 5000, max: 7000, currency: 'USD' });
  });
  it('is null when nothing is known or everything is free', () => {
    expect(tuitionRange([])).toBeNull();
    expect(tuitionRange([{ tuition: [line(0)], durationYears: 1 }, { tuition: [line(null)], durationYears: 1 }])).toBeNull();
  });
});

describe('tuitionYear', () => {
  const priced = (amount: number, academicYear: string | null, currency = 'USD') => ({ tuition: [line(amount, currency)], durationYears: 1, academicYear });
  it('is the year most priced programmes give, written short', () => {
    expect(tuitionYear([priced(1000, '2025/2026'), priced(2000, '2025/2026'), priced(3000, '2026/2027')])).toBe('2025/26');
    expect(tuitionYear([priced(1000, '2026')])).toBe('2026');
  });
  it('looks only at the programmes whose price is counted', () => {
    expect(tuitionYear([priced(100, '2024/2025', 'GEL'), priced(5000, '2026/2027'), priced(7000, '2026/2027')])).toBe('2026/27');
  });
  it('is null without a price or a year', () => {
    expect(tuitionYear([])).toBeNull();
    expect(tuitionYear([priced(1000, null)])).toBeNull();
  });
});

describe('shortAcademicYear', () => {
  it('shortens the second year', () => {
    expect(shortAcademicYear('2025/2026')).toBe('2025/26');
    expect(shortAcademicYear('2026-2027')).toBe('2026/27');
    expect(shortAcademicYear('2026')).toBe('2026');
  });
});
