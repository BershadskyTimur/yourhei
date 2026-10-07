// Helpers for the catalog filters. Pure functions, covered by tests.

/** Makes free text safe for a PostgREST `ilike` filter: no list separators, brackets or wildcards. */
export function searchTerm(raw: string): string {
  return raw.replace(/[,()%*_\\"'`:.;]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
}

/** The `or=` filter for a programme name search, or null when the text is empty. */
export function nameFilter(raw: string, keys: readonly string[]): string | null {
  const q = searchTerm(raw);
  return q ? keys.map((k) => `names->>${k}.ilike.%${q}%`).join(',') : null;
}

export const CATALOG_LEVELS = ['school', 'college', 'foundation', 'bachelor', 'master', 'phd', 'language_course'] as const;
