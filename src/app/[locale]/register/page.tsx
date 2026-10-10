import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RegisterWizard } from '@/components/RegisterWizard';

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Register');
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-text">{t('title')}</h1>
      {/* The form appears after the saved draft is read; the reserved height keeps the footer from jumping. */}
      <div className="mt-4 min-h-[70svh]">
        <RegisterWizard />
      </div>
    </div>
  );
}
