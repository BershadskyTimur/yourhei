import countryData from '../../data/reference/countries.json';
import regionData from '../../data/reference/regions.json';

export interface CountryRecord {
  code: string; // ISO 3166-1 alpha-2
  region: 'europe' | 'asia' | 'americas' | 'oceania' | 'other';
  subregion: string | null; // UN M49 sub-region key
}

export const COUNTRIES = countryData as CountryRecord[];
export const COUNTRY_CODES = new Set(COUNTRIES.map((c) => c.code));

export const REGIONS = regionData as { id: string; countries: string[] }[];
export type RegionId = (typeof REGIONS)[number]['id'];

// Order in which sub-regions are shown.
export const SUBREGION_ORDER = [
  'eastern-europe',
  'northern-europe',
  'southern-europe',
  'western-europe',
  'central-asia',
  'eastern-asia',
  'south-eastern-asia',
  'southern-asia',
  'western-asia',
  'northern-america',
  'central-america',
  'caribbean',
  'south-america',
  'australia-nz',
  'melanesia',
  'micronesia',
  'polynesia',
] as const;

export function countriesOfRegions(regionIds: readonly string[]): string[] {
  const set = new Set<string>();
  for (const r of REGIONS) if (regionIds.includes(r.id)) r.countries.forEach((c) => set.add(c));
  return [...set];
}

export interface CountryGroup {
  subregion: string;
  countries: string[];
}

/** The countries of the chosen regions, grouped by UN M49 sub-region (each country once). */
export function groupBySubregion(codes: readonly string[]): CountryGroup[] {
  const bySub = new Map<string, string[]>();
  for (const code of codes) {
    const sub = COUNTRIES.find((c) => c.code === code)?.subregion;
    if (!sub) continue;
    bySub.set(sub, [...(bySub.get(sub) ?? []), code]);
  }
  return SUBREGION_ORDER.filter((s) => bySub.has(s)).map((subregion) => ({
    subregion,
    countries: bySub.get(subregion)!,
  }));
}

/** Country names in the site language, sorted alphabetically for that language. */
export function sortedCountryNames(locale: string): { code: string; name: string }[] {
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  const collator = new Intl.Collator(locale);
  return COUNTRIES.map((c) => ({ code: c.code, name: names.of(c.code) ?? c.code })).sort((a, b) =>
    collator.compare(a.name, b.name),
  );
}
