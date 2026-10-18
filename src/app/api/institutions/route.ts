import { NextResponse } from 'next/server';
import { LOCALE_CODES } from '@/config/locales';

/** The old address (/api/institutions?locale=ru): browsers that still have an old page open are sent to the new one. */
export function GET(request: Request) {
  const url = new URL(request.url);
  const asked = url.searchParams.get('locale') ?? 'en';
  const locale = (LOCALE_CODES as readonly string[]).includes(asked) ? asked : 'en';
  return NextResponse.redirect(new URL(`/api/map-list/${locale}`, url), 308);
}
