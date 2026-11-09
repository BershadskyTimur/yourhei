import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

// Pages that are for a visitor, not for search engines (sign-in, sign-up, password, survey, matches, favourites, comparison,
// profile): they get their own title and "noindex, follow", so that an address like /en/login?next=... does not end up in the
// results with the title of the home page (SEO audit of 9 Nov 2026). The canonical address is the page without its parameters.

type Namespace = 'Login' | 'Register' | 'Forgot' | 'Reset' | 'Survey' | 'Matches' | 'Favorites' | 'Compare' | 'Profile';

export async function privatePageMetadata(params: Promise<{ locale: string }>, namespace: Namespace, path: string): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace });
  return {
    title: `${t('title')} — YourHEI`,
    alternates: { canonical: `/${locale}${path}` },
    robots: { index: false, follow: true },
  };
}
