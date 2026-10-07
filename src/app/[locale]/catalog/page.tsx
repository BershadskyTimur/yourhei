import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { CatalogApp } from '@/components/CatalogApp';
import { SideAds } from '@/components/SideAds';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  return { title: t('title'), description: t('intro') };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Catalog');
  return (
    <SideAds>
      <div className="mx-auto max-w-4xl py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-text">{t('title')}</h1>
        <p className="mt-2 max-w-2xl text-muted">{t('intro')}</p>
        <div className="mt-6">
          <Suspense>
            <CatalogApp />
          </Suspense>
        </div>
      </div>
    </SideAds>
  );
}
