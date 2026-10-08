import { describe, expect, it } from 'vitest';
import { ISCED } from './references';
import { POPULAR_FIELDS, searchIsced } from './isced-search';

const codes = (q: string, locale = 'en') => searchIsced(q, locale).map((m) => m.entry.c);

describe('searchIsced', () => {
  it('finds international relations and diplomacy under political sciences', () => {
    expect(codes('diplomacy')[0]).toBe('0312');
    expect(codes('international relations')[0]).toBe('0312');
    expect(codes('международные отношения', 'ru')[0]).toBe('0312');
    expect(codes('дипломат', 'ru')[0]).toBe('0312');
  });
  it('tells which everyday word led to the field', () => {
    const m = searchIsced('diplomacy', 'en')[0];
    expect(m.via).toBe('diplomacy');
    expect(searchIsced('law', 'en')[0].via).toBeNull();
  });
  it('finds everyday names of popular directions', () => {
    expect(codes('artificial intelligence')).toContain('0613');
    expect(codes('marketing')[0]).toBe('0414');
    expect(codes('логистика', 'ru')[0]).toBe('1041');
    expect(codes('cybersecurity')).toContain('0612');
    expect(codes('graphic design')[0]).toBe('0212');
    expect(codes('MBA')).toContain('0413');
  });
  it('still finds by the official name and ignores accents and case', () => {
    expect(codes('Political sciences')[0]).toBe('0312');
    expect(codes('ÉCONOMICS')).toContain('0311');
  });
  it('returns nothing for a very short or unknown text', () => {
    expect(codes('a')).toEqual([]);
    expect(codes('qqqqzzzz')).toEqual([]);
  });
});

describe('popular directions', () => {
  it('all lead to a code of the classification', () => {
    const known = new Set(ISCED.map((e) => e.c));
    for (const p of POPULAR_FIELDS) expect(known.has(p.code), p.code).toBe(true);
  });
});
