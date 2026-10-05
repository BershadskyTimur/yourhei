import thresholds from '../../data/reference/age-thresholds.json';

// Mirrors public.min_age_for() in the database: same JSON file feeds both (SPEC.md section 6).
const OVERRIDES = thresholds.overrides as Record<string, number>;

export const MAX_PLAUSIBLE_AGE = 120;

/** Minimum registration age for the country of residence. All values need legal review. */
export function minAgeFor(country: string): number {
  return OVERRIDES[country.toUpperCase()] ?? thresholds.default;
}

/** Parses a strict "YYYY-MM-DD" date (no time zones involved). Returns null if invalid. */
export function parseIsoDate(value: string): { y: number; m: number; d: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    return null;
  }
  return { y, m, d };
}

/** Full years between the birth date and `today` (a birthday counts on the day itself). */
export function calcAge(birthDate: string, today: Date = new Date()): number | null {
  const b = parseIsoDate(birthDate);
  if (!b) return null;
  let age = today.getFullYear() - b.y;
  const monthDiff = today.getMonth() + 1 - b.m;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < b.d)) age -= 1;
  return age;
}

/** false for malformed dates, dates in the future and ages over 120. */
export function isPlausibleBirthDate(birthDate: string, today: Date = new Date()): boolean {
  const age = calcAge(birthDate, today);
  return age !== null && age >= 0 && age <= MAX_PLAUSIBLE_AGE;
}

export function isOldEnough(birthDate: string, country: string, today: Date = new Date()): boolean {
  const age = calcAge(birthDate, today);
  return age !== null && age >= minAgeFor(country);
}
