'use client';

import type { EventMeta, EventName } from './events';
import { queueEvent } from './queue';

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

/** Queues one anonymous usage event (see src/lib/analytics/events.ts); events are sent in batches. Never throws. */
export function trackEvent(event: EventName, meta: EventMeta) {
  if (typeof window === 'undefined' || !analyticsAllowed()) return;
  queueEvent({ event, meta, path: window.location.pathname, locale: document.documentElement.lang, session: sessionId() });
}
