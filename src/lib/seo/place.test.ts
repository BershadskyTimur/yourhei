import { describe, expect, it } from 'vitest';
import { placeIn } from './place';

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
