'use client';

import type { EventMeta, EventName } from './events';

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

/** True only for a visitor who pressed "Accept all" in the cookie banner and has not asked for Do Not Track. */
export function analyticsAllowed(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === 'all' && navigator.doNotTrack !== '1';
  } catch {
    return false;
  }
}

/** Sends one anonymous usage event (see src/lib/analytics/events.ts). Never throws and never waits for the answer. */
export function trackEvent(event: EventName, meta: EventMeta) {
  if (typeof window === 'undefined' || !analyticsAllowed()) return;
  const body = JSON.stringify({ event, meta, path: window.location.pathname, locale: document.documentElement.lang, session: sessionId() });
  fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
}
