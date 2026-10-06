import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AdminApp } from '@/components/admin/AdminApp';

// The admin panel must not be indexed by search engines.
export const metadata: Metadata = { title: 'Админ-панель — YourHEI', robots: { index: false, follow: false } };

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-text">Админ-панель</h1>
      <div className="mt-6">
        <AdminApp />
      </div>
    </div>
  );
}
