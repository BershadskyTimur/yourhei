import { describe, expect, it } from 'vitest';
import { countByType, filterInstitutions } from './filter';
import { pickLocalized } from './localized';
import type { InstitutionType, MapInstitution } from './types';

const make = (over: Partial<MapInstitution>): MapInstitution => ({
  id: 'x',
  slug: 'x',
  type: 'university',
  country: 'GE',
  city: { en: 'Tbilisi' },
  names: { original: 'თსუ', en: 'Tbilisi State University', ru: 'Тбилисский университет' },
  lat: 41.7,
  lng: 44.8,
  website: null,
  foundedYear: null,
  ...over,
});

const all = new Set<InstitutionType>([
  'university',
  'college',
  'school',
  'language_school',
  'foundation',
  'vocational',
]);

describe('pickLocalized', () => {
  const v = { original: 'ორიგინალი', en: 'English', ru: 'Русский' };
  it('uses the requested language when present', () => {
    expect(pickLocalized(v, 'ru')).toEqual({ text: 'Русский', isFallback: false });
  });
  it('falls back to English and flags it', () => {
    expect(pickLocalized(v, 'zh')).toEqual({ text: 'English', isFallback: true });
  });
  it('falls back to Russian, then the original', () => {
    expect(pickLocalized({ ru: 'Русский', original: 'o' }, 'es').text).toBe('Русский');
    expect(pickLocalized({ original: 'o' }, 'es').text).toBe('o');
  });
  it('returns an empty text for no data', () => {
    expect(pickLocalized(undefined, 'en').text).toBe('');
  });
});

describe('filterInstitutions', () => {
  const items = [
    make({ id: '1', names: { original: 'A', en: 'Alpha University' }, city: { en: 'Tbilisi' } }),
    make({ id: '2', type: 'school', names: { original: 'B', en: 'Beta School' }, city: { en: 'Almaty' } }),
    make({ id: '3', type: 'college', names: { original: 'Évora', en: 'Gamma College' }, city: { en: 'Astana' } }),
  ];

  it('keeps only selected types', () => {
    const r = filterInstitutions(items, { types: new Set<InstitutionType>(['school']), query: '' });
    expect(r.map((i) => i.id)).toEqual(['2']);
  });
  it('shows nothing when no type is selected', () => {
    expect(filterInstitutions(items, { types: new Set(), query: '' })).toHaveLength(0);
  });
  it('searches by name, ignoring case', () => {
    expect(filterInstitutions(items, { types: all, query: 'ALPHA' }).map((i) => i.id)).toEqual(['1']);
  });
  it('searches by city', () => {
    expect(filterInstitutions(items, { types: all, query: 'almaty' }).map((i) => i.id)).toEqual(['2']);
  });
  it('ignores accents', () => {
    expect(filterInstitutions(items, { types: all, query: 'evora' }).map((i) => i.id)).toEqual(['3']);
  });
  it('combines type and search', () => {
    expect(
      filterInstitutions(items, { types: new Set<InstitutionType>(['school']), query: 'alpha' }),
    ).toHaveLength(0);
  });
});

describe('countByType', () => {
  it('counts every type, including empty ones', () => {
    const c = countByType([make({}), make({}), make({ type: 'school' })]);
    expect(c.university).toBe(2);
    expect(c.school).toBe(1);
    expect(c.vocational).toBe(0);
  });
});
