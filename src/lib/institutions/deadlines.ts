/**
 * The application deadlines to show for a programme. Many sources give one date for EU students and one for everybody
 * else (often the very same day). The site is for international applicants, so the dates that apply to them are shown:
 * "international" and "all"; the EU or domestic dates only when nothing else is known. Equal dates are shown once.
 */
export function visibleDeadlines<T extends { intake?: string | null; appliesTo?: string | null; date: string | null }>(
  list: readonly T[],
): T[] {
  const dated = list.filter((d) => d.date);
  const forInternational = dated.filter((d) => !d.appliesTo || d.appliesTo === 'all' || d.appliesTo === 'international');
  const chosen = forInternational.length > 0 ? forInternational : dated;
  const seen = new Set<string>();
  return chosen
    .filter((d) => {
      const key = `${d.intake ?? ''}|${d.date}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => String(a.date).localeCompare(String(b.date)));
}
