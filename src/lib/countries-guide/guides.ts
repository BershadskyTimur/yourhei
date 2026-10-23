import guidesData from '../../../data/countries/guides.json';
import livingData from '../../../data/reference/living-costs.json';
import type { LocalizedText } from '../institutions/types';

// Short guides to the rules that matter before applying (study visa, work during studies, staying after graduation,
// living costs). The texts are in data/countries/guides.json; each one is taken from the official page it links to.

export interface GuideBlock {
  summary: LocalizedText | null;
  url: string;
}
export interface CountryGuide {
  country: string;
  visa: GuideBlock | null;
  work: GuideBlock | null;
  after: GuideBlock | null;
}
export interface LivingMinimum {
  currency: string;
  amount: number;
  year: string;
  url: string;
}

export const GUIDES: CountryGuide[] = (guidesData as unknown as { items: CountryGuide[] }).items;
export const GUIDE_ACCESSED: string = (guidesData as unknown as { accessed: string }).accessed;

export function guideOf(country: string): CountryGuide | null {
  return GUIDES.find((g) => g.country === country.toUpperCase()) ?? null;
}

/** The monthly amount a country officially asks a foreign student to prove (the visa minimum), when known. */
export function livingMinimum(country: string): LivingMinimum | null {
  const row = (livingData as unknown as { items: { country: string; currency: string; cities: { amount: number }[]; year: string; url: string }[] }).items.find((i) => i.country === country.toUpperCase());
  const amount = row?.cities?.[0]?.amount;
  return row && typeof amount === 'number' ? { currency: row.currency, amount, year: row.year, url: row.url } : null;
}
