import { NextResponse } from 'next/server';
import { LOCALE_CODES } from '@/config/locales';
import { encodeInstitutions } from '@/lib/institutions/compact';
import { getMapInstitutions } from '@/lib/institutions/get';

/**
 * The list of institutions for the map on the home page, in a compact format (see lib/institutions/compact.ts).
 * The answer is cached by the CDN for an hour, so the database is read only a few times an hour.
 * ?locale=ru picks the language of the names that are sent (the original and English names are always included).
 */
export async function GET(request: Request) {
  const asked = new URL(request.url).searchParams.get('locale') ?? 'en';
  const locale = (LOCALE_CODES as readonly string[]).includes(asked) ? asked : 'en';

  const { items, error } = await getMapInstitutions();
  if (error) {
    // Do not let the CDN keep a failure.
    return NextResponse.json({ error: true }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json(encodeInstitutions(items, locale), {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
