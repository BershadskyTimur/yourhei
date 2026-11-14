import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { LoginForm } from '@/components/LoginForm';
import { privatePageMetadata } from '@/lib/seo/private-page';
import { ClientMessages } from '@/i18n/ClientMessages';

// For the visitor, not for search engines: own title, noindex (see src/lib/seo/private-page.ts).
export function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  return privatePageMetadata(params, 'Login', '/login');
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Login');
  return (
    <ClientMessages namespaces={['Login', 'Register.account', 'Register.errors']}>
      <AuthCard title={t('title')}>
        <Suspense>
          <LoginForm />
        </Suspense>
      </AuthCard>
    </ClientMessages>
  );
}
