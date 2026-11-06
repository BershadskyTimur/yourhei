import { JsonLd } from '@/components/JsonLd';
import { breadcrumbList } from '@/lib/seo/structured';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { placeIn } from '@/lib/seo/place';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { GUIDES, GUIDE_ACCESSED, articleSlugsOf, guideOf, livingMinimum, type GuideBlock } from '@/lib/countries-guide/guides';
import { bodyOf, publishedArticles } from '@/lib/blog/posts';
import { countriesWithDeadlines } from '@/lib/deadlines/deadlines';
import { pickText } from '@/lib/institutions/localized';
import { combosOfCountry, fieldSlug } from '@/lib/study/combos';
import { iscedEntry, labelFor } from '@/lib/survey/references';

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
  return seoMetadata({ locale, path: `/countries/${country.toLowerCase()}`, title: t('pageTitle', { country: name, place: placeIn(locale, country, name) }), description: trimDescription(tSeo('countryDescription', { country: name })) });
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
          {block.summary && <p className="mt-2 text-base">{pickText(block.summary, locale).text}</p>}
          <p className="mt-2 text-base">
            <a href={block.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent-text underline underline-offset-4">{t('officialPage')}</a>
          </p>
        </>
      ) : (
        <p className="mt-2 text-base text-muted">{t('notCollected')}</p>
      )}
    </section>
  );

  const topFields = [...combosOfCountry(guide.country)].filter((c) => iscedEntry(c.code)).sort((a, b) => b.programmes - a.programmes).slice(0, 8);
  const hasDeadlines = countriesWithDeadlines().some((c) => c.country === guide.country);
  const published = publishedArticles();
  const articles = articleSlugsOf(guide.country).flatMap((slug) => published.filter((a) => a.slug === slug)).slice(0, 6);

  return (
    <PageShell title={t('pageTitle', { country: name, place: placeIn(locale, guide.country, name) })}>
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

      {/* more about the country on the site: the biggest fields, the application deadlines and the articles */}
      {(topFields.length > 0 || hasDeadlines || articles.length > 0) && (
        <section aria-labelledby="more-title">
          <h2 id="more-title" className="text-xl font-semibold text-text">{t('moreTitle', { country: name, place: placeIn(locale, guide.country, name) })}</h2>
          {topFields.length > 0 && (
            <>
              <h3 className="mt-3 font-semibold text-text">{t('topFields')}</h3>
              <ul className="mt-1 grid gap-x-6 gap-y-1 text-base sm:grid-cols-2">
                {topFields.map((c) => (
                  <li key={c.code}>
                    <Link href={`/study/${guide.country.toLowerCase()}/${fieldSlug(c.code)}`} className="text-accent-text underline underline-offset-4">{labelFor(iscedEntry(c.code)!, locale)}</Link>{' '}
                    <span className="text-muted">({c.programmes})</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {hasDeadlines && (
            <p className="mt-3 text-base">
              <Link href={`/deadlines/${guide.country.toLowerCase()}`} className="font-semibold text-accent-text underline underline-offset-4">{t('deadlinesLink', { country: name, place: placeIn(locale, guide.country, name) })}</Link>
            </p>
          )}
          {articles.length > 0 && (
            <>
              <h3 className="mt-3 font-semibold text-text">{t('articlesTitle')}</h3>
              <ul className="mt-1 list-disc space-y-1 ps-5 text-base">
                {articles.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/blog/${a.slug}`} className="text-accent-text underline underline-offset-4">{bodyOf(a, locale).title}</Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      <p className="text-sm text-muted">{t('checked', { date })}</p>
      <p className="flex flex-wrap gap-x-6 gap-y-2 text-base">
        {combosOfCountry(guide.country).length > 0 && (
          <Link href={`/study/${guide.country.toLowerCase()}`} className="font-semibold text-accent-text underline underline-offset-4">{tStudy('hubTitle', { country: name, place: placeIn(locale, guide.country, name) })}</Link>
        )}
        <Link href="/catalog" className="font-semibold text-accent-text underline underline-offset-4">{t('catalogLink')}</Link>
        <Link href="/countries" className="font-semibold text-accent-text underline underline-offset-4">{t('backToList')}</Link>
      </p>
    </PageShell>
  );
}
