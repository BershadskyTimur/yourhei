import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { SideAds } from '@/components/SideAds';
import { FavoritesApp } from '@/components/FavoritesApp';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Favorites');
  return (
    <SideAds>
      <div className="mx-auto max-w-3xl py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text">{t('title')}</h1>
        <div className="mt-6">
          <Suspense>
            <FavoritesApp />
          </Suspense>
        </div>
      </div>
    </SideAds>
  );
}