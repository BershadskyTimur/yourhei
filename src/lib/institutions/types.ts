// Institution types (SPEC.md section 7). Colours live in globals.css as --type-<code>.
export const INSTITUTION_TYPES = [
  'university',
  'college',
  'school',
  'language_school',
  'foundation',
  'vocational',
] as const;

export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

/** Texts keyed by language code plus "original" (the name in the country's own language). */
export type LocalizedText = Partial<Record<string, string>>;

/** What the map and the cards need to know about one institution. */
export interface MapInstitution {
  id: string;
  slug: string;
  type: InstitutionType;
  country: string; // ISO 3166-1 alpha-2
  city: LocalizedText;
  names: LocalizedText;
  lat: number;
  lng: number;
  website: string | null;
  foundedYear: number | null;
}

export function isInstitutionType(value: string): value is InstitutionType {
  return (INSTITUTION_TYPES as readonly string[]).includes(value);
}
