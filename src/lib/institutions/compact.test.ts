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

  it('carries the foundation flag, and reads rows without it', () => {
    const data = encodeInstitutions([inst({ hasFoundation: true }), inst({ slug: 'b' })], 'en');
    expect(data.rows[0][7]).toBe(1);
    expect(data.rows[1][7]).toBeUndefined();
    const back = decodeInstitutions(data);
    expect(back[0].hasFoundation).toBe(true);
    expect(back[1].hasFoundation).toBeUndefined();
  });

  it('does not repeat English when the visitor reads English', () => {
    const data = encodeInstitutions([inst()], 'en');
    expect(data.rows[0][5][2]).toBe('');
    expect(decodeInstitutions(data)[0].names.en).toBe('Tbilisi State University');
  });

  it('gives every institution its own id', () => {
    const data = encodeInstitutions([inst(), inst({ slug: 'b' }), inst({ slug: 'c', country: 'AM' })], 'en');
    expect(decodeInstitutions(data).map((i) => i.id)).toEqual(['0', '1', '2']);
    expect(decodeInstitutions(data).map((i) => i.country)).toEqual(['GE', 'GE', 'AM']);
  });

  it('still reads the older format that sent an index into a country list', () => {
    const data = encodeInstitutions([inst(), inst({ country: 'AM' })], 'en');
    const old = { ...data, v: 1 as const, countries: ['GE', 'AM'], rows: data.rows.map((r, n) => [r[0], n, ...r.slice(2)] as typeof r) };
    expect(decodeInstitutions(old).map((i) => i.country)).toEqual(['GE', 'AM']);
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
