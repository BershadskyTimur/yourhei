import { NextResponse } from 'next/server';
import { LOCALE_CODES } from '@/config/locales';
import { getCompactPoints } from '@/lib/institutions/summaries';

/**
 * The list of institutions for the map on the home page, in a compact format (see lib/institutions/compact.ts),
 * one answer per language: /api/institutions/ru, /api/institutions/en ...
 * It is built in advance and rebuilt every six hours like a page, so the database is read a few times a day and a
 * visitor gets a ready file. It lists ALL institutions (cards and base data). The names of the visitor's language, English and the original are included.
 */
export const revalidate = 21600;
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALE_CODES.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const data = await getCompactPoints(locale);
  if (!data) return NextResponse.json({ error: true }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json(data);
}
