import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';
import { EVENT_NAMES, sanitizeMeta } from '@/lib/analytics/events';

// Records one anonymous page view or usage event (searches, clicks on "apply", matches; only sent by browsers whose visitor pressed "Accept all" in the cookie banner).
// Stored: the page address, language, device type, the visitor's country (from the hosting network, the IP address
// itself is never stored), the referring site and a random per-tab id. No names, no e-mails.

const hits = new Map<string, { n: number; reset: number }>();
const MAX_BODY = 4096;
const LIMIT = 120; // per address per minute: stops a script from filling the table

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
const isDevice = (v: unknown): v is 'mobile' | 'tablet' | 'desktop' => v === 'mobile' || v === 'tablet' || v === 'desktop';

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return new NextResponse(null, { status: 204 });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (tooMany(ip)) return new NextResponse(null, { status: 429 });
  if (BOT.test(request.headers.get('user-agent') ?? '')) return new NextResponse(null, { status: 204 });

  // a real event is a few hundred bytes: refuse anything big before it is read
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY) return new NextResponse(null, { status: 413 });
  let body: Record<string, unknown> | null = null;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY) return new NextResponse(null, { status: 413 });
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const path = typeof body?.path === 'string' ? body.path : '';
  if (!/^\/[A-Za-z0-9/_\-.]*$/.test(path) || path.length > 200) return new NextResponse(null, { status: 400 });
  if (/^\/[a-z]{2}\/admin/.test(path)) return new NextResponse(null, { status: 204 }); // the admin panel is not counted

  // a usage event instead of a page view: only the known events, with their values checked and cut
  const named = typeof body?.event === 'string' ? body.event : 'page_view';
  const isEvent = (EVENT_NAMES as readonly string[]).includes(named);
  const meta = isEvent ? sanitizeMeta(named, body?.meta) : null;
  if (named !== 'page_view' && !meta) return new NextResponse(null, { status: 400 });

  const country = request.headers.get('x-vercel-ip-country')?.toUpperCase() ?? null;
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from('site_events').insert({
    event: meta ? named : 'page_view',
    ...(meta ? { meta } : {}),
    path,
    locale: typeof body?.locale === 'string' ? body.locale.slice(0, 8) : null,
    country: country && /^[A-Z]{2}$/.test(country) ? country : null,
    device: isDevice(body?.device) ? body.device : null,
    referrer: typeof body?.referrer === 'string' && /^[a-z0-9.-]{1,100}$/i.test(body.referrer) ? body.referrer : null,
    session: typeof body?.session === 'string' ? body.session.slice(0, 40) : null,
  });
  if (error) console.error('[track] could not save', error.message);
  return new NextResponse(null, { status: 204 });
}
