// The public address of the site, used by the sitemap and in links shown to search engines.
// Set NEXT_PUBLIC_SITE_URL (for example https://yourhei.com) once you have a domain; until then the
// address Vercel gives the site is used.
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  return vercel ? `https://${vercel}` : 'http://localhost:3000';
}
