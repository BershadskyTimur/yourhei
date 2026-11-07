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
    expect(placeIn('zh', 'NL', '荷兰')).toBe('荷兰');
    expect(placeIn('pl', 'DE', 'Niemcy')).toBe('Niemcy');
  });
  it('German and Spanish add the article after "in" / "en" where the name takes one', () => {
    expect(placeIn('de', 'NL', 'Niederlande')).toBe('den Niederlanden');
    expect(placeIn('de', 'tr', 'Türkei')).toBe('der Türkei');
    expect(placeIn('de', 'DE', 'Deutschland')).toBe('Deutschland');
    expect(placeIn('es', 'GB', 'Reino Unido')).toBe('el Reino Unido');
    expect(placeIn('es', 'DE', 'Alemania')).toBe('Alemania');
  });
  it('French gives the whole "in <country>"', () => {
    expect(placeIn('fr', 'DE', 'Allemagne')).toBe('en Allemagne');
    expect(placeIn('fr', 'NL', 'Pays-Bas')).toBe('aux Pays-Bas');
    expect(placeIn('fr', 'GB', 'Royaume-Uni')).toBe('au Royaume-Uni');
    expect(placeIn('fr', 'GU', 'Guam')).toBe('à Guam');
    expect(placeIn('fr', 'IR', 'Iran')).toBe('en Iran');
    expect(placeIn('fr', 'CA', 'Canada')).toBe('au Canada');
    expect(placeIn('fr', 'IT', 'Italie')).toBe('en Italie');
  });
});
