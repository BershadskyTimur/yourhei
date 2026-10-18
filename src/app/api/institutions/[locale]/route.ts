import { NextResponse } from 'next/server';
import { LOCALE_CODES } from '@/config/locales';

/** The previous address of the map list (/api/institutions/ru): pages that are still open are sent to /api/map-list/ru. */
export async function GET(request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safe = (LOCALE_CODES as readonly string[]).includes(locale) ? locale : 'en';
  return NextResponse.redirect(new URL(`/api/map-list/${safe}`, request.url), 308);
}
