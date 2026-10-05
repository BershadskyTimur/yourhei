import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PageShell } from './PageShell';

/** Placeholder for pages planned in later stages (sign-in, registration). */
export function ComingSoon() {
  const t = useTranslations('Pages.comingSoon');
  return (
    <PageShell title={t('title')}>
      <p>{t('body')}</p>
      <p>
        <Link href="/" className="font-semibold text-accent-text underline underline-offset-4">
          {t('back')}
        </Link>
      </p>
    </PageShell>
  );
}
