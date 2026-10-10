import { NextResponse } from 'next/server';

/**
 * For an uptime monitor (UptimeRobot, Better Stack...): answers 200 when the site is up and the database answers,
 * 503 when it does not. It reveals nothing but "ok" and the time the database took.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.json({ ok: true, database: 'not configured' }, { headers: { 'Cache-Control': 'no-store' } });

  const started = Date.now();
  try {
    const res = await fetch(`${url}/rest/v1/countries?select=code&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    const ms = Date.now() - started;
    if (!res.ok) return NextResponse.json({ ok: false, database: res.status, ms }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    return NextResponse.json({ ok: true, ms }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ ok: false, database: 'no answer' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
