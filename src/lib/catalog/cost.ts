import { convert, yearlyAmount } from '../matching/currency';
import type { CountryFacts, Rates, Tuition } from '../matching/types';

type CostOfLiving = CountryFacts['costOfLiving'][number];

// Prices for the catalog and the institution page: the yearly tuition and the "total cost" (tuition + living)
// shown in the currency the visitor chose. Nothing is invented: if a number is not known, it is null.

export interface YearlyPrice {
  /** Amount per year in `currency`. */
  amount: number;
  currency: string;
  /** True when it was converted from the currency the institution publishes. */
  converted: boolean;
}

/** The line that an applicant from abroad pays: "international", otherwise "all". */
export function pickInternationalTuition(tuition: Tuition[]): Tuition | null {
  const known = tuition.filter((t) => t.amount !== null);
  return known.find((t) => t.appliesTo === 'international') ?? known.find((t) => t.appliesTo === 'all') ?? null;
}

/** Yearly tuition in `target` (or in the published currency when no rate is known). null if there is no usable price. */
export function yearlyTuition(tuition: Tuition[], durationYears: number | null, target: string, rates: Rates): YearlyPrice | null {
  const line = pickInternationalTuition(tuition);
  if (!line) return null;
  const yearly = yearlyAmount(line, durationYears);
  if (yearly === null) return null;
  const converted = convert(yearly, line.currency, target, rates);
  return converted === null ? { amount: yearly, currency: line.currency, converted: false } : { amount: converted, currency: target, converted: line.currency !== target };
}

/** Yearly living cost in `target` for a city (or the first city of the country with a known amount). */
export function yearlyLiving(list: CostOfLiving[], city: Partial<Record<string, string>>, target: string, rates: Rates): number | null {
  const wanted = (city.en ?? Object.values(city)[0] ?? '').toLowerCase();
  const known = list.filter((c) => c.amountPerMonth !== null);
  const here = known.find((c) => (c.city.en ?? '').toLowerCase() === wanted) ?? known[0];
  if (!here || here.amountPerMonth === null) return null;
  return convert(here.amountPerMonth * 12, here.currency, target, rates);
}

export interface TotalCost {
  tuition: number;
  living: number;
  total: number;
  currency: string;
}

/** Tuition + living for one year, only when both are known in the same currency. */
export function totalYearly(tuition: YearlyPrice | null, free: boolean, living: number | null, target: string): TotalCost | null {
  if (living === null) return null;
  const fee = free ? 0 : tuition && tuition.currency === target ? tuition.amount : null;
  if (fee === null) return null;
  return { tuition: fee, living, total: fee + living, currency: target };
}

/** A sensible default currency for a language of the site. */
export const DEFAULT_CURRENCY_BY_LOCALE: Record<string, string> = {
  ru: 'USD', en: 'USD', ka: 'GEL', es: 'EUR', zh: 'CNY', uk: 'UAH', hy: 'AMD', kk: 'KZT',
  tr: 'TRY', az: 'AZN', uz: 'UZS', ky: 'KGS', pl: 'PLN', ar: 'USD', fr: 'EUR', de: 'EUR',
};

export const CATALOG_CURRENCIES = ['USD', 'EUR', 'GBP', 'RUB', 'UAH', 'GEL', 'AMD', 'AZN', 'KZT', 'UZS', 'KGS', 'TRY', 'PLN', 'CNY'] as const;
