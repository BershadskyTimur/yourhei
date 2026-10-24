import { bodyOf, publishedArticles } from './posts';

// The RSS feed of the blog (/ru/blog/feed.xml, /en/blog/feed.xml): feed readers and some search engines use it to see new articles.

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/** RFC 822 date at noon UTC of the given ISO day (the format RSS wants). */
export function rssDate(day: string): string {
  return new Date(`${day}T12:00:00Z`).toUTCString();
}

export function buildFeed(opts: { locale: string; base: string; title: string; description: string; today?: Date }): string {
  const { locale, base, title, description } = opts;
  const items = publishedArticles(opts.today).map((a) => {
    const body = bodyOf(a, locale);
    const link = `${base}/${locale}/blog/${a.slug}`;
    return `    <item>
      <title>${escapeXml(body.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${rssDate(a.published)}</pubDate>
      <description>${escapeXml(body.description)}</description>
    </item>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${base}/${locale}/blog</link>
    <description>${escapeXml(description)}</description>
    <language>${locale}</language>
    <atom:link href="${base}/${locale}/blog/feed.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`;
}
