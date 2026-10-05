import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageShell } from '@/components/PageShell';

// The contact address is set in .env.local (NEXT_PUBLIC_CONTACT_EMAIL), so it is never written in the code.
const EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Pages.contact');
  return (
    <PageShell title={t('title')}>
      <p>{t('body')}</p>
      {EMAIL && (
        <p>
          {t('emailLabel')}:{' '}
          <a href={`mailto:${EMAIL}`} className="font-semibold text-accent-text underline underline-offset-4">
            {EMAIL}
          </a>
        </p>
      )}
    </PageShell>
  );
}
