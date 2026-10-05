import { describe, expect, it } from 'vitest';
import { calcAge, isOldEnough, isPlausibleBirthDate, minAgeFor, parseIsoDate } from './age';

const today = new Date(2026, 9, 5); // 5 October 2026

describe('minAgeFor', () => {
  it.each([
    ['GE', 16],
    ['DE', 16],
    ['GB', 16],
    ['CH', 16],
    ['NO', 16],
    ['IN', 18],
    ['KZ', 14],
    ['US', 14],
    ['ge', 16],
  ])('%s -> %i', (country, age) => {
    expect(minAgeFor(country)).toBe(age);
  });
});

describe('parseIsoDate', () => {
  it('accepts real dates', () => {
    expect(parseIsoDate('2008-02-29')).toEqual({ y: 2008, m: 2, d: 29 });
  });
  it.each(['2009-02-29', '2026-13-01', '2026-00-10', '10.05.2008', '', '2026-1-1'])(
    'rejects %s',
    (v) => {
      expect(parseIsoDate(v)).toBeNull();
    },
  );
});

describe('calcAge', () => {
  it('counts the birthday on the day itself', () => {
    expect(calcAge('2010-10-05', today)).toBe(16);
  });
  it('is one less the day before the birthday', () => {
    expect(calcAge('2010-10-06', today)).toBe(15);
  });
  it('handles a leap-day birthday', () => {
    expect(calcAge('2008-02-29', new Date(2026, 1, 28))).toBe(17);
    expect(calcAge('2008-02-29', new Date(2026, 2, 1))).toBe(18);
  });
  it('returns null for an invalid date', () => {
    expect(calcAge('nonsense', today)).toBeNull();
  });
});

describe('isOldEnough', () => {
  it('uses the threshold of the country of residence', () => {
    // 15 years old
    expect(isOldEnough('2011-06-01', 'KZ', today)).toBe(true); // threshold 14
    expect(isOldEnough('2011-06-01', 'GE', today)).toBe(false); // threshold 16
  });
  it('is exactly on the birthday for Georgia (16)', () => {
    expect(isOldEnough('2010-10-05', 'GE', today)).toBe(true);
    expect(isOldEnough('2010-10-06', 'GE', today)).toBe(false);
  });
  it('India requires 18', () => {
    expect(isOldEnough('2009-01-01', 'IN', today)).toBe(false);
    expect(isOldEnough('2008-10-05', 'IN', today)).toBe(true);
  });
  it('rejects an invalid date', () => {
    expect(isOldEnough('', 'KZ', today)).toBe(false);
  });
});

describe('isPlausibleBirthDate', () => {
  it('rejects the future and ages over 120', () => {
    expect(isPlausibleBirthDate('2027-01-01', today)).toBe(false);
    expect(isPlausibleBirthDate('1890-01-01', today)).toBe(false);
    expect(isPlausibleBirthDate('2005-05-05', today)).toBe(true);
  });
});
