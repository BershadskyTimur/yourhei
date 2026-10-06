import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import { SideAds } from '@/components/SideAds';
import { ProfileEditor } from '@/components/ProfileEditor';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Profile');
  return (
    <SideAds>
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="text-3xl font-semibold text-text">{t('title')}</h1>
      <div className="mt-6">
        <Suspense>
          <ProfileEditor />
        </Suspense>
      </div>
    </div>
    </SideAds>
  );
}
