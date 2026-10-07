import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { CabinetApp } from '@/components/cabinet/CabinetApp';
import { SideAds } from '@/components/SideAds';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Cabinet');
  return (
    <SideAds>
      <div className="mx-auto max-w-3xl py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text">{t('title')}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t('intro')}</p>
        <div className="mt-6">
          <Suspense>
            <CabinetApp />
          </Suspense>
        </div>
      </div>
    </SideAds>
  );
}
