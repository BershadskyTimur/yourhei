import { EVENT_NAMES, sanitizeMeta } from './events';

/** One line of the site_events table. */
export interface EventRow {
  event: string;
  meta?: Record<string, unknown>;
  path: string;
  locale: string | null;
  country: string | null;
  device: 'mobile' | 'tablet' | 'desktop' | null;
  referrer: string | null;
  session: string | null;
}

const isDevice = (v: unknown): v is 'mobile' | 'tablet' | 'desktop' => v === 'mobile' || v === 'tablet' || v === 'desktop';

/** At most this many events in one request (the browser sends them in batches to save server calls). */
export const MAX_EVENTS_PER_REQUEST = 10;

/**
 * Checks one event sent by a browser and turns it into a table row, or returns null when it must be ignored:
 * a bad address, the admin panel (not counted), an unknown event or values that do not pass the checks.
 * Pure function: everything that reaches the database goes through here.
 */
export function eventToRow(body: unknown, country: string | null): EventRow | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  const path = typeof b.path === 'string' ? b.path : '';
  if (!/^\/[A-Za-z0-9/_\-.]*$/.test(path) || path.length > 200) return null;
  if (/^\/[a-z]{2}\/admin/.test(path)) return null;

  // a usage event instead of a page view: only the known events, with their values checked and cut
  const named = typeof b.event === 'string' ? b.event : 'page_view';
  const isEvent = (EVENT_NAMES as readonly string[]).includes(named);
  const meta = isEvent ? sanitizeMeta(named, b.meta) : null;
  if (named !== 'page_view' && !meta) return null;

  return {
    event: meta ? named : 'page_view',
    ...(meta ? { meta } : {}),
    path,
    locale: typeof b.locale === 'string' ? b.locale.slice(0, 8) : null,
    country: country && /^[A-Z]{2}$/.test(country) ? country : null,
    device: isDevice(b.device) ? b.device : null,
    referrer: typeof b.referrer === 'string' && /^[a-z0-9.-]{1,100}$/i.test(b.referrer) ? b.referrer : null,
    session: typeof b.session === 'string' ? b.session.slice(0, 40) : null,
  };
}

/** A request holds one event ({...}) or a batch ({ events: [...] }); returns the valid rows, at most MAX_EVENTS_PER_REQUEST. */
export function rowsFromRequest(body: unknown, country: string | null): EventRow[] {
  const list = typeof body === 'object' && body !== null && Array.isArray((body as { events?: unknown }).events) ? (body as { events: unknown[] }).events : [body];
  return list
    .slice(0, MAX_EVENTS_PER_REQUEST)
    .flatMap((e) => {
      const row = eventToRow(e, country);
      return row ? [row] : [];
    });
}
