'use client';

import type { ReactNode } from 'react';
import type { EventMeta } from '@/lib/analytics/events';
import { trackEvent } from '@/lib/analytics/track';

/** An outside link (apply, official site) that counts the click anonymously, if the visitor allowed analytics. */
export function TrackedLink({ href, meta, className, children }: { href: string; meta: EventMeta; className?: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => trackEvent('apply_click', meta)}>
      {children}
    </a>
  );
}
