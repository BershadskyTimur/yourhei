import data from '../../../data/generated/ranked-institutions.json';
import { isListedThin } from '@/lib/seo/thin-institutions';
import type { LocalizedText } from './types';

// The institutions with a place in a world ranking (QS, THE or Shanghai ARWU; Wikidata CC0) and published programmes, worked out
// by scripts/build-ranked.mjs. The home page and the first page of each country's list link to them, so that the best-known
// institutions are a click or two from the home page instead of deep in an alphabetical list of 200 a page (17.11.2026: Harvard
// was on page 7 of the list of the United States, and Search Console knew its page only from the sitemap). The file is read at
// build time: no database read on any page.

export interface RankedInstitution {
  /** Country code, lower case. */
  c: string;
  /** Address slug. */
  s: string;
  /** Best position in any of the world rankings. */
  best: number;
  names: LocalizedText;
}

/** Leaves out the pages kept out of search (thin), keeps the order: best position first. */
export function offered(items: readonly RankedInstitution[], isThin: (country: string, slug: string) => boolean): RankedInstitution[] {
  return items.filter((i) => !isThin(i.c, i.s)).sort((a, b) => a.best - b.best || a.c.localeCompare(b.c) || a.s.localeCompare(b.s));
}

/** The first `limit` of one country (code in any case). */
export function ofCountry(items: readonly RankedInstitution[], country: string, limit: number): RankedInstitution[] {
  const cc = country.toLowerCase();
  return items.filter((i) => i.c === cc).slice(0, limit);
}

/** The first `limit`, at most `perCountry` from one country, so that a short list is not all one country. */
export function mixed(items: readonly RankedInstitution[], limit: number, perCountry: number): RankedInstitution[] {
  const taken = new Map<string, number>();
  const out: RankedInstitution[] = [];
  for (const i of items) {
    if (out.length >= limit) break;
    const n = taken.get(i.c) ?? 0;
    if (n >= perCountry) continue;
    taken.set(i.c, n + 1);
    out.push(i);
  }
  return out;
}

/** The ranked institutions offered to search engines, best first. */
export const RANKED: readonly RankedInstitution[] = offered(data.items as RankedInstitution[], isListedThin);
