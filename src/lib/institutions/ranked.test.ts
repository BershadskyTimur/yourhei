import { describe, expect, it } from 'vitest';
import { RANKED, mixed, ofCountry, offered, type RankedInstitution } from './ranked';
import { isListedThin } from '@/lib/seo/thin-institutions';

const r = (c: string, s: string, best: number): RankedInstitution => ({ c, s, best, names: { en: s } });

describe('offered', () => {
  it('leaves out thin pages and sorts by best position', () => {
    const items = [r('us', 'b', 5), r('gb', 'oxford', 1), r('de', 'a', 2)];
    expect(offered(items, (c) => c === 'gb').map((i) => i.s)).toEqual(['a', 'b']);
  });
});

describe('ofCountry', () => {
  it('takes the first of one country, code in any case', () => {
    const items = [r('us', 'a', 1), r('de', 'x', 2), r('us', 'b', 3), r('us', 'c', 4)];
    expect(ofCountry(items, 'US', 2).map((i) => i.s)).toEqual(['a', 'b']);
  });
});

describe('mixed', () => {
  it('caps each country', () => {
    const items = [r('us', 'a', 1), r('us', 'b', 2), r('us', 'c', 3), r('de', 'x', 4), r('nl', 'y', 5)];
    expect(mixed(items, 4, 2).map((i) => i.s)).toEqual(['a', 'b', 'x', 'y']);
  });
});

describe('the generated list', () => {
  it('has no thin page and every entry has an English or original name', () => {
    expect(RANKED.length).toBeGreaterThan(100);
    for (const i of RANKED) {
      expect(isListedThin(i.c, i.s)).toBe(false);
      expect(i.names.en ?? i.names.original).toBeTruthy();
    }
  });
});
