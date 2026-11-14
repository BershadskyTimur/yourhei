'use client';

import { useTranslations } from 'next-intl';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';

const KEY = 'yourhei-consent';
const EVENT = 'yourhei-open-consent';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type Choice = 'all' | 'necessary' | null;

function read(): Choice {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === 'all' || v === 'necessary' ? v : null;
  } catch {
    return null;
  }
}

/** Opens the cookie banner again (used by the "Cookie settings" link in the footer). */
export function openConsentSettings() {
  window.dispatchEvent(new Event(EVENT));
}

/**
 * Cookie banner (SPEC.md section 16). Nothing except necessary cookies is used until the visitor accepts.
 * Analytics (Google Analytics 4, only if NEXT_PUBLIC_GA_ID is set in the environment) loads after "Accept all".
 */
export function ConsentBanner() {
  const t = useTranslations('Consent');
  const [choice, setChoice] = useState<Choice>(null);
  // The banner is part of the page the server sends, so a first-time visitor sees it with the first paint (it is often the
  // largest text on a phone screen, and drawing it only after the scripts made the page's "largest paint" seconds late).
  // For a visitor who has already chosen, a small script in the layout marks <html data-consent> before the first paint
  // and the style sheet hides the banner; `forced` shows it again from the "Cookie settings" link.
  const [open, setOpen] = useState(true);
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const saved = read();
    setChoice(saved); // eslint-disable-line react-hooks/set-state-in-effect
    setOpen(saved === null);
    const reopen = () => {
      setForced(true);
      setOpen(true);
    };
    window.addEventListener(EVENT, reopen);
    return () => window.removeEventListener(EVENT, reopen);
  }, []);

  function save(value: Exclude<Choice, null>) {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      /* private mode: the choice just lasts until the page is closed */
    }
    document.documentElement.dataset.consent = value;
    setChoice(value);
    setOpen(false);
    setForced(false);
  }

  return (
    <>
      {choice === 'all' && GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {open && (
        <div role="region" aria-labelledby="consent-title" data-consent-banner={forced ? 'forced' : 'auto'} className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-lg border border-line-strong bg-bg p-4 shadow-lg sm:p-5">
          <h2 id="consent-title" className="text-base font-semibold text-text">{t('title')}</h2>
          <p className="mt-1 text-sm text-muted">
            {t('text')}{' '}
            <Link href="/privacy" className="underline underline-offset-4">{t('policy')}</Link>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => save('all')} className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:opacity-90">{t('accept')}</button>
            <button type="button" onClick={() => save('necessary')} className="inline-flex h-10 items-center rounded-lg border border-line-strong px-4 text-sm font-medium text-text hover:bg-surface-strong">{t('decline')}</button>
          </div>
        </div>
      )}
    </>
  );
}
