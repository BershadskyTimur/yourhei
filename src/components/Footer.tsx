import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export function Footer() {
  const t = useTranslations('Footer');
  const year = new Date().getFullYear();

  const links = [
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contacts') },
    { href: '/privacy', label: t('privacy') },
    { href: '/terms', label: t('terms') },
  ] as const;

  return (
    <footer className="mt-16 bg-footer text-on-footer">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <nav aria-label={t('navLabel')}>
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="underline-offset-4 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-6 text-sm text-footer-muted">{t('dataCredit')}</p>
        <p className="mt-2 text-sm text-footer-muted">{t('rights', { year })}</p>
      </div>
    </footer>
  );
}
