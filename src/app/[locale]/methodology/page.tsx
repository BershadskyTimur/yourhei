import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { SOURCES } from '@/lib/institutions/sources';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Methodology' });
  return seoMetadata({ locale, path: '/methodology', title: t('title'), description: trimDescription(t('intro')) });
}

/** Where the data comes from and how it is handled (the trust page). */
export default async function MethodologyPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Methodology');
  const regions = new Intl.DisplayNames([locale], { type: 'region' });
  const shown = Object.entries(SOURCES).filter(([, s]) => s.countries.length > 0 || s.url);

  return (
    <PageShell title={t('title')}>
      <p>{t('intro')}</p>

      <section aria-labelledby="sources-title">
        <h2 id="sources-title" className="text-xl font-semibold text-text">{t('sourcesTitle')}</h2>
        <ul className="mt-3 space-y-3 text-base">
          {shown.map(([key, s]) => (
            <li key={key} className="rounded-lg border border-line bg-surface px-4 py-3">
              <p className="font-medium text-text">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{s.name}</a>
                ) : (
                  s.name
                )}
              </p>
              {s.countries.length > 0 && <p className="text-sm text-muted">{s.countries.map((c) => regions.of(c) ?? c).join(', ')}</p>}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-base">{t('sourcesNote')}</p>
      </section>

      <section aria-labelledby="how-title">
        <h2 id="how-title" className="text-xl font-semibold text-text">{t('howTitle')}</h2>
        <ul className="mt-3 list-disc space-y-2 ps-6 text-base">
          <li>{t('how1')}</li>
          <li>{t('how2')}</li>
          <li>{t('how3')}</li>
        </ul>
      </section>

      <section aria-labelledby="gaps-title">
        <h2 id="gaps-title" className="text-xl font-semibold text-text">{t('gapsTitle')}</h2>
        <ul className="mt-3 list-disc space-y-2 ps-6 text-base">
          <li>{t('gaps1')}</li>
          <li>{t('gaps2')}</li>
        </ul>
      </section>

      <section aria-labelledby="trans-title">
        <h2 id="trans-title" className="text-xl font-semibold text-text">{t('transTitle')}</h2>
        <p className="mt-3 text-base">{t('trans')}</p>
      </section>

      <section aria-labelledby="error-title">
        <h2 id="error-title" className="text-xl font-semibold text-text">{t('errorTitle')}</h2>
        <p className="mt-3 text-base">{t('error')}</p>
        <p className="mt-3">
          <Link href="/contact" className="font-semibold text-accent-text underline underline-offset-4">{t('contact')}</Link>
        </p>
      </section>
    </PageShell>
  );
}
