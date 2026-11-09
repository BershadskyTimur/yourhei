import { describe, expect, it } from 'vitest';
import { ROWS, byMonth, closingSoon, countriesWithDeadlines, monthsOfCountry, nextPerInstitution, ofCountry, ofMonth, upcoming, type DeadlineRow } from './deadlines';

const row = (c: string, d: string, s = 'x'): DeadlineRow => ({ c, s, n: s, d, i: null, a: 'all', l: ['master'], p: 1 });
const rows = [row('DE', '2026-10-01'), row('DE', '2026-11-01', 'a'), row('NL', '2026-11-20', 'b'), row('DE', '2027-03-15', 'c'), row('DE', '2027-03-20', 'd')];
const today = new Date('2026-10-24T09:00:00Z');

describe('deadline calendar', () => {
  it('drops the passed days and keeps today', () => {
    expect(upcoming(rows, today).map((r) => r.d)).toEqual(['2026-11-01', '2026-11-20', '2027-03-15', '2027-03-20']);
    expect(upcoming([row('DE', '2026-10-24')], today)).toHaveLength(1);
  });
  it('lists the countries with the most deadlines first, with their next date', () => {
    expect(countriesWithDeadlines(rows, today)).toEqual([
      { country: 'DE', count: 3, institutions: 3, next: '2026-11-01' },
      { country: 'NL', count: 1, institutions: 1, next: '2026-11-20' },
    ]);
  });
  it('takes one country, in any letter case', () => {
    expect(ofCountry('nl', rows, today)).toHaveLength(1);
  });
  it('finds what closes in the next days', () => {
    expect(closingSoon(10, rows, today).map((r) => r.d)).toEqual(['2026-11-01']);
    expect(closingSoon(30, rows, today).map((r) => r.d)).toEqual(['2026-11-01', '2026-11-20']);
  });
  it('groups by month in the given order', () => {
    expect(byMonth(upcoming(rows, today)).map((g) => [g.month, g.rows.length])).toEqual([['2026-11', 2], ['2027-03', 2]]);
  });
});

describe('months of a country', () => {
  it('counts the rows of each month that still has deadlines', () => {
    expect(monthsOfCountry('DE', rows, today)).toEqual([{ month: '2026-11', count: 1 }, { month: '2027-03', count: 2 }]);
  });
  it('takes one month of one country, without the passed days', () => {
    expect(ofMonth('DE', '2027-03', rows, today).map((r) => r.s)).toEqual(['c', 'd']);
    expect(ofMonth('DE', '2026-10', rows, today)).toEqual([]);
    expect(ofMonth('NL', '2027-03', rows, today)).toEqual([]);
  });
});

describe('the built data', () => {
  it('has valid rows: ISO dates, a known kind of applicant, levels, a slug', () => {
    expect(ROWS.length).toBeGreaterThan(100);
    for (const r of ROWS) {
      expect(r.d).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['international', 'eu', 'all']).toContain(r.a);
      expect(r.s).toMatch(/^[a-z0-9-]+$/);
      expect(r.c).toMatch(/^[A-Z]{2}$/);
      expect(r.p).toBeGreaterThan(0);
      expect(r.l.length).toBeGreaterThan(0);
      if (r.i) expect(r.i).toMatch(/^\d{4}-\d{2}$/);
    }
  });
  it('is in date order', () => {
    const dates = ROWS.map((r) => r.d);
    expect(dates).toEqual([...dates].sort());
  });
});

describe('nextPerInstitution', () => {
  const list = [row('DE', '2026-11-10', 'a'), row('DE', '2026-11-12', 'a'), row('NL', '2026-11-15', 'b'), row('DE', '2026-12-01', 'c'), row('FI', '2026-12-02', 'f')];
  it('gives each institution once, with its nearest date, only in the countries asked', () => {
    expect(nextPerInstitution(['DE', 'NL'], 5, list, new Date('2026-11-09T12:00:00Z')).map((r) => `${r.s} ${r.d}`)).toEqual(['a 2026-11-10', 'b 2026-11-15', 'c 2026-12-01']);
  });
  it('stops at the count and skips past dates', () => {
    expect(nextPerInstitution(['DE'], 1, list, new Date('2026-11-11T12:00:00Z')).map((r) => r.d)).toEqual(['2026-11-12']);
  });
});
