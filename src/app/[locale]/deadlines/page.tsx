import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { DeadlineList } from '@/components/DeadlineList';
import { JsonLd } from '@/components/JsonLd';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { DEADLINES_BUILT, closingSoon, countriesWithDeadlines } from '@/lib/deadlines/deadlines';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import { breadcrumbList } from '@/lib/seo/structured';

// "Closing in the next 30 days" changes every day: the page is rebuilt once a day.
export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Deadlines' });
  return seoMetadata({ locale, path: '/deadlines', title: t('seoTitle'), description: trimDescription(t('intro')) });
}

export default async function DeadlinesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Deadlines');
  const regions = new Intl.DisplayNames([locale], { type: 'region' });
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });
  const countries = countriesWithDeadlines();
  const soon = closingSoon(30).slice(0, 30);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={breadcrumbList(locale, [{ name: 'YourHEI', path: '' }, { name: t('title'), path: '/deadlines' }])} />
      <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">{t('title')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{t('intro')}</p>

      <section className="mt-8" aria-labelledby="countries-title">
        <h2 id="countries-title" className="text-2xl font-semibold text-text">{t('countriesTitle')}</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {countries.map((c) => (
            <li key={c.country}>
              <Link href={`/deadlines/${c.country.toLowerCase()}`} className="block rounded-lg border border-line bg-surface p-4 hover:bg-surface-strong sm:p-5">
                <span className="block text-lg font-semibold text-text">{regions.of(c.country) ?? c.country}</span>
                <span className="mt-1 block text-sm text-muted">
                  {t('countryCount', { count: c.count, institutions: c.institutions, date: date.format(new Date(`${c.next}T00:00:00Z`)) })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10" aria-labelledby="soon-title">
        <h2 id="soon-title" className="text-2xl font-semibold text-text">{t('soonTitle')}</h2>
        <div className="mt-3">
          {soon.length > 0 ? <DeadlineList rows={soon} locale={locale} showCountry /> : <p className="rounded-lg border border-line bg-surface p-5">{t('nothingSoon')}</p>}
        </div>
      </section>

      <p className="mt-8 rounded-lg border border-line bg-accent-soft px-4 py-3 text-sm text-text">{t('note')}</p>
      <p className="mt-3 text-sm text-muted">{t('checkedAt', { date: date.format(new Date(`${DEADLINES_BUILT}T00:00:00Z`)) })}</p>
      <p className="mt-6">
        <Link href="/checklist" className="inline-flex h-12 items-center rounded-lg bg-accent px-6 text-base font-medium text-on-accent hover:opacity-90">{t('checklistCta')}</Link>
      </p>
    </div>
  );
}
