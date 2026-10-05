import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Pages.contact');
  return (
    <PageShell title={t('title')}>
      <p>{t('body')}</p>
    </PageShell>
  );
}
