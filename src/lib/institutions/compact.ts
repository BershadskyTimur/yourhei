import { INSTITUTION_TYPES, type InstitutionType, type MapInstitution } from './types';

/**
 * A small wire format for the list of institutions on the home page. The full list (about 12,500 institutions) used to be
 * embedded in the page itself (1 MB). Now the page is tiny and the map loads this compact list from /api/institutions:
 * each row is an array instead of an object and the long ids are dropped, which makes it about three times smaller.
 */
export type CompactRow = [
  type: number,
  country: number,
  lat: number,
  lng: number,
  slug: string,
  /** name in the original language, in English, in the visitor's language ("" = none) */
  names: [string, string, string],
  /** city in the original language, in English, in the visitor's language ("" = none) */
  city: [string, string, string],
];

export interface CompactInstitutions {
  v: 1;
  locale: string;
  countries: string[];
  rows: CompactRow[];
}

const round = (n: number) => Math.round(n * 1e5) / 1e5;

export function encodeInstitutions(items: readonly MapInstitution[], locale: string): CompactInstitutions {
  const countries: string[] = [];
  const countryIndex = new Map<string, number>();
  const rows = items.map((i): CompactRow => {
    let c = countryIndex.get(i.country);
    if (c === undefined) {
      c = countries.length;
      countries.push(i.country);
      countryIndex.set(i.country, c);
    }
    const triple = (t: Partial<Record<string, string>>): [string, string, string] => [
      t.original ?? '',
      t.en ?? '',
      locale === 'en' ? '' : (t[locale] ?? ''),
    ];
    return [INSTITUTION_TYPES.indexOf(i.type), c, round(i.lat), round(i.lng), i.slug, triple(i.names), triple(i.city)];
  });
  return { v: 1, locale, countries, rows };
}

export function decodeInstitutions(data: CompactInstitutions): MapInstitution[] {
  const text = (t: [string, string, string]) => {
    const out: Partial<Record<string, string>> = {};
    if (t[0]) out.original = t[0];
    if (t[1]) out.en = t[1];
    if (t[2]) out[data.locale] = t[2];
    return out;
  };
  return data.rows.flatMap((r, idx) => {
    const type: InstitutionType | undefined = INSTITUTION_TYPES[r[0]];
    const country = data.countries[r[1]];
    if (!type || !country) return [];
    return [
      {
        id: String(idx),
        slug: r[4],
        type,
        country,
        city: text(r[6]),
        names: text(r[5]),
        lat: r[2],
        lng: r[3],
        website: null,
        foundedYear: null,
      },
    ];
  });
}
