import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { COUNTRY_CODES } from '@/lib/countries';
import { getCountryListPage } from '@/lib/institutions/country-list';
import { InstitutionListPage, listMetadata } from './list';

// Rebuilt once a day; no page is built in advance (each one is built on the first visit and cached).
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

type Params = Promise<{ locale: string; country: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale) || !COUNTRY_CODES.has(country.toUpperCase())) return {};
  const list = await getCountryListPage(country, 1);
  return list ? listMetadata(locale, country, 1, list) : {};
}

/** All institutions of a country that are offered to search engines, as plain links (first page). */
export default async function InstitutionsOfCountryPage({ params }: { params: Params }) {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale) || !COUNTRY_CODES.has(country.toUpperCase())) notFound();
  setRequestLocale(locale);
  const list = await getCountryListPage(country, 1);
  if (!list) notFound();
  return <InstitutionListPage locale={locale} country={country} page={1} list={list} />;
}
