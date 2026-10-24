import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ChecklistApp } from '@/components/ChecklistApp';
import { JsonLd } from '@/components/JsonLd';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import { breadcrumbList } from '@/lib/seo/structured';

// The same documents the profile asks about (Register.documents.items), in the order they are usually collected.
const DOCUMENTS = ['passport', 'education', 'transcript', 'apostille', 'notarized_translation', 'recognition', 'proof_of_funds', 'health_insurance', 'study_visa', 'parental_consent'] as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Checklist' });
  return seoMetadata({ locale, path: '/checklist', title: t('seoTitle'), description: trimDescription(t('intro')) });
}

export default async function ChecklistPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Checklist');
  const tDoc = await getTranslations('Register.documents.items');

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd data={breadcrumbList(locale, [{ name: 'YourHEI', path: '' }, { name: t('title'), path: '/checklist' }])} />
      <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl">{t('title')}</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{t('intro')}</p>
      <div className="mt-8">
        <ChecklistApp items={DOCUMENTS.map((id) => ({ id, label: tDoc(id) }))} />
      </div>
      <p className="mt-8 rounded-lg border border-line bg-accent-soft px-4 py-3 text-sm text-text">{t('note')}</p>
      <p className="mt-4 text-sm text-muted">
        {t('profileHint')}{' '}
        <Link href="/profile" className="font-semibold text-accent-text underline underline-offset-4">{t('profileLink')}</Link>
      </p>
      <p className="mt-6">
        <Link href="/deadlines" className="inline-flex h-12 items-center rounded-lg bg-accent px-6 text-base font-medium text-on-accent hover:opacity-90">{t('calendarCta')}</Link>
      </p>
    </div>
  );
}
