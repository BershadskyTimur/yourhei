import { EVENT_NAMES, sanitizeMeta } from './events';
import { NO_GEO, type VisitGeo } from './geo';

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
  /** where the visit comes from (see geo.ts); only present when known */
  region?: string;
  city?: string;
  timezone?: string;
  asn?: number;
  as_org?: string;
  postal?: string;
  lat?: number;
  lon?: number;
  /** who is visiting, as the server sees the request (see VisitClient) */
  ip?: string;
  user_agent?: string;
  browser?: string;
  os?: string;
  /** the browser's language and the screen size, as the browser reports them */
  lang?: string;
  screen?: string;
}

/** What the server itself knows about the sender of a request; never taken from the request body. */
export interface VisitClient {
  ip: string | null;
  userAgent: string | null;
  browser: string | null;
  os: string | null;
  /** used as the visit id when the browser sent none (the visitor did not accept the cookie that keeps it) */
  fallbackSession: string | null;
}

const isDevice = (v: unknown): v is 'mobile' | 'tablet' | 'desktop' => v === 'mobile' || v === 'tablet' || v === 'desktop';

/** At most this many events in one request (the browser sends them in batches to save server calls). */
export const MAX_EVENTS_PER_REQUEST = 10;

/**
 * Checks one event sent by a browser and turns it into a table row, or returns null when it must be ignored:
 * a bad address, the admin panel (not counted), an unknown event or values that do not pass the checks.
 * Pure function: everything that reaches the database goes through here.
 */
export function eventToRow(body: unknown, place: VisitGeo | string | null, client?: VisitClient): EventRow | null {
  const geo: VisitGeo = typeof place === 'string' || place === null ? { ...NO_GEO, country: place } : place;
  const country = geo.country;
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
    session: typeof b.session === 'string' && b.session ? b.session.slice(0, 40) : (client?.fallbackSession?.slice(0, 40) ?? null),
    ...(geo.region ? { region: geo.region } : {}),
    ...(geo.city ? { city: geo.city } : {}),
    ...(geo.timezone ? { timezone: geo.timezone } : {}),
    ...(geo.asn ? { asn: geo.asn } : {}),
    ...(geo.asOrg ? { as_org: geo.asOrg } : {}),
    ...(geo.postal ? { postal: geo.postal } : {}),
    ...(geo.lat !== null && geo.lon !== null ? { lat: geo.lat, lon: geo.lon } : {}),
    ...(client?.ip && /^[0-9A-Fa-f:.]{3,45}$/.test(client.ip) ? { ip: client.ip } : {}),
    ...(client?.userAgent ? { user_agent: client.userAgent.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 300) } : {}),
    ...(client?.browser ? { browser: client.browser.slice(0, 40) } : {}),
    ...(client?.os ? { os: client.os.slice(0, 40) } : {}),
    ...(typeof b.lang === 'string' && /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8}){0,2}$/.test(b.lang) ? { lang: b.lang } : {}),
    ...(typeof b.screen === 'string' && /^\d{2,5}x\d{2,5}$/.test(b.screen) ? { screen: b.screen } : {}),
  };
}

/** A request holds one event ({...}) or a batch ({ events: [...] }); returns the valid rows, at most MAX_EVENTS_PER_REQUEST. */
export function rowsFromRequest(body: unknown, place: VisitGeo | string | null, client?: VisitClient): EventRow[] {
  const list = typeof body === 'object' && body !== null && Array.isArray((body as { events?: unknown }).events) ? (body as { events: unknown[] }).events : [body];
  return list
    .slice(0, MAX_EVENTS_PER_REQUEST)
    .flatMap((e) => {
      const row = eventToRow(e, place, client);
      return row ? [row] : [];
    });
}
