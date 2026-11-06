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

/** Blog articles about one country (shown on its guide page when published), besides the ones for every country. */
const ARTICLES_OF: Record<string, string[]> = {
  DE: ['germany-how-to-apply-uni-assist', 'daad-scholarships-how-to-apply', 'free-tuition-germany-czechia-finland'],
  GB: ['chevening-scholarship-how-to-apply'],
  NL: ['netherlands-application-deadlines-studielink', 'nl-scholarship-netherlands-how-to-apply'],
  FI: ['finland-how-to-apply-studyinfo', 'free-tuition-germany-czechia-finland'],
  CZ: ['czechia-how-to-apply-universities', 'free-tuition-germany-czechia-finland'],
  PL: ['poland-recognition-of-certificate-and-diploma-nawa', 'visegrad-scholarship-how-to-apply'],
  TR: ['turkiye-scholarships-how-to-apply'],
};
const ARTICLES_FOR_ALL = ['work-during-studies-rules-by-country', 'after-graduation-work-permits-by-country', 'proof-of-funds-student-visa'];

/** The slugs of the articles to link from a country guide: its own first, then the general ones. */
export function articleSlugsOf(country: string): string[] {
  return [...(ARTICLES_OF[country.toUpperCase()] ?? []), ...ARTICLES_FOR_ALL];
}
