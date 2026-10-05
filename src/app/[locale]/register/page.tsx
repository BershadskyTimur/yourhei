import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RegisterWizard } from '@/components/RegisterWizard';

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Register');
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold text-brand">{t('title')}</h1>
      <div className="mt-4">
        <RegisterWizard />
      </div>
    </div>
  );
}
