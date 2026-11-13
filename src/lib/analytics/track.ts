'use client';

import type { EventMeta, EventName } from './events';
import { queueEvent } from './queue';

const CONSENT_KEY = 'yourhei-consent';

/** True only for a visitor who pressed "Accept all" in the cookie banner and has not asked for Do Not Track. */
export function analyticsAllowed(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === 'all' && navigator.doNotTrack !== '1';
  } catch {
    return false;
  }
}

/**
 * The id of this visit, kept in the browser tab - only for a visitor who accepted analytics cookies. Without the
 * consent nothing is stored in the browser and the server tells visits apart by itself (see api/track).
 */
export function visitSession(): string | undefined {
  if (!analyticsAllowed()) return undefined;
  try {
    let id = window.sessionStorage.getItem('yourhei-sid');
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem('yourhei-sid', id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/** Queues one usage event (see src/lib/analytics/events.ts); events are sent in batches. Never throws. */
export function trackEvent(event: EventName, meta: EventMeta) {
  if (typeof window === 'undefined') return;
  queueEvent({ event, meta, path: window.location.pathname, locale: document.documentElement.lang, session: visitSession() });
}
