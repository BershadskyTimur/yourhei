import { describe, expect, it } from 'vitest';
import { LIST_PAGE, MIN_LIST, listCountries, pageSlugs, pagesOf } from './country-list';

const points = (country: string, n: number) => Array.from({ length: n }, (_, i) => ({ slug: `${country.toLowerCase()}-${String(i).padStart(4, '0')}`, country }));

describe('listCountries', () => {
  it('keeps countries with at least MIN_LIST institutions, most first, ties by code', () => {
    const list = listCountries([...points('US', 5), ...points('KZ', MIN_LIST), ...points('AM', MIN_LIST), ...points('NZ', MIN_LIST - 1)]);
    expect(list).toEqual([
      { country: 'US', count: 5 },
      { country: 'AM', count: MIN_LIST },
      { country: 'KZ', count: MIN_LIST },
    ]);
  });
  it('treats the country code case-insensitively', () => {
    expect(listCountries([{ slug: 'a', country: 'de' }, { slug: 'b', country: 'DE' }, { slug: 'c', country: 'De' }])).toEqual([{ country: 'DE', count: 3 }]);
  });
});

describe('pagesOf', () => {
  it('rounds up and is never below one', () => {
    expect(pagesOf(0)).toBe(1);
    expect(pagesOf(LIST_PAGE)).toBe(1);
    expect(pagesOf(LIST_PAGE + 1)).toBe(2);
    expect(pagesOf(3330)).toBe(Math.ceil(3330 / LIST_PAGE));
  });
});

describe('pageSlugs', () => {
  const all = [...points('US', LIST_PAGE + 5), ...points('DE', 4)].reverse();
  it('gives the page in the order of the address, whatever the order of the input', () => {
    const first = pageSlugs(all, 'us', 1);
    expect(first.total).toBe(LIST_PAGE + 5);
    expect(first.slugs).toHaveLength(LIST_PAGE);
    expect(first.slugs[0]).toBe('us-0000');
    expect(pageSlugs(all, 'US', 2).slugs).toEqual(['us-0200', 'us-0201', 'us-0202', 'us-0203', 'us-0204']);
  });
  it('is empty past the end, for a bad page number and for a country without a list', () => {
    expect(pageSlugs(all, 'us', 3).slugs).toEqual([]);
    expect(pageSlugs(all, 'us', 0).slugs).toEqual([]);
    expect(pageSlugs(all, 'us', 1.5).slugs).toEqual([]);
    expect(pageSlugs(points('NZ', MIN_LIST - 1), 'nz', 1).slugs).toEqual([]);
    expect(pageSlugs(all, 'fr', 1)).toEqual({ slugs: [], total: 0 });
  });
});
