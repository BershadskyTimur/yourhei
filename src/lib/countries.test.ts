import { describe, expect, it } from 'vitest';
import {
  COUNTRIES,
  COUNTRY_CODES,
  REGIONS,
  countriesOfRegions,
  groupBySubregion,
  sortedCountryNames,
} from './countries';

describe('country reference data', () => {
  it('has the ISO list without Kosovo, with Taiwan', () => {
    expect(COUNTRIES.length).toBe(249);
    expect(COUNTRY_CODES.has('TW')).toBe(true);
    expect(COUNTRY_CODES.has('XK')).toBe(false);
  });
  it('defines the macro-regions', () => {
    expect(REGIONS.map((r) => r.id)).toEqual(['caucasus-ca-ee', 'europe', 'asia', 'americas', 'oceania']);
  });
  it('the Caucasus / Central Asia / Eastern Europe region has the 12 countries of SPEC.md', () => {
    const r = REGIONS.find((x) => x.id === 'caucasus-ca-ee')!;
    expect([...r.countries].sort()).toEqual(
      ['AM', 'AZ', 'BY', 'GE', 'KZ', 'KG', 'MD', 'RU', 'TJ', 'TM', 'UZ', 'UA'].sort(),
    );
  });
  it('every region country is a known ISO code', () => {
    for (const r of REGIONS) for (const c of r.countries) expect(COUNTRY_CODES.has(c)).toBe(true);
  });
});

describe('countriesOfRegions / groupBySubregion', () => {
  it('a country in two chosen regions is listed once', () => {
    const codes = countriesOfRegions(['caucasus-ca-ee', 'asia']);
    expect(new Set(codes).size).toBe(codes.length);
    expect(codes).toContain('KZ');
    expect(codes).toContain('JP');
  });
  it('has the Americas and Oceania with their sub-regions', () => {
    const groups = groupBySubregion(countriesOfRegions(['americas', 'oceania']));
    expect(groups.map((g) => g.subregion)).toEqual([
      'northern-america', 'central-america', 'caribbean', 'south-america', 'australia-nz', 'melanesia', 'micronesia', 'polynesia',
    ]);
    expect(countriesOfRegions(['americas'])).toContain('BR');
    expect(countriesOfRegions(['oceania'])).toContain('NZ');
  });
  it('groups by sub-region in a fixed order', () => {
    const groups = groupBySubregion(countriesOfRegions(['caucasus-ca-ee']));
    expect(groups.map((g) => g.subregion)).toEqual(['eastern-europe', 'central-asia', 'western-asia']);
    expect(groups.find((g) => g.subregion === 'western-asia')!.countries.sort()).toEqual(['AM', 'AZ', 'GE']);
  });
  it('returns nothing for no region', () => {
    expect(groupBySubregion(countriesOfRegions([]))).toEqual([]);
  });
});

describe('sortedCountryNames', () => {
  it('names Taiwan neutrally in every site language', () => {
    for (const [locale, name] of [
      ['en', 'Taiwan'],
      ['ru', 'Тайвань'],
    ] as const) {
      expect(sortedCountryNames(locale).find((c) => c.code === 'TW')!.name).toBe(name);
    }
  });
  it('is sorted', () => {
    const names = sortedCountryNames('en').map((c) => c.name);
    expect(names[0].localeCompare(names[1], 'en')).toBeLessThanOrEqual(0);
  });
});
