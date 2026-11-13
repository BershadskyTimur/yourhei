import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { accessTokenFromCookies } from '@/lib/analytics/auth-cookie';
import { geoFromCloudflare } from '@/lib/analytics/geo';
import { rowsFromRequest, type EventRow, type VisitClient } from '@/lib/analytics/row';
import { parseUserAgent } from '@/lib/analytics/ua';

// Records page views and usage events (searches, clicks on "apply", matches) of every visitor. The browser sends them
// in batches of up to 10.
// Stored: the page address, language, device type, the referring site, a visit id; the IP address, browser and operating
// system as this server sees the request; and where the visit comes from as the hosting network (Cloudflare) sees it -
// country, region, city, postal code, approximate coordinates, time zone, the provider or company that owns the network
// (lib/analytics/geo.ts). A visit of a signed-in person is linked to the account by the database itself (migration
// 0042): the sign-in token from the cookies is only passed on, never trusted here.
// Every value is checked in lib/analytics/row.ts before it reaches the database. Only an admin can read the table.

const hits = new Map<string, { n: number; reset: number }>();
const MAX_BODY = 8192;
const LIMIT = 60; // requests per address per minute: stops a script from filling the table

function tooMany(ip: string): boolean {
  const now = Date.now();
  const row = hits.get(ip);
  if (!row || row.reset < now) {
    if (hits.size > 5000) hits.clear();
    hits.set(ip, { n: 1, reset: now + 60_000 });
    return false;
  }
  row.n += 1;
  return row.n > LIMIT;
}

const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|monitor|curl|wget/i;

/** A visit id for a browser that sent none: the same address and browser on the same day count as one visit. */
async function fallbackSession(ip: string, userAgent: string): Promise<string | null> {
  try {
    const data = new TextEncoder().encode(`${ip}|${userAgent}|${new Date().toISOString().slice(0, 10)}`);
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', data));
    return 'h' + Array.from(hash.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    return null;
  }
}

// columns added by migrations 0040 and 0042
const NEW_COLUMNS = new Set(['region', 'city', 'timezone', 'asn', 'as_org', 'postal', 'lat', 'lon', 'ip', 'user_agent', 'browser', 'os', 'lang', 'screen']);

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return new NextResponse(null, { status: 204 });

  const ip = (request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0])?.trim() || 'unknown';
  if (tooMany(ip)) return new NextResponse(null, { status: 429 });
  const userAgent = request.headers.get('user-agent') ?? '';
  if (BOT.test(userAgent)) return new NextResponse(null, { status: 204 });

  // a batch is a few kilobytes: refuse anything big before it is read
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) return new NextResponse(null, { status: 413 });
  let body: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return new NextResponse(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  // the site runs on Cloudflare (the old Vercel country header is never sent, so the country used to be empty)
  let cf: Record<string, unknown> | undefined;
  try {
    cf = (await getCloudflareContext<Record<string, unknown>>({ async: true })).cf;
  } catch {
    cf = undefined; // local development: only the header, if any
  }
  const geo = geoFromCloudflare(cf, request.headers.get('cf-ipcountry'));
  const client: VisitClient = {
    ip: ip === 'unknown' ? null : ip,
    userAgent: userAgent || null,
    ...parseUserAgent(userAgent),
    fallbackSession: await fallbackSession(ip, userAgent),
  };
  const rows = rowsFromRequest(body, geo, client);
  if (rows.length === 0) return new NextResponse(null, { status: 204 });

  const save = async (token: string | null) => {
    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}),
    });
    let { error } = await supabase.from('site_events').insert(rows);
    // before migrations 0040 / 0042 the new columns do not exist: save the visit without them rather than lose it
    if (error && /PGRST204|42703/.test(`${error.code}`)) {
      const old = rows.map((r) => Object.fromEntries(Object.entries(r).filter(([k]) => !NEW_COLUMNS.has(k))) as unknown as EventRow);
      ({ error } = await supabase.from('site_events').insert(old));
    }
    return error;
  };

  // a signed-in visitor: the database checks the token and links the visit to the account
  const token = accessTokenFromCookies(request.cookies.getAll(), Math.floor(Date.now() / 1000));
  let error = await save(token);
  if (error && token) error = await save(null); // the token was refused: save the visit without an account
  if (error) console.error('[track] could not save', error.message);
  return new NextResponse(null, { status: 204 });
}
