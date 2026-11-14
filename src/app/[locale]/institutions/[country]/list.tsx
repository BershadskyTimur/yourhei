import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { fitTitle, seoMetadata, trimDescription } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/JsonLd';
import { PageShell } from '@/components/PageShell';
import { Link } from '@/i18n/navigation';
import { pickLocalized } from '@/lib/institutions/localized';
import type { CountryListPage } from '@/lib/institutions/country-list';
import { placeIn } from '@/lib/seo/place';
import { breadcrumbList } from '@/lib/seo/structured';
import { combosOfCountry } from '@/lib/study/combos';

/** Where page `page` of a country's list lives: the first page at /institutions/<country>, the others at …/p/<n>. */
export const listPath = (country: string, page: number): string => `/institutions/${country.toLowerCase()}${page > 1 ? `/p/${page}` : ''}`;

/** Title, description, canonical and hreflang of page `page` of a country's list. */
export async function listMetadata(locale: string, country: string, page: number, list: CountryListPage): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'InstitutionsList' });
  const cc = country.toUpperCase();
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(cc) ?? cc;
  const place = placeIn(locale, cc, name);
  const full = t('countrySeoTitle', { place, count: list.total });
  const short = t('countryTitle', { place });
  return seoMetadata({
    locale,
    path: listPath(cc, page),
    title: page > 1 ? fitTitle([t('pageTitle', { title: full, page }), t('pageTitle', { title: short, page })]) : fitTitle([full, short]),
    description: trimDescription(t('countryIntro', { count: list.total, place })),
  });
}

/** One page of "institutions of a country" (shared by /institutions/<country> and /institutions/<country>/p/<n>). */
export async function InstitutionListPage({ locale, country, page, list }: { locale: string; country: string; page: number; list: CountryListPage }) {
  const t = await getTranslations({ locale, namespace: 'InstitutionsList' });
  const tStudy = await getTranslations({ locale, namespace: 'Study' });
  const cc = country.toUpperCase();
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(cc) ?? cc;
  const place = placeIn(locale, cc, name);
  const base = t('countryTitle', { place });
  const title = page > 1 ? t('pageTitle', { title: base, page }) : base;
  const hasFields = combosOfCountry(cc).length > 0;

  return (
    <PageShell title={title}>
      <JsonLd
        data={breadcrumbList(locale, [
          { name: 'YourHEI', path: '' },
          { name: t('indexTitle'), path: '/institutions' },
          { name, path: listPath(cc, 1) },
          ...(page > 1 ? [{ name: title, path: listPath(cc, page) }] : []),
        ])}
      />
      <p>{t('countryIntro', { count: list.total, place })}</p>

      {/* The padding of a link makes it taller to the finger without moving the lines; the gap keeps two links from overlapping. */}
      <ul className="grid gap-x-6 gap-y-2 text-base sm:grid-cols-2">
        {list.items.map((i) => {
          const city = pickLocalized(i.city, locale).text;
          return (
            <li key={i.slug}>
              <Link href={`/institutions/${cc.toLowerCase()}/${i.slug}`} className="py-1 text-accent-text underline underline-offset-4">
                {pickLocalized(i.names, locale).text}
              </Link>
              {city && <span className="text-muted"> · {city}</span>}
            </li>
          );
        })}
      </ul>

      {list.pages > 1 && (
        <nav className="mt-8 flex flex-wrap justify-between gap-3 text-base" aria-label={t('pagesLabel')}>
          {page > 1 ? (
            <Link href={listPath(cc, page - 1)} className="font-semibold text-accent-text underline underline-offset-4">{t('prev', { page: page - 1 })}</Link>
          ) : <span />}
          {page < list.pages && (
            <Link href={listPath(cc, page + 1)} className="font-semibold text-accent-text underline underline-offset-4">{t('next', { page: page + 1 })}</Link>
          )}
          {/* every page by its number: an institution on page 17 is two links from the first page, not seventeen */}
          <ol className="flex w-full flex-wrap gap-x-1 gap-y-1">
            {Array.from({ length: list.pages }, (_, i) => i + 1).map((n) => (
              <li key={n}>
                {n === page ? (
                  <span aria-current="page" className="inline-block min-w-10 px-1 py-2 text-center font-semibold text-text">{n}</span>
                ) : (
                  <Link href={listPath(cc, n)} className="inline-block min-w-8 px-1 py-1 text-center font-semibold text-accent-text underline underline-offset-4">{n}</Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <p className="flex flex-wrap gap-x-6 gap-y-2 text-base">
        <Link href="/institutions" className="font-semibold text-accent-text underline underline-offset-4">{t('allCountries')}</Link>
        {hasFields && (
          <Link href={`/study/${cc.toLowerCase()}`} className="font-semibold text-accent-text underline underline-offset-4">{tStudy('allFields', { country: name })}</Link>
        )}
      </p>
    </PageShell>
  );
}
