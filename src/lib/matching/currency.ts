import type { MatchProgram, Rates, Tuition } from './types';

// EU and EEA countries: citizens of these may pay the "eu" tuition (SPEC.md section 6 uses the same list).
const EU_EEA = new Set(
  'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO'.split(' '),
);

/** Converts through US dollars (rates are units of each currency per 1 USD). null if a rate is unknown. */
export function convert(amount: number, from: string, to: string, rates: Rates): number | null {
  if (from === to) return amount;
  const a = from === 'USD' ? 1 : rates[from];
  const b = to === 'USD' ? 1 : rates[to];
  if (!a || !b) return null;
  return (amount / a) * b;
}

/** The tuition line that applies to this person: own country, EU, international, then "all". */
export function pickTuition(program: MatchProgram, citizenships: string[]): Tuition | null {
  const known = program.tuition.filter((t) => t.amount !== null);
  const home = citizenships.includes(program.institution.country);
  const eu = citizenships.some((c) => EU_EEA.has(c));
  const order: Tuition['appliesTo'][] = [
    ...(home ? (['domestic'] as const) : []),
    ...(eu ? (['eu'] as const) : []),
    'international',
    'all',
  ];
  for (const who of order) {
    const found = known.find((t) => t.appliesTo === who);
    if (found) return found;
  }
  return null;
}

/** The yearly amount of a tuition line, or null when it cannot be turned into one. */
export function yearlyAmount(t: Tuition, durationYears: number | null): number | null {
  if (t.amount === null) return null;
  switch (t.period) {
    case 'year':
      return t.amount;
    case 'semester':
      return t.amount * 2;
    case 'total':
      return durationYears && durationYears > 0 ? t.amount / durationYears : null;
    default:
      return null; // per credit: the number of credits is not known
  }
}
