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
