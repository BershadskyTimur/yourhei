'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { totalYearly, yearlyLiving, yearlyTuition } from '@/lib/catalog/cost';
import { loadCountryFacts, loadRates, useChosenCurrency } from '@/lib/catalog/currency-store';
import type { CountryFacts, Rates, Tuition } from '@/lib/matching/types';

/** Under the price of a programme: the same price in the visitor's currency and, if known, with living costs. */
export function PriceInMyCurrency({ tuition, durationYears, free, country, city }: { tuition: Tuition[]; durationYears: number | null; free: boolean; country: string; city: Partial<Record<string, string>> }) {
  const t = useTranslations('Catalog');
  const locale = useLocale();
  const currency = useChosenCurrency(locale);
  const [rates, setRates] = useState<Rates | null>(null);
  const [facts, setFacts] = useState<Record<string, CountryFacts>>({});

  useEffect(() => {
    void loadRates().then(setRates);
    void loadCountryFacts().then(setFacts);
  }, []);

  if (!rates) return null;
  const money = (amount: number, cur: string) => {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `${Math.round(amount)} ${cur}`;
    }
  };
  const price = free ? null : yearlyTuition(tuition, durationYears, currency, rates);
  const living = facts[country] ? yearlyLiving(facts[country].costOfLiving, city, currency, rates) : null;
  const total = totalYearly(price, free, living, currency);
  const showPrice = price && price.currency === currency && price.converted;
  if (!showPrice && !total) return null;
  return (
    <p className="mt-1 text-sm text-muted">
      {showPrice && price && <span>≈ {t('perYear', { price: money(price.amount, price.currency) })}. </span>}
      {total && <span>{t('total', { total: money(total.total, total.currency), living: money(total.living, total.currency) })}</span>}
      {total && <span className="block text-xs">{t('livingNote')}</span>}
    </p>
  );
}
