import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SideAds } from '@/components/SideAds';
import { TrackedLink } from '@/components/TrackedLink';
import { Link } from '@/i18n/navigation';
import { pickLocalized } from '@/lib/institutions/localized';
import { getScholarships, type Scholarship } from '@/lib/scholarships/get';

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Scholarships' });
  return { title: t('title'), description: t('intro') };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Scholarships');
  const tInst = await getTranslations('Institution');
  const tLevel = await getTranslations('Survey.q.level.options');
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
  const { national, institutional } = await getScholarships();

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
            <ul className="mt-3 space-y-3">
              {national.map((s, i) => (
                <li key={i} className="rounded-lg border border-line bg-surface p-5">
                  <p className="text-sm font-medium uppercase tracking-wide text-muted">{s.country ? (regionNames.of(s.country) ?? s.country) : t('severalCountries')}</p>
                  <h3 className="mt-1 text-lg font-semibold text-text">{pickLocalized(s.names, locale).text}</h3>
                  {pickLocalized(s.funder, locale).text && <p className="text-sm text-muted">{pickLocalized(s.funder, locale).text}</p>}
                  {meta(s) && <p className="mt-2 text-sm font-medium">{meta(s)}</p>}
                  {pickLocalized(s.eligibility, locale).text && <p className="mt-2 text-sm">{pickLocalized(s.eligibility, locale).text}</p>}
                  {s.url && (
                    <TrackedLink href={s.url} meta={{ kind: 'scholarship', ...(s.country ? { country: s.country } : {}) }} className="mt-3 inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:opacity-90">
                      {t('official')}
                    </TrackedLink>
                  )}
                </li>
              ))}
            </ul>
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
