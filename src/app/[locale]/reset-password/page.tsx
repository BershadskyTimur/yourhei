import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthCard } from '@/components/AuthCard';
import { ResetForm } from '@/components/ResetForm';

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Reset');
  return (
    <AuthCard title={t('title')}>
      <ResetForm />
    </AuthCard>
  );
}
