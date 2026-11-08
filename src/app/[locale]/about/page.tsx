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
  const t = await getTranslations({ locale, namespace: 'Pages.about' });
  const tSeo = await getTranslations({ locale, namespace: 'Seo' });
  return seoMetadata({ locale, path: '/about', title: tSeo('aboutTitle'), description: trimDescription(t('body')) });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Pages.about');
  return (
    <PageShell title={t('title')}>
      <JsonLd data={aboutPageLd('AboutPage', locale, '/about', t('title'), trimDescription(t('body')))} />
      <JsonLd data={organizationLd(process.env.NEXT_PUBLIC_CONTACT_EMAIL)} />
      <p>{t('body')}</p>
    </PageShell>
  );
}
