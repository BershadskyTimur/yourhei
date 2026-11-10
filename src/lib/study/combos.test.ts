import { describe, expect, it } from 'vitest';
import { COUNTRY_CODES } from '../countries';
import { iscedEntry } from '../survey/references';
import { COMBOS, codeOfSlug, comboOf, combosOfCountry, fieldSlug, studyCountries } from './combos';

describe('study pages (country + field)', () => {
  it('every pair is a real country and a real narrow field with enough programmes', () => {
    expect(COMBOS.length).toBeGreaterThan(50);
    for (const c of COMBOS) {
      expect(COUNTRY_CODES.has(c.country), c.country).toBe(true);
      expect(iscedEntry(c.code)?.en, c.code).toBeTruthy();
      expect(c.programmes).toBeGreaterThanOrEqual(5);
      expect(c.institutions).toBeGreaterThanOrEqual(2);
    }
  });
  it('a slug holds the code and words, and the code can be read back', () => {
    expect(fieldSlug('061')).toMatch(/^061-information-and-communication/);
    expect(codeOfSlug(fieldSlug('061'))).toBe('061');
    expect(codeOfSlug('061')).toBe('061');
    expect(codeOfSlug('abc')).toBeNull();
    expect(codeOfSlug('0613-x')).toBeNull();
  });
  it('finds pairs by country (any case) and code', () => {
    const first = COMBOS[0];
    expect(comboOf(first.country.toLowerCase(), first.code)).toEqual(first);
    expect(comboOf('ZZ', '061')).toBeNull();
    expect(combosOfCountry(first.country).length).toBeGreaterThan(0);
    expect(studyCountries()).toContain(first.country);
  });
  it('a price range is only given where at least half of the programmes are priced, and it is a plausible yearly price', () => {
    const priced = COMBOS.filter((c) => c.fee);
    expect(priced.length).toBeGreaterThan(20);
    for (const c of priced) {
      const fee = c.fee!;
      expect(fee.priced * 2, `${c.country} ${c.code}`).toBeGreaterThanOrEqual(c.programmes);
      expect(fee.min, `${c.country} ${c.code}`).toBeGreaterThanOrEqual(100);
      expect(fee.max).toBeGreaterThanOrEqual(fee.min);
      expect(fee.currency).toMatch(/^[A-Z]{3}$/);
    }
  });
});
