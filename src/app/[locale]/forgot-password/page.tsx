import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthCard } from '@/components/AuthCard';
import { ForgotForm } from '@/components/ForgotForm';

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Forgot');
  return (
    <AuthCard title={t('title')}>
      <ForgotForm />
    </AuthCard>
  );
}
