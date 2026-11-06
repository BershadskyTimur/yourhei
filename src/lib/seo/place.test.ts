import { describe, expect, it } from 'vitest';
import { placeIn, seoCity } from './place';

describe('the city for search engines', () => {
  it('keeps a real city and cuts the word "Municipality"', () => {
    expect(seoCity('Cambridge')).toBe('Cambridge');
    expect(seoCity('Oslo Municipality')).toBe('Oslo');
    expect(seoCity('  Тбилиси ')).toBe('Тбилиси');
  });
  it('leaves out a county instead of showing it as the city', () => {
    expect(seoCity('Middlesex County')).toBe('');
    expect(seoCity('округ Мидлсекс')).toBe('');
    expect(seoCity(undefined)).toBe('');
  });
});

describe('"in <country>" for titles', () => {
  it('Russian uses the prepositional case and "на" where needed', () => {
    expect(placeIn('ru', 'DE', 'Германия')).toBe('в Германии');
    expect(placeIn('ru', 'gu', 'Гуам')).toBe('на Гуаме');
    expect(placeIn('ru', 'ZZ', 'Страна')).toBe('в стране «Страна»');
  });
  it('English adds "the" where the name takes it; other languages keep the name', () => {
    expect(placeIn('en', 'NL', 'Netherlands')).toBe('the Netherlands');
    expect(placeIn('en', 'DE', 'Germany')).toBe('Germany');
    expect(placeIn('de', 'NL', 'Niederlande')).toBe('Niederlande');
  });
});
