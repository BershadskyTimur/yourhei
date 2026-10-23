import combosData from '../../../data/generated/study-combos.json';
import { iscedEntry } from '../survey/references';

// The pages "Study <field> in <country>": which pairs have enough programmes (built by scripts/build-study-combos.mjs
// from the same data that is loaded into the database).

export interface StudyCombo {
  country: string;
  /** narrow ISCED-F field, 3 digits */
  code: string;
  programmes: number;
  institutions: number;
}

export const COMBOS: StudyCombo[] = (combosData as unknown as { combos: StudyCombo[] }).combos;

export function combosOfCountry(country: string): StudyCombo[] {
  return COMBOS.filter((c) => c.country === country.toUpperCase());
}
export function comboOf(country: string, code: string): StudyCombo | null {
  return COMBOS.find((c) => c.country === country.toUpperCase() && c.code === code) ?? null;
}
export const studyCountries = (): string[] => [...new Set(COMBOS.map((c) => c.country))];

/** "061" -> "061-information-and-communication-technologies" (the words are for people and search engines). */
export function fieldSlug(code: string): string {
  const en = iscedEntry(code)?.en ?? '';
  const words = en.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return words ? `${code}-${words}`.slice(0, 80) : code;
}
/** The code at the start of a slug ("061-information..." -> "061"), or null. */
export function codeOfSlug(slug: string): string | null {
  const m = /^(\d{3})(?:-|$)/.exec(slug);
  return m ? m[1] : null;
}
