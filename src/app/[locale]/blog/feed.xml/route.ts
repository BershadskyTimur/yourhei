import { getTranslations } from 'next-intl/server';
import { INDEXED_LOCALES } from '@/config/seo';
import { buildFeed } from '@/lib/blog/feed';
import { siteUrl } from '@/lib/site-url';

export const revalidate = 3600;
// Only the languages the blog is written in have a feed; any other address is "not found".
export const dynamicParams = false;

export function generateStaticParams() {
  return INDEXED_LOCALES.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Blog' });
  const xml = buildFeed({ locale, base: siteUrl(), title: `YourHEI — ${t('title')}`, description: t('intro') });
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
