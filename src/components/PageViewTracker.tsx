'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const CONSENT_KEY = 'yourhei-consent';

function sessionId(): string {
  try {
    let id = window.sessionStorage.getItem('yourhei-sid');
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem('yourhei-sid', id);
    }
    return id;
  } catch {
    return 'none';
  }
}

function deviceType(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth;
  return w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
}

/**
 * Counts page views for the admin panel - only when the visitor accepted analytics in the cookie banner
 * and has not asked the browser for "Do Not Track".
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let consent: string | null = null;
    try {
      consent = window.localStorage.getItem(CONSENT_KEY);
    } catch {
      /* no storage: no tracking */
    }
    if (consent !== 'all' || navigator.doNotTrack === '1') return;
    let referrer: string | null = null;
    try {
      const host = document.referrer ? new URL(document.referrer).hostname : null;
      referrer = host && host !== window.location.hostname ? host : null;
    } catch {
      referrer = null;
    }
    const body = JSON.stringify({ path: pathname, locale: document.documentElement.lang, device: deviceType(), referrer, session: sessionId() });
    fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  }, [pathname]);

  return null;
}
