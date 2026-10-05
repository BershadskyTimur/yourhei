import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SurveyApp } from '@/components/survey/SurveyApp';

export default async function SurveyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Survey');
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold text-brand">{t('title')}</h1>
      <div className="mt-6">
        <SurveyApp />
      </div>
    </div>
  );
}
