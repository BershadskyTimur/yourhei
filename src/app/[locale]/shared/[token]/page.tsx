import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SharedMatches } from '@/components/matches/SharedMatches';
import { SideAds } from '@/components/SideAds';

// A secret link: search engines must not list it.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Shared');
  return (
    <SideAds>
      <div className="mx-auto max-w-3xl py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text">{t('title')}</h1>
        <div className="mt-6">
          <SharedMatches token={token} />
        </div>
      </div>
    </SideAds>
  );
}
