import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AuthCard } from '@/components/AuthCard';
import { ResetForm } from '@/components/ResetForm';
import { privatePageMetadata } from '@/lib/seo/private-page';
import { ClientMessages } from '@/i18n/ClientMessages';

// For the visitor, not for search engines: own title, noindex (see src/lib/seo/private-page.ts).
export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return privatePageMetadata(params, 'Reset', '/reset-password');
}

export default async function ResetPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Reset');
  return (
    <ClientMessages namespaces={['Reset', 'Register.account', 'Register.errors']}>
      <AuthCard title={t('title')}>
        <ResetForm />
      </AuthCard>
    </ClientMessages>
  );
}
