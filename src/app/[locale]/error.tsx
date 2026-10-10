'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';

/** Shown instead of a blank page when something on a page throws. The header and footer stay. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations('ErrorPage');
  useEffect(() => {
    // Visible in the browser console and in the Vercel logs; nothing personal is printed.
    console.error('[page error]', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="text-3xl font-medium tracking-tight text-text sm:text-4xl">{t('title')}</h1>
      <p className="mt-4 text-lg text-muted">{t('text')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-6 font-medium text-on-accent hover:opacity-90"
        >
          {t('retry')}
        </button>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-lg border border-line-strong px-6 font-medium text-text hover:bg-surface-strong"
        >
          {t('home')}
        </Link>
      </div>
    </div>
  );
}
