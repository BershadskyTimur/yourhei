import { setRequestLocale } from 'next-intl/server';
import { LegalDocument } from '@/components/LegalDocument';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LegalDocument kind="terms" locale={locale} />;
}
