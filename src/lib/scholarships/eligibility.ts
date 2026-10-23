// Is a scholarship open to the visitor's citizenship? Only what the official page of the programme says is used:
// eligibleCountries = the countries whose citizens may apply, or null when the list is not kept here.
export type Eligibility = 'yes' | 'no' | 'check';

export function eligibilityFor(citizenship: string, eligibleCountries: readonly string[] | null): Eligibility | null {
  if (!citizenship) return null;
  if (!eligibleCountries) return 'check';
  return eligibleCountries.includes(citizenship) ? 'yes' : 'no';
}

interface Filterable {
  levels: readonly string[];
  eligibleCountries: readonly string[] | null;
}

/** Applies the filters: level, and (with a citizenship) hiding the programmes closed to it; confirmed ones come first. */
export function filterScholarships<T extends Filterable>(items: readonly T[], opts: { citizenship: string; level: string; hideClosed: boolean }): T[] {
  const shown = items.filter((s) => {
    if (opts.level && !s.levels.includes(opts.level)) return false;
    if (opts.citizenship && opts.hideClosed && eligibilityFor(opts.citizenship, s.eligibleCountries) === 'no') return false;
    return true;
  });
  if (!opts.citizenship) return shown;
  const rank = (s: T) => ({ yes: 0, check: 1, no: 2 })[eligibilityFor(opts.citizenship, s.eligibleCountries) ?? 'check'];
  return [...shown].sort((a, b) => rank(a) - rank(b));
}
