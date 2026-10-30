import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LegalDocument } from '@/components/LegalDocument';
import { routing } from '@/i18n/routing';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Pages.terms' });
  const tLegal = await getTranslations({ locale, namespace: 'Legal.terms' });
  return seoMetadata({ locale, path: '/terms', title: t('title'), description: trimDescription(tLegal('s1Text')) });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalDocument kind="terms" locale={locale} />;
}
