import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Pages.terms');
  return (
    <PageShell title={t('title')} banner={t('banner')}>
      <p>{t('body')}</p>
    </PageShell>
  );
}
