import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { AuthButton } from './AuthButton';
import { LocaleSwitcher } from './LocaleSwitcher';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  const t = useTranslations('Header');

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2">
        <Link
          href="/"
          aria-label={t('homeLabel')}
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-brand"
        >
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 rounded-full bg-gold ring-2 ring-accent"
          />
          YourHEI
        </Link>

        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
