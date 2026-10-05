'use client';

import { useLocale, useTranslations } from 'next-intl';
import { LOCALES } from '@/config/locales';
import { usePathname, useRouter } from '@/i18n/navigation';

export function LocaleSwitcher() {
  const t = useTranslations('Header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label={t('language')}
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      className="h-10 max-w-[9rem] rounded-full border border-line-strong bg-bg px-3 text-sm text-text"
    >
      {LOCALES.map((l) => (
        <option key={l.code} value={l.code} lang={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
