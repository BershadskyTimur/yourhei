import { NextResponse } from 'next/server';
import { LOCALE_CODES } from '@/config/locales';
import { getCompactPoints } from '@/lib/institutions/summaries';

/**
 * The list of institutions for the map on the home page, in a compact format (see lib/institutions/compact.ts),
 * one answer per language: /api/map-list/ru, /api/map-list/en ...
 * It lists ALL institutions (cards and base data), with the names of the visitor's language, English and the original.
 * It is kept like a page and rebuilt every three days. It is NOT built in advance: the database answer (about 0.9 MB
 * compressed per language, too big for the data cache) used to be read for all 16 languages on every deploy, which was
 * most of the database traffic (October 2026). Now only a language somebody opens is read, once per deploy at most.
 */
export const revalidate = 259200;

/** No language is built in advance; each is built on its first request and then kept (see above). */
export function generateStaticParams() {
  return [];
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(LOCALE_CODES as readonly string[]).includes(locale)) return NextResponse.json({ error: true }, { status: 404 });
  const data = await getCompactPoints(locale);
  if (!data) return NextResponse.json({ error: true }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json(data);
}
