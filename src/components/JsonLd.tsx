import { jsonLdText } from '@/lib/seo/structured';

/** Structured data for search engines (invisible on the page). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdText(data) }} />;
}
