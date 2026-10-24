import { JsonLd } from '@/components/JsonLd';
import { breadcrumbList } from '@/lib/seo/structured';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { GUIDES, GUIDE_ACCESSED, guideOf, livingMinimum, type GuideBlock } from '@/lib/countries-guide/guides';
import { pickLocalized } from '@/lib/institutions/localized';
import { combosOfCountry } from '@/lib/study/combos';

type Params = Promise<{ locale: string; country: string }>;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => GUIDES.map((g) => ({ locale, country: g.country.toLowerCase() })));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale) || !guideOf(country)) return {};
  const t = await getTranslations({ locale, namespace: 'Countries' });
  const tSeo = await getTranslations({ locale, namespace: 'Seo' });
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(country.toUpperCase()) ?? country;
  return seoMetadata({ locale, path: `/countries/${country.toLowerCase()}`, title: t('pageTitle', { country: name }), description: trimDescription(tSeo('countryDescription', { country: name })) });
}

function formatMoney(amount: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export default async function CountryPage({ params }: { params: Params }) {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const guide = guideOf(country);
  if (!guide) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Countries');
  const tStudy = await getTranslations('Study');
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(guide.country) ?? guide.country;
  const living = livingMinimum(guide.country);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${GUIDE_ACCESSED}T00:00:00Z`));

  const section = (id: string, title: string, block: GuideBlock | null) => (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-xl font-semibold text-text">{title}</h2>
      {block ? (
        <>
          {block.summary && <p className="mt-2 text-base">{pickLocalized(block.summary, locale).text}</p>}
          <p className="mt-2 text-base">
            <a href={block.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text underline underline-offset-4">{t('officialPage')}</a>
          </p>
        </>
      ) : (
        <p className="mt-2 text-base text-muted">{t('notCollected')}</p>
      )}
    </section>
  );

  return (
    <PageShell title={t('pageTitle', { country: name })}>
      <JsonLd data={breadcrumbList(locale, [{ name: 'YourHEI', path: '' }, { name, path: `/countries/${country.toLowerCase()}` }])} />
      {section('visa-title', t('visaTitle'), guide.visa)}
      {section('work-title', t('workTitle'), guide.work)}
      {section('after-title', t('afterTitle'), guide.after)}

      {living && (
        <section aria-labelledby="living-title">
          <h2 id="living-title" className="text-xl font-semibold text-text">{t('livingTitle')}</h2>
          <p className="mt-2 text-base">{t('livingText', { amount: formatMoney(living.amount, living.currency, locale), year: living.year })}</p>
          <p className="mt-2 text-base">
            <a href={living.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text underline underline-offset-4">{t('officialPage')}</a>
          </p>
        </section>
      )}

      <section aria-labelledby="recognition-title">
        <h2 id="recognition-title" className="text-xl font-semibold text-text">{t('recognitionTitle')}</h2>
        <p className="mt-2 text-base">{t('recognitionText')}</p>
        <p className="mt-2 text-base">
          <a href="https://www.enic-naric.net/" target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text underline underline-offset-4">{t('recognitionLink')}</a>
        </p>
      </section>

      <p className="text-sm text-muted">{t('checked', { date })}</p>
      <p className="flex flex-wrap gap-x-6 gap-y-2 text-base">
        {combosOfCountry(guide.country).length > 0 && (
          <Link href={`/study/${guide.country.toLowerCase()}`} className="font-semibold text-accent-text underline underline-offset-4">{tStudy('hubTitle', { country: name })}</Link>
        )}
        <Link href="/catalog" className="font-semibold text-accent-text underline underline-offset-4">{t('catalogLink')}</Link>
        <Link href="/countries" className="font-semibold text-accent-text underline underline-offset-4">{t('backToList')}</Link>
      </p>
    </PageShell>
  );
}
