import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SideAds } from '@/components/SideAds';
import { MatchesApp } from '@/components/matches/MatchesApp';

export default async function MatchesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Matches');
  return (
    <SideAds>
    <div className="mx-auto max-w-3xl py-10">
      <h1 className="text-3xl font-semibold tracking-tight text-text">{t('title')}</h1>
      <div className="mt-6">
        <MatchesApp />
      </div>
    </div>
    </SideAds>
  );
}
