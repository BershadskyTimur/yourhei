import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DeadlineList } from '@/components/DeadlineList';
import { JsonLd } from '@/components/JsonLd';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { DEADLINES_BUILT, monthsOfCountry, ofMonth } from '@/lib/deadlines/deadlines';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import { breadcrumbList } from '@/lib/seo/structured';

export const revalidate = 86400;

// No month page is built in advance (a country has about 15 months and there are 16 languages): each page is built on the first
// visit and kept for a day. A month without deadlines (or already over) is "not found".
export function generateStaticParams() {
  return [];
}

type Params = Promise<{ locale: string; country: string; month: string }>;

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, country, month } = await params;
  const rows = MONTH.test(month) ? ofMonth(country, month) : [];
  if (!hasLocale(routing.locales, locale) || rows.length === 0) return {};
  const t = await getTranslations({ locale, namespace: 'Deadlines' });
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(country.toUpperCase()) ?? country;
  const label = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${month}-01T00:00:00Z`));
  const institutions = new Set(rows.map((r) => r.s)).size;
  return seoMetadata({
    locale,
    path: `/deadlines/${country.toLowerCase()}/${month}`,
    title: `${t('countryTitle', { country: name })}: ${label}`,
    description: trimDescription(t('countryIntro', { country: name, count: rows.length, institutions })),
  });
}

export default async function DeadlinesMonthPage({ params }: { params: Params }) {
  const { locale, country, month } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const rows = MONTH.test(month) ? ofMonth(country, month) : [];
  if (rows.length === 0) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Deadlines');
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(country.toUpperCase()) ?? country;
  const fmt = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });
  const code = country.toLowerCase();
  const label = fmt.format(new Date(`${month}-01T00:00:00Z`));
  const institutions = new Set(rows.map((r) => r.s)).size;
  const months = monthsOfCountry(country);
  const at = months.findIndex((m) => m.month === month);
  const prev = at > 0 ? months[at - 1] : null;
  const next = at >= 0 && at < months.length - 1 ? months[at + 1] : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={breadcrumbList(locale, [
          { name: 'YourHEI', path: '' },
          { name: t('title'), path: '/deadlines' },
          { name, path: `/deadlines/${code}` },
          { name: label, path: `/deadlines/${code}/${month}` },
        ])}
      />
      <p className="text-sm">
        <Link href={`/deadlines/${code}`} className="font-semibold text-accent-text underline underline-offset-4">← {name}</Link>
      </p>
      <h1 className="mt-4 text-3xl font-semibold capitalize tracking-tight text-text sm:text-4xl">{t('countryTitle', { country: name })}: {label}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{t('countryIntro', { country: name, count: rows.length, institutions })}</p>
      <p className="mt-4 rounded-lg border border-line bg-accent-soft px-4 py-3 text-sm text-text">{t('note')}</p>

      <div className="mt-8">
        <DeadlineList rows={rows} locale={locale} />
      </div>

      <nav className="mt-8 flex flex-wrap justify-between gap-3 text-base" aria-label={t('byMonthTitle')}>
        {prev ? (
          <Link href={`/deadlines/${code}/${prev.month}`} className="font-semibold capitalize text-accent-text underline underline-offset-4">← {fmt.format(new Date(`${prev.month}-01T00:00:00Z`))}</Link>
        ) : <span />}
        {next && (
          <Link href={`/deadlines/${code}/${next.month}`} className="font-semibold capitalize text-accent-text underline underline-offset-4">{fmt.format(new Date(`${next.month}-01T00:00:00Z`))} →</Link>
        )}
      </nav>

      <p className="mt-8 text-sm text-muted">{t('checkedAt', { date: date.format(new Date(`${DEADLINES_BUILT}T00:00:00Z`)) })}</p>
    </div>
  );
}
