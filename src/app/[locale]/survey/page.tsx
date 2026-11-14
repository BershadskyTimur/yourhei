import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SideAds } from '@/components/SideAds';
import { SurveyApp } from '@/components/survey/SurveyApp';
import { privatePageMetadata } from '@/lib/seo/private-page';
import { ClientMessages } from '@/i18n/ClientMessages';

// For the visitor, not for search engines: own title, noindex (see src/lib/seo/private-page.ts).
export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return privatePageMetadata(params, 'Survey', '/survey');
}

export default async function SurveyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Survey');
  return (
    <ClientMessages namespaces={['Survey', 'Register.errors']}>
      <SideAds>
      <div className="mx-auto max-w-2xl py-10">
        <h1 className="text-3xl font-semibold text-text">{t('title')}</h1>
        <div className="mt-6">
          <SurveyApp />
        </div>
      </div>
      </SideAds>
    </ClientMessages>
  );
}
