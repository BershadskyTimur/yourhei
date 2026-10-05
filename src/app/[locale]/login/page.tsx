import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { LoginForm } from '@/components/LoginForm';

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Login');
  return (
    <AuthCard title={t('title')}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
