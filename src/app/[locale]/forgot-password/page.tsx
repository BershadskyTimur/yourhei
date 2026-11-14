import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthCard } from '@/components/AuthCard';
import { ForgotForm } from '@/components/ForgotForm';
import { privatePageMetadata } from '@/lib/seo/private-page';
import { ClientMessages } from '@/i18n/ClientMessages';

// For the visitor, not for search engines: own title, noindex (see src/lib/seo/private-page.ts).
export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return privatePageMetadata(params, 'Forgot', '/forgot-password');
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Forgot');
  return (
    <ClientMessages namespaces={['Forgot', 'Login', 'Register.errors']}>
      <AuthCard title={t('title')}>
        <ForgotForm />
      </AuthCard>
    </ClientMessages>
  );
}
