import type { MetadataRoute } from 'next';
import { getMapInstitutions } from '@/lib/institutions/get';
import { siteUrl } from '@/lib/site-url';

export const revalidate = 86400;
const SITEMAP_CHUNK = 1000; // keep in step with src/app/sitemap.ts

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = siteUrl();
  const { items } = await getMapInstitutions();
  const files = Math.max(1, Math.ceil(items.length / SITEMAP_CHUNK));
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/auth/', '/*/admin', '/*/profile', '/*/survey', '/*/matches', '/*/favorites', '/*/compare', '/*/shared', '/*/cabinet'] }],
    sitemap: Array.from({ length: files }, (_, i) => `${base}/sitemap/${i}.xml`),
  };
}
