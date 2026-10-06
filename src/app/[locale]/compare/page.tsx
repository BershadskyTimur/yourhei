import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { SideAds } from '@/components/SideAds';
import { CompareApp } from '@/components/CompareApp';

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Compare');
  return (
    <SideAds>
      <div className="mx-auto max-w-5xl py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text">{t('title')}</h1>
        <div className="mt-6">
          <Suspense>
            <CompareApp />
          </Suspense>
        </div>
      </div>
    </SideAds>
  );
}