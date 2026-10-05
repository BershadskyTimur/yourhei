import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';

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
