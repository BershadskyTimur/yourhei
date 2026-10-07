import { describe, expect, it } from 'vitest';
import { buildProgrammeRow, parseLanguages, withInternationalDeadline, withInternationalTuition, type ProgrammeForm } from './programme';

const form: ProgrammeForm = {
  nameEn: 'Law', nameOriginal: 'Право', level: 'bachelor', languages: 'en, ru', durationYears: '4', free: false,
  amount: '3 500', currency: 'USD', period: 'year', deadline: '2027-06-30', applicationUrl: 'https://uni.example/apply',
};

describe('parseLanguages', () => {
  it('accepts codes separated by commas, semicolons and spaces', () => {
    expect(parseLanguages('en, RU;ka  en')).toEqual(['en', 'ru', 'ka']);
  });
  it('refuses anything that is not a two-letter code', () => {
    expect(parseLanguages('English')).toBeNull();
    expect(parseLanguages('')).toEqual([]);
  });
});

describe('tuition and deadline lines', () => {
  it('replaces only the international line', () => {
    const old = [
      { amount: 100, currency: 'EUR', period: 'year', applies_to: 'domestic' },
      { amount: 900, currency: 'EUR', period: 'year', applies_to: 'international' },
    ];
    expect(withInternationalTuition(old, 1000, 'EUR', 'year')).toEqual([old[0], { amount: 1000, currency: 'EUR', period: 'year', applies_to: 'international' }]);
  });
  it('drops an old "all" line when a new international price is given', () => {
    const out = withInternationalTuition([{ amount: 5, currency: 'EUR', period: 'year', applies_to: 'all' }], 7, 'EUR', 'year');
    expect(out).toHaveLength(1);
    expect(out[0].applies_to).toBe('international');
  });
  it('sets the international deadline and keeps the others', () => {
    const out = withInternationalDeadline([{ intake: '2026-09', applies_to: 'eu', date: '2026-05-01' }], '2027-06-30');
    expect(out).toEqual([{ intake: '2026-09', applies_to: 'eu', date: '2026-05-01' }, { intake: '2027-06', applies_to: 'international', date: '2027-06-30' }]);
  });
});

describe('buildProgrammeRow', () => {
  it('builds a row from a valid form', () => {
    const r = buildProgrammeRow(form);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.row.names).toEqual({ original: 'Право', en: 'Law' });
      expect(r.row.tuition).toEqual([{ amount: 3500, currency: 'USD', period: 'year', applies_to: 'international' }]);
      expect(r.row.languages).toEqual(['en', 'ru']);
      expect(r.row.duration_years).toBe(4);
    }
  });
  it('a free programme has no tuition lines', () => {
    const r = buildProgrammeRow({ ...form, free: true }, { tuition: [{ amount: 1, currency: 'USD', period: 'year', applies_to: 'international' }] });
    expect(r.ok && r.row.tuition).toEqual([]);
    expect(r.ok && r.row.free).toBe(true);
  });
  it('reports every problem', () => {
    const r = buildProgrammeRow({ ...form, nameEn: '', nameOriginal: '', level: 'x', languages: 'eng', durationYears: '99', amount: '-5', deadline: '30.06.2027', applicationUrl: 'javascript:alert(1)' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors).toEqual(['name', 'level', 'languages', 'duration', 'amount', 'deadline', 'url']);
  });
  it('requires a currency code when a price is given', () => {
    const r = buildProgrammeRow({ ...form, currency: 'usd' });
    expect(r.ok).toBe(false);
  });
  it('keeps the names in other languages that were already there', () => {
    const r = buildProgrammeRow(form, { names: { ka: 'სამართალი', en: 'Old' } });
    expect(r.ok && r.row.names).toEqual({ ka: 'სამართალი', en: 'Law', original: 'Право' });
  });
});
