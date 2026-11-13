'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { queueEvent } from '@/lib/analytics/queue';
import { visitSession } from '@/lib/analytics/track';

function deviceType(): 'mobile' | 'tablet' | 'desktop' {
  const w = window.innerWidth;
  return w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
}

/**
 * Reports every page view to the visit log of the admin panel (see api/track and the privacy policy). The choice in
 * the cookie banner decides only whether a visit id is kept in the browser.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    let referrer: string | null = null;
    try {
      const host = document.referrer ? new URL(document.referrer).hostname : null;
      referrer = host && host !== window.location.hostname ? host : null;
    } catch {
      referrer = null;
    }
    queueEvent({
      path: pathname,
      locale: document.documentElement.lang,
      device: deviceType(),
      referrer,
      session: visitSession(),
      lang: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
    });
  }, [pathname]);

  return null;
}
