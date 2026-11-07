import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound, permanentRedirect } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { COUNTRY_CODES } from '@/lib/countries';
import { getCountryListPage } from '@/lib/institutions/country-list';
import { InstitutionListPage, listMetadata, listPath } from '../../list';

// Rebuilt once a day; no page is built in advance (each one is built on the first visit and cached).
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

type Params = Promise<{ locale: string; country: string; page: string }>;

/** "2" → 2; not a plain number ("02", "x") → null. */
const pageNumber = (s: string): number | null => (/^[1-9]\d{0,3}$/.test(s) ? Number(s) : null);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, country, page } = await params;
  const n = pageNumber(page);
  if (!hasLocale(routing.locales, locale) || !COUNTRY_CODES.has(country.toUpperCase()) || !n || n < 2) return {};
  const list = await getCountryListPage(country, n);
  return list ? listMetadata(locale, country, n, list) : {};
}

/** Pages 2, 3 … of a country's list. */
export default async function InstitutionsOfCountryNextPage({ params }: { params: Params }) {
  const { locale, country, page } = await params;
  const n = pageNumber(page);
  if (!hasLocale(routing.locales, locale) || !COUNTRY_CODES.has(country.toUpperCase()) || !n) notFound();
  // one address per page: page 1 is the country's own address
  if (n === 1) permanentRedirect(`/${locale}${listPath(country, 1)}`);
  setRequestLocale(locale);
  const list = await getCountryListPage(country, n);
  if (!list) notFound();
  return <InstitutionListPage locale={locale} country={country} page={n} list={list} />;
}
