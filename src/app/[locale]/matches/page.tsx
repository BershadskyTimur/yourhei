import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MatchesApp } from '@/components/matches/MatchesApp';

export default async function MatchesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Matches');
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-brand">{t('title')}</h1>
      <div className="mt-6">
        <MatchesApp />
      </div>
    </div>
  );
}
