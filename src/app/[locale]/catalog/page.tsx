import { JsonLd } from '@/components/JsonLd';
import { topLevelCrumbs } from '@/lib/seo/structured';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { CatalogApp } from '@/components/CatalogApp';
import { SideAds } from '@/components/SideAds';
import { ClientMessages } from '@/i18n/ClientMessages';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  return seoMetadata({ locale, path: '/catalog', title: t('seoTitle'), description: trimDescription(t('intro')) });
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Catalog');
  return (
    <ClientMessages namespaces={['Catalog', 'Types', 'Institution', 'Survey.q.level.options', 'Register.errors']}>
      <SideAds>
        {/* The results arrive after the page: the reserved height keeps the footer from jumping down when they do. */}
        <div className="mx-auto min-h-[110svh] max-w-4xl py-10">
          <JsonLd data={topLevelCrumbs(locale, t('heading'), '/catalog')} />
          <h1 className="text-3xl font-semibold tracking-tight text-text">{t('heading')}</h1>
          <p className="mt-2 max-w-2xl text-muted">{t('intro')}</p>
          <div className="mt-6">
            <Suspense>
              <CatalogApp />
            </Suspense>
          </div>
        </div>
      </SideAds>
    </ClientMessages>
  );
}
