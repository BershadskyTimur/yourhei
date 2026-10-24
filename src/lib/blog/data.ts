import livingData from '../../../data/reference/living-costs.json';
import scholarshipData from '../../../data/scholarships/national.json';
import { GUIDES, GUIDE_ACCESSED, type GuideBlock } from '../countries-guide/guides';
import type { LocalizedText } from '../institutions/types';

// What the data blocks of an article read. Everything here is the same data the country guides and the scholarship page use,
// so an article never says anything the rest of the site does not say.

export interface RuleRow {
  country: string;
  block: GuideBlock | null;
}

export function ruleRows(topic: 'work' | 'after'): RuleRow[] {
  return GUIDES.map((g) => ({ country: g.country, block: g[topic] }));
}
export const RULES_CHECKED: string = GUIDE_ACCESSED;

export interface FundsRow {
  country: string;
  currency: string;
  /** one entry for most countries; two where the amount depends on the city (the United Kingdom) */
  cities: { label: LocalizedText | null; amount: number }[];
  year: string;
  url: string;
  note: LocalizedText;
}

interface LivingJson {
  accessed: string;
  items: { country: string; currency: string; cities: { en: string; ru?: string; amount: number }[]; year: string; url: string; note: string; noteRu?: string }[];
}
const living = livingData as unknown as LivingJson;

export function fundsRows(): FundsRow[] {
  return living.items.map((i) => ({
    country: i.country,
    currency: i.currency,
    cities: i.cities.map((c) => ({
      // "Any city" says nothing: the label is only kept where the amount depends on the place
      label: i.cities.length > 1 ? { en: c.en, ...(c.ru ? { ru: c.ru } : {}) } : null,
      amount: c.amount,
    })),
    year: i.year,
    url: i.url,
    note: { en: i.note, ...(i.noteRu ? { ru: i.noteRu } : {}) },
  }));
}
export const FUNDS_CHECKED: string = living.accessed;

export interface ScholarshipRow {
  names: LocalizedText;
  funder: LocalizedText;
  eligibility: LocalizedText;
  covers: string | null;
  levels: string[];
  url: string;
  country: string | null;
  eligibleCountries: string[] | null;
}

interface ScholarshipJson {
  accessed: string;
  items: { names: LocalizedText | string; funder: LocalizedText | string; eligibility: LocalizedText | string; covers: string | null; levels: string[]; url: string; country: string | null; eligible_countries?: string[] | null; accessed?: string }[];
}
const sch = scholarshipData as unknown as ScholarshipJson;
const text = (v: LocalizedText | string): LocalizedText => (typeof v === 'string' ? { en: v } : v);

export const SCHOLARSHIPS: ScholarshipRow[] = sch.items.map((i) => ({
  names: text(i.names),
  funder: text(i.funder),
  eligibility: text(i.eligibility),
  covers: i.covers,
  levels: i.levels,
  url: i.url,
  country: i.country,
  eligibleCountries: i.eligible_countries ?? null,
}));
/** The latest day any scholarship was checked. */
export const SCHOLARSHIPS_CHECKED: string = [sch.accessed, ...sch.items.map((i) => i.accessed ?? '')].sort().at(-1) ?? sch.accessed;

export function selectScholarships(filter: { covers?: string; level?: string }): ScholarshipRow[] {
  return SCHOLARSHIPS.filter((s) => (!filter.covers || s.covers === filter.covers) && (!filter.level || s.levels.includes(filter.level)));
}

/** The programmes whose official page names this citizenship. */
export function scholarshipsOpenTo(country: string): ScholarshipRow[] {
  return SCHOLARSHIPS.filter((s) => s.eligibleCountries?.includes(country));
}
