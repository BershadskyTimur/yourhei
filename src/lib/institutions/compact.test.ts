import { describe, expect, it } from 'vitest';
import { decodeInstitutions, encodeInstitutions } from './compact';
import type { MapInstitution } from './types';

const inst = (over: Partial<MapInstitution> = {}): MapInstitution => ({
  id: 'a1b2c3d4-0000-0000-0000-000000000000',
  slug: 'tbilisi-state-university',
  type: 'university',
  country: 'GE',
  city: { original: 'თბილისი', en: 'Tbilisi', ru: 'Тбилиси' },
  names: { original: 'თბილისის სახელმწიფო უნივერსიტეტი', en: 'Tbilisi State University', ru: 'Тбилисский государственный университет' },
  lat: 41.7101234567,
  lng: 44.7699876543,
  website: 'https://example.org',
  foundedYear: 1918,
  ...over,
});

describe('compact institutions', () => {
  it('keeps what the map, the search and the card need', () => {
    const [back] = decodeInstitutions(encodeInstitutions([inst()], 'ru'));
    expect(back).toMatchObject({ slug: 'tbilisi-state-university', type: 'university', country: 'GE', lat: 41.71012, lng: 44.76999 });
    expect(back.names).toEqual({ original: 'თბილისის სახელმწიფო უნივერსიტეტი', en: 'Tbilisi State University', ru: 'Тбилисский государственный университет' });
    expect(back.city).toEqual({ original: 'თბილისი', en: 'Tbilisi', ru: 'Тбилиси' });
  });

  it('drops the website and the founding year (the card does not show them)', () => {
    const [back] = decodeInstitutions(encodeInstitutions([inst()], 'en'));
    expect(back.website).toBeNull();
    expect(back.foundedYear).toBeNull();
  });

  it('does not repeat English when the visitor reads English', () => {
    const data = encodeInstitutions([inst()], 'en');
    expect(data.rows[0][5][2]).toBe('');
    expect(decodeInstitutions(data)[0].names.en).toBe('Tbilisi State University');
  });

  it('gives every institution its own id and shares the country list', () => {
    const data = encodeInstitutions([inst(), inst({ slug: 'b' }), inst({ slug: 'c', country: 'AM' })], 'en');
    expect(data.countries).toEqual(['GE', 'AM']);
    expect(decodeInstitutions(data).map((i) => i.id)).toEqual(['0', '1', '2']);
  });

  it('is much smaller than the full objects', () => {
    const items = Array.from({ length: 200 }, (_, n) => inst({ id: `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`, slug: `s${n}` }));
    const full = JSON.stringify(items).length;
    const compact = JSON.stringify(encodeInstitutions(items, 'ru')).length;
    expect(compact).toBeLessThan(full * 0.75);
  });

  it('skips a row with an unknown type or country', () => {
    const data = encodeInstitutions([inst()], 'en');
    data.rows[0][0] = 99;
    expect(decodeInstitutions(data)).toEqual([]);
  });
});
