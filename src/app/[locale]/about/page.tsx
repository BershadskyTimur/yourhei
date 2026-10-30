import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';
import { routing } from '@/i18n/routing';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Pages.about' });
  return seoMetadata({ locale, path: '/about', title: t('title'), description: trimDescription(t('body')) });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Pages.about');
  return (
    <PageShell title={t('title')}>
      <p>{t('body')}</p>
    </PageShell>
  );
}
