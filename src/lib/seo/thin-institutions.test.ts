import { describe, expect, it } from 'vitest';
import data from '../../../data/generated/thin-institutions.json';
import { THIN_COUNT, isListedThin } from './thin-institutions';

describe('the list of thin institution pages (sitemap)', () => {
  it('holds every listed institution once, with the count the file states', () => {
    const all = Object.values(data.items as Record<string, string[]>).flat();
    expect(THIN_COUNT).toBe(data.count);
    expect(new Set(all).size + Object.keys(data.items).length).toBeGreaterThan(0);
    expect(THIN_COUNT).toBe(all.length);
  });
  it('matches by country code in any case and by the exact slug', () => {
    expect(isListedThin('GB', 'university-of-oxford')).toBe(true);
    expect(isListedThin('gb', 'university-of-oxford')).toBe(true);
    expect(isListedThin('US', 'harvard-university')).toBe(false);
    expect(isListedThin('gb', 'university-of-oxfor')).toBe(false);
  });
  it('uses lower-case two-letter country codes and address slugs', () => {
    for (const [country, slugs] of Object.entries(data.items as Record<string, string[]>)) {
      expect(country).toMatch(/^[a-z]{2}$/);
      for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9][a-z0-9-]*$/);
    }
  });
});
