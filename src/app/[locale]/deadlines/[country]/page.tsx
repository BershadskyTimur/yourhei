import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DeadlineList } from '@/components/DeadlineList';
import { JsonLd } from '@/components/JsonLd';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { DEADLINES_BUILT, byMonth, countriesWithDeadlines, ofCountry } from '@/lib/deadlines/deadlines';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import { breadcrumbList } from '@/lib/seo/structured';

export const revalidate = 86400;

// The countries that have deadlines in the data; any other address is "not found".
export function generateStaticParams() {
  return routing.locales.flatMap((locale) => countriesWithDeadlines().map((c) => ({ locale, country: c.country.toLowerCase() })));
}
export const dynamicParams = false;

type Params = Promise<{ locale: string; country: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, country } = await params;
  const rows = ofCountry(country);
  if (!hasLocale(routing.locales, locale) || rows.length === 0) return {};
  const t = await getTranslations({ locale, namespace: 'Deadlines' });
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(country.toUpperCase()) ?? country;
  const institutions = new Set(rows.map((r) => r.s)).size;
  return seoMetadata({
    locale,
    path: `/deadlines/${country.toLowerCase()}`,
    title: t('countryTitle', { country: name }),
    description: trimDescription(t('countryIntro', { country: name, count: rows.length, institutions })),
  });
}

export default async function DeadlinesCountryPage({ params }: { params: Params }) {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const rows = ofCountry(country);
  if (rows.length === 0) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Deadlines');
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(country.toUpperCase()) ?? country;
  const month = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });
  const institutions = new Set(rows.map((r) => r.s)).size;
  const groups = byMonth(rows);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={breadcrumbList(locale, [{ name: 'YourHEI', path: '' }, { name: t('title'), path: '/deadlines' }, { name, path: `/deadlines/${country.toLowerCase()}` }])} />
      <p className="text-sm">
        <Link href="/deadlines" className="font-semibold text-accent-text underline underline-offset-4">← {t('backToAll')}</Link>
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-text sm:text-4xl">{t('countryTitle', { country: name })}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{t('countryIntro', { country: name, count: rows.length, institutions })}</p>
      <p className="mt-4 rounded-lg border border-line bg-accent-soft px-4 py-3 text-sm text-text">{t('note')}</p>

      {groups.map((g) => (
        <section key={g.month} className="mt-10" aria-labelledby={`m-${g.month}`}>
          <h2 id={`m-${g.month}`} className="scroll-mt-28 text-2xl font-semibold capitalize text-text">{month.format(new Date(`${g.month}-01T00:00:00Z`))}</h2>
          <div className="mt-3">
            <DeadlineList rows={g.rows} locale={locale} />
          </div>
        </section>
      ))}

      <p className="mt-8 text-sm text-muted">{t('checkedAt', { date: date.format(new Date(`${DEADLINES_BUILT}T00:00:00Z`)) })}</p>
      <p className="mt-6">
        <Link href="/checklist" className="inline-flex h-12 items-center rounded-lg bg-accent px-6 text-base font-medium text-on-accent hover:opacity-90">{t('checklistCta')}</Link>
      </p>
    </div>
  );
}
