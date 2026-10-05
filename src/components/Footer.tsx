import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Logo } from './Logo';

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
      <div className="gold-rule" aria-hidden="true" />
      <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-10 md:grid-cols-[1fr_auto]">
        <div>
          <Logo size={36} />
          <p className="mt-3 max-w-md text-sm text-footer-muted">{t('tagline')}</p>
        </div>
        <nav aria-label={t('navLabel')}>
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8">
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-medium underline-offset-4 hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="text-sm text-footer-muted md:col-span-2">{t('dataCredit')}</p>
        <p className="text-sm text-footer-muted md:col-span-2">{t('rights', { year })}</p>
      </div>
    </footer>
  );
}
