import data from '../../../data/generated/thin-institutions.json';

// The institutions whose pages are thin (no price for students from abroad, nothing free, no upcoming deadline: see
// isThinInstitution in institution-meta.ts), worked out in the database by scripts/sql/thin-institutions.sql. The sitemap leaves
// them out, so that it lists only the pages that are offered to search engines. Each page decides its own noindex from its
// programmes; this list only keeps the sitemap in step without reading every programme of every institution.

const THIN = new Set(Object.entries(data.items as Record<string, string[]>).flatMap(([country, slugs]) => slugs.map((slug) => `${country.toLowerCase()}/${slug}`)));

/** Whether the institution (country code in any case, address slug) is on the list of thin pages. */
export function isListedThin(country: string, slug: string): boolean {
  return THIN.has(`${country.toLowerCase()}/${slug}`);
}

/** How many institutions are on the list (for the checks). */
export const THIN_COUNT = THIN.size;
