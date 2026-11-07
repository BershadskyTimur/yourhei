import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/JsonLd';
import { PageShell } from '@/components/PageShell';
import { routing } from '@/i18n/routing';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import { aboutPageLd, organizationLd } from '@/lib/seo/structured';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Pages.contact' });
  const tSeo = await getTranslations({ locale, namespace: 'Seo' });
  return seoMetadata({ locale, path: '/contact', title: tSeo('contactTitle'), description: trimDescription(t('body')) });
}

// The contact address is set in .env.local (NEXT_PUBLIC_CONTACT_EMAIL), so it is never written in the code.
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Pages.contact');
  return (
    <PageShell title={t('title')}>
      <JsonLd data={aboutPageLd('ContactPage', locale, '/contact', t('title'), trimDescription(t('body')))} />
      <JsonLd data={organizationLd(EMAIL)} />
      <p>{t('body')}</p>
      {EMAIL && (
        <p>
          {t('emailLabel')}:{' '}
          <a href={`mailto:${EMAIL}`} className="font-semibold text-accent-text underline underline-offset-4">
            {EMAIL}
          </a>
        </p>
      )}
    </PageShell>
  );
}
