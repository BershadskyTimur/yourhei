'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';

// Languages whose texts were written and read by a person; the others are made with machine help and are being
// reviewed, which the visitor is told once (the notice can be closed and is not shown again in this browser).
const REVIEWED = ['ru', 'en'];
const KEY = 'yourhei-translation-notice-closed';

export function TranslationNotice() {
  const locale = useLocale();
  const t = useTranslations('Common');
  const [closed, setClosed] = useState(true); // hidden until we know (no flash for people who closed it)
  useEffect(() => {
    let value = false;
    try {
      value = window.localStorage.getItem(KEY) === '1';
    } catch {
      /* storage blocked: show the notice each time */
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the browser storage can only happen after mount
    setClosed(value);
  }, []);

  if (REVIEWED.includes(locale) || closed) return null;
  return (
    <div role="note" className="border-b border-line bg-accent-soft">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2 text-sm">
        <p className="min-w-0 flex-1">{t('translationNotice')}</p>
        <Link href="/contact" className="font-semibold text-accent-text underline underline-offset-4">{t('translationReport')}</Link>
        <button
          type="button"
          onClick={() => {
            setClosed(true);
            try {
              window.localStorage.setItem(KEY, '1');
            } catch {
              /* ignore */
            }
          }}
          className="inline-flex h-9 items-center rounded-lg border border-line-strong px-3 font-medium hover:bg-surface-strong"
        >
          {t('dismiss')}
        </button>
      </div>
    </div>
  );
}
