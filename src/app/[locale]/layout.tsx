import type { Metadata, Viewport } from 'next';
import {
  IBM_Plex_Sans,
  Noto_Sans_Arabic,
  Noto_Sans_Armenian,
  Noto_Sans_Georgian,
  Noto_Sans_SC,
  Source_Serif_4,
} from 'next/font/google';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ConsentBannerSlot } from '@/components/ConsentBannerSlot';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { AdsFlag } from '@/components/AdsFlag';
import { TranslationNotice } from '@/components/TranslationNotice';
import { PageViewTracker } from '@/components/PageViewTracker';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LOCALES } from '@/config/locales';
import { routing } from '@/i18n/routing';
import { siteUrl } from '@/lib/site-url';
import '../globals.css';

// Latin (incl. Turkish, Azerbaijani, Polish, Uzbek letters) + Cyrillic (incl. Kazakh and Kyrgyz letters), Armenian,
// Georgian (Mkhedruli), Arabic and Simplified Chinese.
const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  weight: ['400', '500', '600'],
  variable: '--font-plex',
  display: 'swap',
});
// Headings: a serif (Latin and Cyrillic; other scripts use the sans stack). Only the weight axis is loaded: the optical-size
// axis made each file about twice as large (200 KB for a Russian page), which is too much for a heading font.
const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-source-serif',
  display: 'swap',
});
const notoGeorgian = Noto_Sans_Georgian({
  subsets: ['georgian'],
  variable: '--font-noto-ka',
  display: 'swap',
  preload: false,
});
const notoArmenian = Noto_Sans_Armenian({
  subsets: ['armenian'],
  variable: '--font-noto-hy',
  display: 'swap',
  preload: false,
});
const notoArabic = Noto_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-noto-ar',
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

// Tells the browser that the site draws both a light and a dark theme itself, so it does not
// darken the pages on its own ("auto dark mode").
export const viewport: Viewport = { colorScheme: 'light dark' };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  // An address that is not a language (/wp-login.php ...) gets the plain 404 page, not an error from the translations.
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Meta' });
  return {
    metadataBase: new URL(siteUrl()),
    title: t('title'),
    description: t('description'),
    // Proof for Yandex.Webmaster that the site is ours (the same code as public/yandex_0df00030df9b8491.html, which
    // Cloudflare answers with a redirect to the address without .html, so Yandex may not accept the file).
    verification: { yandex: '0df00030df9b8491' },
    openGraph: {
      title: t('title'),
      description: t('description'),
      siteName: 'YourHEI',
      locale,
      type: 'website',
      images: [{ url: '/og.png', width: 1200, height: 630, alt: 'YourHEI' }],
    },
    twitter: { card: 'summary_large_image', title: t('title'), description: t('description'), images: ['/og.png'] },
  };
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
    plexSans.variable,
    sourceSerif.variable,
    notoGeorgian.variable,
    notoArmenian.variable,
    notoArabic.variable,
    locale === 'zh' ? notoChinese.variable : '',
  ].join(' ');

  return (
    <html lang={locale} dir={dir} className={fonts} suppressHydrationWarning>
      <body className="flex min-h-svh flex-col">
        {/* Android phones show the interface larger than iPhones: a class on <html> lets the CSS scale it down a little. */}
        <script dangerouslySetInnerHTML={{ __html: "if(/Android/i.test(navigator.userAgent))document.documentElement.classList.add('android')" }} />
        <NextIntlClientProvider>
          <ThemeProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
            >
              {t('skipToContent')}
            </a>
            <Header />
            <TranslationNotice />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <ConsentBannerSlot />
            <AdsFlag />
            <PageViewTracker />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
