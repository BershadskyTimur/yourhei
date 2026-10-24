import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ScholarshipBrowser } from '@/components/ScholarshipBrowser';
import { SideAds } from '@/components/SideAds';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { pickLocalized } from '@/lib/institutions/localized';
import { getScholarships, type Scholarship } from '@/lib/scholarships/get';

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Scholarships' });
  return seoMetadata({ locale, path: '/scholarships', title: t('title'), description: trimDescription(t('intro')) });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Scholarships');
  const tInst = await getTranslations('Institution');
  const tLevel = await getTranslations('Survey.q.level.options');
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
  const { national, institutional } = await getScholarships();

  const levelLabels = Object.fromEntries(['bachelor', 'master', 'phd'].filter((l) => tLevel.has(l as 'bachelor')).map((l) => [l, tLevel(l as 'bachelor')]));
  const meta = (s: Scholarship) =>
    [
      s.covers && tInst.has(`covers.${s.covers}` as 'covers.full') ? tInst(`covers.${s.covers}` as 'covers.full') : null,
      s.levels.length ? s.levels.map((l) => (tLevel.has(l as 'bachelor') ? tLevel(l as 'bachelor') : l)).join(', ') : null,
    ]
      .filter(Boolean)
      .join(' · ');

  return (
    <SideAds>
      <div className="mx-auto max-w-3xl py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text">{t('title')}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t('intro')}</p>

        <section className="mt-8" aria-labelledby="national-title">
          <h2 id="national-title" className="text-xl font-semibold text-text">{t('nationalTitle')}</h2>
          {national.length === 0 ? (
            <p className="mt-3 rounded-lg border border-line bg-surface p-5">{t('empty')}</p>
          ) : (
            <ScholarshipBrowser
              levelLabels={levelLabels}
              items={national.map((s) => ({
                id: s.id,
                country: s.country,
                countryLabel: s.country ? (regionNames.of(s.country) ?? s.country) : t('severalCountries'),
                name: pickLocalized(s.names, locale).text,
                funder: pickLocalized(s.funder, locale).text,
                meta: meta(s),
                eligibility: pickLocalized(s.eligibility, locale).text,
                url: s.url,
                levels: s.levels,
                eligibleCountries: s.eligibleCountries,
              }))}
            />
          )}
        </section>

        {institutional.length > 0 && (
          <section className="mt-10" aria-labelledby="inst-title">
            <h2 id="inst-title" className="text-xl font-semibold text-text">{t('institutionalTitle')}</h2>
            <ul className="mt-3 space-y-2">
              {institutional.map((s, i) => (
                <li key={i} className="rounded-lg border border-line bg-surface px-4 py-3">
                  <p>
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-text underline underline-offset-4">{pickLocalized(s.names, locale).text}</a>
                    ) : (
                      <span className="font-medium">{pickLocalized(s.names, locale).text}</span>
                    )}
                    {meta(s) && <span className="text-muted"> — {meta(s)}</span>}
                  </p>
                  {s.institution && (
                    <p className="text-sm">
                      <Link href={`/institutions/${s.institution.country.toLowerCase()}/${s.institution.slug}`} className="underline-offset-4 hover:underline">
                        {pickLocalized(s.institution.names, locale).text}
                      </Link>
                      <span className="text-muted"> · {regionNames.of(s.institution.country) ?? s.institution.country}</span>
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-8 text-sm text-muted">{t('disclaimer')}</p>
      </div>
    </SideAds>
  );
}
