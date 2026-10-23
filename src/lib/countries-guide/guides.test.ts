import { describe, expect, it } from 'vitest';
import { COUNTRY_CODES } from '../countries';
import { GUIDES, guideOf, livingMinimum } from './guides';

describe('country guides', () => {
  it('every guide is for a real country, once, and has something to say', () => {
    const seen = new Set<string>();
    for (const g of GUIDES) {
      expect(COUNTRY_CODES.has(g.country), g.country).toBe(true);
      expect(seen.has(g.country), `${g.country} twice`).toBe(false);
      seen.add(g.country);
      expect(g.work || g.after || g.visa, g.country).toBeTruthy();
    }
  });
  it('every statement names its official page (https) and has an English and a Russian text', () => {
    for (const g of GUIDES) {
      for (const block of [g.visa, g.work, g.after]) {
        if (!block) continue;
        expect(block.url, g.country).toMatch(/^https:\/\//);
        if (block.summary) {
          expect(block.summary.en?.length, g.country).toBeGreaterThan(20);
          expect(block.summary.ru?.length, g.country).toBeGreaterThan(20);
        }
      }
    }
  });
  it('finds a guide by country code in any case, and the visa living minimum where known', () => {
    expect(guideOf('de')?.country).toBe('DE');
    expect(guideOf('XX')).toBeNull();
    expect(livingMinimum('DE')?.currency).toBe('EUR');
    expect(livingMinimum('TR')).toBeNull();
  });
});
