'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { AUTH_EVENT } from '@/lib/supabase/auth-event';
import { fetchIsAdmin, resetIsAdmin } from '@/lib/supabase/is-admin';

// While the ad places are not filled with real ads, only administrators see them (the word "Advertisement" and the
// empty frames). This component marks the page with data-ads="on" for an administrator; the style sheet
// (globals.css) hides every ad place and gives the space back to the content for everybody else. Nothing is shown to
// guests or ordinary accounts, not even for a moment, because the places are hidden until the mark is set.
function hasSession(): boolean {
  return document.cookie.split('; ').some((c) => /^sb-.+-auth-token(\.\d+)?=/.test(c));
}
function subscribe(callback: () => void) {
  window.addEventListener(AUTH_EVENT, callback);
  return () => window.removeEventListener(AUTH_EVENT, callback);
}

export function AdsFlag() {
  const signedIn = useSyncExternalStore(subscribe, hasSession, () => false);

  useEffect(() => {
    const root = document.documentElement;
    if (!signedIn) {
      delete root.dataset.ads;
      resetIsAdmin();
      return;
    }
    let cancelled = false;
    fetchIsAdmin().then((admin) => {
      if (cancelled) return;
      if (admin) root.dataset.ads = 'on';
      else delete root.dataset.ads;
    });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  return null;
}
