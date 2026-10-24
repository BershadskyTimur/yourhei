import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { primaryButton, secondaryButton } from '@/components/forms/ui';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'ForInstitutions' });
  return seoMetadata({ locale, path: '/for-institutions', title: t('title'), description: trimDescription(t('intro')) });
}

/** For universities, colleges and schools: how to take over and keep their own page accurate (the institution account). */
export default async function ForInstitutionsPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('ForInstitutions');
  return (
    <PageShell title={t('title')}>
      <p>{t('intro')}</p>

      <section aria-labelledby="what-title">
        <h2 id="what-title" className="text-xl font-semibold text-text">{t('whatTitle')}</h2>
        <ul className="mt-3 list-disc space-y-2 ps-6 text-base">
          <li>{t('what1')}</li>
          <li>{t('what2')}</li>
          <li>{t('what3')}</li>
        </ul>
      </section>

      <section aria-labelledby="how-title">
        <h2 id="how-title" className="text-xl font-semibold text-text">{t('howTitle')}</h2>
        <ol className="mt-3 list-decimal space-y-2 ps-6 text-base">
          <li>{t('how1')}</li>
          <li>{t('how2')}</li>
          <li>{t('how3')}</li>
        </ol>
        <p className="mt-5 flex flex-wrap gap-3">
          <Link href="/#map" className={primaryButton}>{t('findCta')}</Link>
          <Link href="/cabinet" className={secondaryButton}>{t('cabinetCta')}</Link>
        </p>
      </section>

      <p className="text-base">
        {t('contactText')}{' '}
        <Link href="/contact" className="font-semibold text-accent-text underline underline-offset-4">{t('contactCta')}</Link>
      </p>
    </PageShell>
  );
}
