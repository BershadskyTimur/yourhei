import type { MetadataRoute } from 'next';
import { LOCALE_CODES } from '@/config/locales';
import { getMapInstitutions } from '@/lib/institutions/get';
import { siteUrl } from '@/lib/site-url';

export const revalidate = 86400;

// A sitemap file may hold at most 50 000 addresses (and about 50 MB). Every institution has one address per
// language, so the institutions are split into several files of 1 000 institutions each (/sitemap/0.xml, /sitemap/1.xml ...).
export const SITEMAP_CHUNK = 1000;
const STATIC_PAGES = ['', '/catalog', '/scholarships', '/about', '/contact', '/privacy', '/terms'];

export async function generateSitemaps() {
  const { items } = await getMapInstitutions();
  return Array.from({ length: Math.max(1, Math.ceil(items.length / SITEMAP_CHUNK)) }, (_, id) => ({ id }));
}

/** Every page in every language, with links between the language versions (hreflang). */
export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);
  const base = siteUrl();
  const alternates = (path: string) => ({ languages: Object.fromEntries(LOCALE_CODES.map((l) => [l, `${base}/${l}${path}`])) });
  const { items } = await getMapInstitutions();
  const slice = items.slice(id * SITEMAP_CHUNK, (id + 1) * SITEMAP_CHUNK);
  const paths = [...(id === 0 ? STATIC_PAGES : []), ...slice.map((i) => `/institutions/${i.country.toLowerCase()}/${i.slug}`)];
  return paths.flatMap((path) => LOCALE_CODES.map((l) => ({ url: `${base}/${l}${path}`, alternates: alternates(path) })));
}
