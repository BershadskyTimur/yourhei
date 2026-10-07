'use client';

import { useSyncExternalStore } from 'react';
import type { CountryFacts, Rates } from '../matching/types';
import { toCountryFacts } from '../matching/load';
import { getSupabaseBrowser } from '../supabase/client';
import { CATALOG_CURRENCIES, DEFAULT_CURRENCY_BY_LOCALE } from './cost';

// The currency the visitor chose for prices (kept in this browser only), exchange rates and living costs.
// Rates and facts are loaded once per page view and shared by every price on the page.

const KEY = 'yourhei.currency';
const EVENT = 'yourhei-currency';

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

function stored(): string | null {
  try {
    const saved = window.localStorage.getItem(KEY);
    return saved && (CATALOG_CURRENCIES as readonly string[]).includes(saved) ? saved : null;
  } catch {
    return null;
  }
}

/** The chosen currency; on the server and before the page is shown, the usual currency of the site language. */
export function useChosenCurrency(locale: string): string {
  const fallback = DEFAULT_CURRENCY_BY_LOCALE[locale] ?? 'USD';
  return useSyncExternalStore(subscribe, () => stored() ?? fallback, () => fallback);
}

export function chooseCurrency(code: string) {
  try {
    window.localStorage.setItem(KEY, code);
  } catch {
    /* storage is blocked: the choice lasts until the page is closed */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** true once the page is shown in the browser (use it for things the server cannot know, such as region names). */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

let ratesPromise: Promise<Rates> | null = null;
export function loadRates(): Promise<Rates> {
  ratesPromise ??= fetch('/api/rates')
    .then((r) => r.json())
    .then((d: { rates?: Rates }) => d.rates ?? {})
    .catch(() => ({}));
  return ratesPromise;
}

let factsPromise: Promise<Record<string, CountryFacts>> | null = null;
export function loadCountryFacts(): Promise<Record<string, CountryFacts>> {
  factsPromise ??= (async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return {};
    const { data } = await supabase.from('country_data').select('country, currency, work_during_study, post_study_work_visa, recognition, cost_of_living').eq('status', 'published');
    return Object.fromEntries(((data ?? []) as Record<string, unknown>[]).flatMap((r) => toCountryFacts(r) ?? []).map((c) => [c.code, c]));
  })();
  return factsPromise;
}
