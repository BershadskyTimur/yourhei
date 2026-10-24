import { defineRouting } from 'next-intl/routing';
import { DEFAULT_LOCALE, LOCALE_CODES } from '@/config/locales';

export const routing = defineRouting({
  locales: LOCALE_CODES as unknown as string[],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
  // The links between language versions (hreflang) are written by lib/seo/metadata.ts, for the languages offered to search engines only.
  alternateLinks: false,
});
