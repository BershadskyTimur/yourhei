import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AuthButton } from './AuthButton';
import { LocaleSwitcher } from './LocaleSwitcher';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const t = useTranslations('Header');

  return (
    <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-[1500px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2">
        <Link href="/" aria-label={t('homeLabel')} className="rounded-xl">
          <Logo />
        </Link>

        <nav aria-label={t('navLabel')} className="order-last flex w-full gap-5 text-sm font-medium md:order-none md:w-auto">
          <Link href="/catalog" className="py-1 underline-offset-4 hover:underline">{t('catalog')}</Link>
          <Link href="/scholarships" className="py-1 underline-offset-4 hover:underline">{t('scholarships')}</Link>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
      <div className="gold-rule" aria-hidden="true" />
    </header>
  );
}
