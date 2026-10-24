import data from '../../../data/generated/deadlines.json';

// The public calendar of application deadlines (/deadlines). The rows are built by scripts/build-deadlines.mjs from the same
// programme data that is loaded into the database; one row = one institution, one date, one intake, who it applies to.

export interface DeadlineRow {
  /** ISO code of the country */
  c: string;
  /** slug of the institution page */
  s: string;
  /** name of the institution */
  n: string;
  /** deadline, ISO date */
  d: string;
  /** intake the deadline is for, "2027-09" */
  i: string | null;
  /** who it applies to: "international", "eu" or "all" */
  a: string;
  /** levels of the programmes with this deadline */
  l: string[];
  /** number of programmes with this deadline */
  p: number;
}

export const ROWS: DeadlineRow[] = (data as unknown as { rows: DeadlineRow[] }).rows;
export const DEADLINES_BUILT: string = (data as unknown as { built: string }).built;

export const isoDay = (date: Date): string => date.toISOString().slice(0, 10);

/** The deadlines that have not passed yet (today still counts), in date order. */
export function upcoming(rows: readonly DeadlineRow[] = ROWS, today: Date = new Date()): DeadlineRow[] {
  const day = isoDay(today);
  return rows.filter((r) => r.d >= day);
}

/** Countries that have upcoming deadlines, the ones with the most first. */
export function countriesWithDeadlines(rows: readonly DeadlineRow[] = ROWS, today: Date = new Date()): { country: string; count: number; institutions: number; next: string }[] {
  const by = new Map<string, DeadlineRow[]>();
  for (const r of upcoming(rows, today)) (by.get(r.c) ?? by.set(r.c, []).get(r.c)!).push(r);
  return [...by.entries()]
    .map(([country, list]) => ({ country, count: list.length, institutions: new Set(list.map((r) => r.s)).size, next: list[0].d }))
    .sort((a, b) => b.count - a.count || a.country.localeCompare(b.country));
}

export function ofCountry(country: string, rows: readonly DeadlineRow[] = ROWS, today: Date = new Date()): DeadlineRow[] {
  return upcoming(rows, today).filter((r) => r.c === country.toUpperCase());
}

/** The deadlines of the next `days` days, soonest first. */
export function closingSoon(days: number, rows: readonly DeadlineRow[] = ROWS, today: Date = new Date()): DeadlineRow[] {
  const end = isoDay(new Date(today.getTime() + days * 86400000));
  return upcoming(rows, today).filter((r) => r.d <= end);
}

/** Groups rows (already in date order) by month: [{ month: "2027-03", rows }]. */
export function byMonth(rows: readonly DeadlineRow[]): { month: string; rows: DeadlineRow[] }[] {
  const out: { month: string; rows: DeadlineRow[] }[] = [];
  for (const r of rows) {
    const month = r.d.slice(0, 7);
    const last = out.at(-1);
    if (last?.month === month) last.rows.push(r);
    else out.push({ month, rows: [r] });
  }
  return out;
}
