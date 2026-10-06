import type { MetadataRoute } from 'next';
import { LOCALE_CODES } from '@/config/locales';
import { getMapInstitutions } from '@/lib/institutions/get';
import { siteUrl } from '@/lib/site-url';

export const revalidate = 86400;

const STATIC_PAGES = ['', '/about', '/contact', '/privacy', '/terms'];

/** Every page in every language, with links between the language versions (hreflang). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const alternates = (path: string) => ({ languages: Object.fromEntries(LOCALE_CODES.map((l) => [l, `${base}/${l}${path}`])) });
  const { items } = await getMapInstitutions();
  const paths = [...STATIC_PAGES, ...items.map((i) => `/institutions/${i.country.toLowerCase()}/${i.slug}`)];
  return paths.flatMap((path) => LOCALE_CODES.map((l) => ({ url: `${base}/${l}${path}`, alternates: alternates(path) })));
}
