import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { SideAds } from '@/components/SideAds';
import { CompareApp } from '@/components/CompareApp';
import { privatePageMetadata } from '@/lib/seo/private-page';
import { ClientMessages } from '@/i18n/ClientMessages';

// For the visitor, not for search engines: own title, noindex (see src/lib/seo/private-page.ts).
export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return privatePageMetadata(params, 'Compare', '/compare');
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Compare');
  return (
    <ClientMessages namespaces={['Compare', 'Institution', 'Matches.card', 'Register.documents.items', 'Survey.q.level.options']}>
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
    </ClientMessages>
  );
}