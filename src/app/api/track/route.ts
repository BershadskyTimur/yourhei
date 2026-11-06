import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { geoFromCloudflare } from '@/lib/analytics/geo';
import { rowsFromRequest } from '@/lib/analytics/row';

// Records anonymous page views and usage events (searches, clicks on "apply", matches; only sent by browsers whose
// visitor pressed "Accept all" in the cookie banner). The browser sends them in batches of up to 10.
// Stored: the page address, language, device type, where the visit comes from as the hosting network (Cloudflare) sees
// it - country, region, city, time zone, the provider or company that owns the network (lib/analytics/geo.ts); the IP
// address itself is never stored or sent anywhere - the referring site and a random per-tab id. No names, no e-mails.
// Every value is checked in lib/analytics/row.ts before it reaches the database.

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

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return new NextResponse(null, { status: 204 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (tooMany(ip)) return new NextResponse(null, { status: 429 });
  if (BOT.test(request.headers.get('user-agent') ?? '')) return new NextResponse(null, { status: 204 });

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
  const rows = rowsFromRequest(body, geo);
  if (rows.length === 0) return new NextResponse(null, { status: 204 });

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from('site_events').insert(rows);
  if (error) console.error('[track] could not save', error.message);
  return new NextResponse(null, { status: 204 });
}
