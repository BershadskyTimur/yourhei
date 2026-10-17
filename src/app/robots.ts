import type { MetadataRoute } from 'next';
import { SITEMAP_CHUNK, sitemapInstitutions } from '@/lib/institutions/sitemap';
import { siteUrl } from '@/lib/site-url';

export const revalidate = 86400;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = siteUrl();
  const items = await sitemapInstitutions();
  const files = Math.max(1, Math.ceil(items.length / SITEMAP_CHUNK));
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/auth/', '/*/admin', '/*/profile', '/*/survey', '/*/matches', '/*/favorites', '/*/compare', '/*/shared', '/*/cabinet', '/*?_rsc='] }],
    sitemap: Array.from({ length: files }, (_, i) => `${base}/sitemap/${i}.xml`),
  };
}
