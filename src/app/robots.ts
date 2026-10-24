import type { MetadataRoute } from 'next';
import { SITEMAP_CHUNK } from '@/lib/institutions/sitemap';
import { getSitemapPoints } from '@/lib/institutions/summaries';
import { siteUrl } from '@/lib/site-url';

export const revalidate = 86400;

// Pages that are for people, not for search engines.
const PRIVATE = ['/api/', '/auth/', '/*/admin', '/*/profile', '/*/survey', '/*/matches', '/*/favorites', '/*/compare', '/*/shared', '/*/cabinet', '/*?_rsc='];

// Crawlers that copy content for AI training or sell SEO data. They bring no visitors, and their visits to thousands of
// pages use up the hosting plan, so they are asked to stay away. (Search engines and the crawlers of AI search that
// show a link to the page - OAI-SearchBot, PerplexityBot, Claude-SearchBot - are not on this list.)
const GREEDY_BOTS = [
  'GPTBot',
  'CCBot',
  'ClaudeBot',
  'anthropic-ai',
  'Bytespider',
  'Amazonbot',
  'meta-externalagent',
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'PetalBot',
  'DataForSeoBot',
  'ImagesiftBot',
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const base = siteUrl();
  const items = await getSitemapPoints();
  const files = Math.max(1, Math.ceil(items.length / SITEMAP_CHUNK));
  return {
    rules: [
      { userAgent: GREEDY_BOTS, disallow: '/' },
      { userAgent: '*', allow: '/', disallow: PRIVATE },
    ],
    sitemap: Array.from({ length: files }, (_, i) => `${base}/sitemap/${i}.xml`),
  };
}
