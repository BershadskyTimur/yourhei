import { describe, expect, it } from 'vitest';
import { sanitizeMeta } from './events';

describe('sanitizeMeta', () => {
  it('keeps the known fields of a search and drops the rest', () => {
    expect(sanitizeMeta('catalog_search', { results: 12, country: 'GE', level: 'bachelor', language: 'en', field: '04', free: true, evil: 'x', email: 'a@b.c' })).toEqual({
      results: 12, mode: 'programs', country: 'GE', level: 'bachelor', language: 'en', field: '04', free: true,
    });
  });
  it('cleans and cuts the search phrase', () => {
    const meta = sanitizeMeta('catalog_search', { results: 0, q: '  Law, <script>alert(1)</script> ' + 'x'.repeat(100) });
    expect(meta?.q).toBeTypeOf('string');
    expect(String(meta?.q)).not.toMatch(/[<>(),]/);
    expect(String(meta?.q).length).toBeLessThanOrEqual(40);
  });
  it('refuses values that do not look right', () => {
    expect(sanitizeMeta('catalog_search', { results: 1, country: 'georgia', level: 'DROP TABLE' })).toEqual({ results: 1, mode: 'programs' });
    expect(sanitizeMeta('catalog_search', { country: 'GE' })).toBeNull();
  });
  it('checks apply clicks', () => {
    expect(sanitizeMeta('apply_click', { kind: 'program', country: 'GE', slug: 'tbilisi-state' })).toEqual({ kind: 'program', country: 'GE', slug: 'tbilisi-state' });
    expect(sanitizeMeta('apply_click', { kind: 'other' })).toBeNull();
    expect(sanitizeMeta('apply_click', { kind: 'website', slug: '../etc/passwd' })).toEqual({ kind: 'website' });
  });
  it('limits the numbers of matches', () => {
    expect(sanitizeMeta('matches_view', { passed: 20, safe: 5, suitable: 10, ambitious: 999999999 })).toEqual({ passed: 20, safe: 5, suitable: 10, ambitious: 100000 });
    expect(sanitizeMeta('matches_view', { passed: 'many' })).toBeNull();
  });
  it('refuses unknown events', () => {
    expect(sanitizeMeta('page_view', {})).toBeNull();
    expect(sanitizeMeta(undefined, {})).toBeNull();
  });
});
