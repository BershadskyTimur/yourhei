import type { InstitutionType, MapInstitution } from './types';

/** Lower-case and strip accents so "Tbilisi" matches "tbilisi" and "Évora" matches "evora". */
export function normalizeSearch(s: string): string {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** All searchable text of one institution: every translation of the name and of the city. */
function haystack(i: MapInstitution): string {
  return normalizeSearch([...Object.values(i.names), ...Object.values(i.city)].join(' | '));
}

export interface InstitutionFilter {
  types: ReadonlySet<InstitutionType>;
  query: string;
}

/** Pure function: which institutions to show for the selected types and search text. */
export function filterInstitutions(
  items: readonly MapInstitution[],
  { types, query }: InstitutionFilter,
): MapInstitution[] {
  const q = normalizeSearch(query);
  return items.filter((i) => types.has(i.type) && (q === '' || haystack(i).includes(q)));
}

export function countByType(items: readonly MapInstitution[]): Record<InstitutionType, number> {
  const counts = {
    university: 0,
    college: 0,
    school: 0,
    language_school: 0,
    foundation: 0,
    vocational: 0,
  } satisfies Record<InstitutionType, number>;
  for (const i of items) counts[i.type] += 1;
  return counts;
}
