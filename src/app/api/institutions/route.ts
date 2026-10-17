import { NextResponse } from 'next/server';
import { LOCALE_CODES } from '@/config/locales';
import { getCompactPoints } from '@/lib/institutions/summaries';

/**
 * The list of institutions for the map on the home page, in a compact format (see lib/institutions/compact.ts).
 * The answer is cached by the CDN for six hours (and served stale for a week while it is refreshed), so the
 * database is read only a few times a day, and then only the compact list (database function map_points).
 * ?locale=ru picks the language of the names that are sent (the original and English names are always included).
 */
export async function GET(request: Request) {
  const asked = new URL(request.url).searchParams.get('locale') ?? 'en';
  const locale = (LOCALE_CODES as readonly string[]).includes(asked) ? asked : 'en';

  const data = await getCompactPoints(locale);
  if (!data) {
    // Do not let the CDN keep a failure.
    return NextResponse.json({ error: true }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=604800' },
  });
}
