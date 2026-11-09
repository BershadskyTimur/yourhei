import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { SideAds } from '@/components/SideAds';
import { FavoritesApp } from '@/components/FavoritesApp';
import { privatePageMetadata } from '@/lib/seo/private-page';

// For the visitor, not for search engines: own title, noindex (see src/lib/seo/private-page.ts).
export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return privatePageMetadata(params, 'Favorites', '/favorites');
}

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