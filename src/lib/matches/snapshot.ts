import type { Group, Matches } from '../matching/types';

// A saved copy of the matching results (what the person saw on a day) that can be opened with a secret link.
// It holds only public facts about programmes: no answers of the survey and nothing personal.

export interface SnapshotItem {
  /** programme names by language */
  names: Record<string, string>;
  /** institution names by language */
  institution: Record<string, string>;
  country: string;
  slug: string;
  score: number;
  group: Group;
  level: string;
}

const GROUPS: Group[] = ['safe', 'suitable', 'ambitious'];
export const MAX_PER_GROUP = 20;

/** The best results of each group, as plain data for the database. */
export function buildSnapshot(matches: Matches, perGroup = MAX_PER_GROUP): SnapshotItem[] {
  return GROUPS.flatMap((g) =>
    matches[g].slice(0, perGroup).map((r) => ({
      names: r.program.names,
      institution: r.program.institution.names,
      country: r.program.institution.country,
      slug: r.program.institution.slug,
      score: Math.round(r.score),
      group: g,
      level: r.program.level,
    })),
  );
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const strings = (v: unknown): Record<string, string> => (isRecord(v) ? (Object.fromEntries(Object.entries(v).filter(([, x]) => typeof x === 'string')) as Record<string, string>) : {});

/** Reads items back from the database; anything that does not look right is dropped. */
export function parseSnapshot(value: unknown): SnapshotItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((x): SnapshotItem[] => {
    if (!isRecord(x)) return [];
    const group = GROUPS.find((g) => g === x.group);
    if (!group || typeof x.country !== 'string' || typeof x.slug !== 'string' || typeof x.score !== 'number') return [];
    return [{ names: strings(x.names), institution: strings(x.institution), country: x.country, slug: x.slug, score: x.score, group, level: typeof x.level === 'string' ? x.level : '' }];
  });
}
