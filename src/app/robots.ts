import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site-url';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/auth/', '/*/admin', '/*/profile', '/*/survey', '/*/matches', '/*/favorites', '/*/compare'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
