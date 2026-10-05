import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { ProfileEditor } from '@/components/ProfileEditor';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Profile');
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold text-brand">{t('title')}</h1>
      <div className="mt-6">
        <Suspense>
          <ProfileEditor />
        </Suspense>
      </div>
    </div>
  );
}
