import type { TuitionLine } from '../institutions/program-detail';

export interface TuitionRange {
  min: number;
  max: number;
  currency: string;
}

interface Item {
  tuition: TuitionLine[];
  durationYears: number | null;
}

/** "€8,000 – €12,000", or "€8,000" when both ends are equal, written the way the language of the page writes money. */
export function formatTuitionRange(locale: string, r: TuitionRange): string {
  const money = (n: number) => {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: r.currency, maximumFractionDigits: 0 }).format(n);
    } catch {
      return `${n} ${r.currency}`;
    }
  };
  return r.min === r.max ? money(r.min) : `${money(r.min)} – ${money(r.max)}`;
}

/**
 * The yearly tuition of an institution for a student from abroad, as the cheapest and the dearest price of its programmes, in the
 * currency most programmes use (prices in different currencies are not mixed). Used for the page description, where people who search
 * "<university> tuition" see the real figures. Free programmes and lines without an amount are left out; null when nothing is known.
 */
export function tuitionRange(programs: readonly Item[]): TuitionRange | null {
  const byCurrency = new Map<string, number[]>();
  for (const p of programs) {
    for (const t of p.tuition) {
      if (t.appliesTo === 'eu' || t.appliesTo === 'domestic' || t.amount === null || t.amount <= 0) continue;
      const yearly = t.period === 'year' ? t.amount : t.period === 'semester' ? t.amount * 2 : t.period === 'total' && p.durationYears ? t.amount / p.durationYears : null;
      if (yearly === null || !Number.isFinite(yearly) || yearly <= 0) continue;
      byCurrency.set(t.currency, [...(byCurrency.get(t.currency) ?? []), yearly]);
      break; // one line per programme: the first that applies to students from abroad
    }
  }
  let best: [string, number[]] | null = null;
  for (const entry of byCurrency) if (!best || entry[1].length > best[1].length) best = entry;
  if (!best) return null;
  const values = best[1];
  return { min: Math.round(Math.min(...values)), max: Math.round(Math.max(...values)), currency: best[0] };
}
