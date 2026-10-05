import type { Metadata } from 'next';
import { Noto_Sans, Noto_Sans_Georgian, Noto_Sans_SC } from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ConsentBannerSlot } from '@/components/ConsentBannerSlot';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LOCALES } from '@/config/locales';
import { routing } from '@/i18n/routing';
import '../globals.css';

// Latin + Cyrillic, Georgian (Mkhedruli) and Simplified Chinese (SPEC.md section 3).
const notoSans = Noto_Sans({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-noto',
  display: 'swap',
});
const notoGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian'],
  variable: '--font-noto-ka',
  display: 'swap',
  preload: false,
});
// Chinese is large: it is applied to the page only on /zh, and never preloaded.
const notoChinese = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-noto-sc',
  display: 'swap',
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return { title: t('title'), description: t('description') };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations('Common');
  const dir = LOCALES.find((l) => l.code === locale)?.dir ?? 'ltr';
  const fonts = [
    notoSans.variable,
    notoGeorgian.variable,
    locale === 'zh' ? notoChinese.variable : '',
  ].join(' ');

  return (
    <html lang={locale} dir={dir} className={fonts} suppressHydrationWarning>
      <body className="flex min-h-svh flex-col">
        <NextIntlClientProvider>
          <ThemeProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
            >
              {t('skipToContent')}
            </a>
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <ConsentBannerSlot />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
