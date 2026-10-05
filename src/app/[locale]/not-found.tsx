import { useTranslations } from 'next-intl';
import { PageShell } from '@/components/PageShell';
import { Link } from '@/i18n/navigation';

export default function NotFound() {
  const t = useTranslations('Pages.notFound');
  return (
    <PageShell title={t('title')}>
      <p>{t('body')}</p>
      <p>
        <Link href="/" className="font-semibold text-accent-text underline underline-offset-4">
          {t('home')}
        </Link>
      </p>
    </PageShell>
  );
}
