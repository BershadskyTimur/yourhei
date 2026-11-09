import type { TuitionLine } from '../institutions/program-detail';

export interface TuitionRange {
  min: number;
  max: number;
  currency: string;
}

interface Item {
  tuition: TuitionLine[];
  durationYears: number | null;
  /** the academic year the prices are for ("2025/2026", "2026"); optional for callers that only need the range */
  academicYear?: string | null;
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
  const best = pricedLines(programs);
  if (!best) return null;
  const values = best.lines.map((l) => l.yearly);
  return { min: Math.round(Math.min(...values)), max: Math.round(Math.max(...values)), currency: best.currency };
}

/**
 * The academic year the prices of `tuitionRange` are for, written short ("2025/26", "2026"): the year most of the priced
 * programmes give. Null when no price is known or no priced programme says its year. Shown next to the price so that a visitor
 * (and the search result) sees which year the figure belongs to.
 */
export function tuitionYear(programs: readonly Item[]): string | null {
  const best = pricedLines(programs);
  if (!best) return null;
  const counts = new Map<string, number>();
  for (const l of best.lines) if (l.academicYear) counts.set(l.academicYear, (counts.get(l.academicYear) ?? 0) + 1);
  let year: string | null = null;
  for (const [y, n] of counts) if (year === null || n > (counts.get(year) ?? 0)) year = y;
  return year === null ? null : shortAcademicYear(year);
}

/** "2025/2026" → "2025/26", "2026-2027" → "2026/27"; a single year ("2026") or anything else is kept as it is. */
export function shortAcademicYear(year: string): string {
  const m = /^(\d{4})\s*[/\-–]\s*(\d{2})(\d{2})$/.exec(year.trim());
  return m ? `${m[1]}/${m[3]}` : year.trim();
}

interface PricedLine {
  yearly: number;
  academicYear: string | null;
}

/** The yearly prices for students from abroad, one per programme, in the currency most programmes use. */
function pricedLines(programs: readonly Item[]): { currency: string; lines: PricedLine[] } | null {
  const byCurrency = new Map<string, PricedLine[]>();
  for (const p of programs) {
    for (const t of p.tuition) {
      if (t.appliesTo === 'eu' || t.appliesTo === 'domestic' || t.amount === null || t.amount <= 0) continue;
      const yearly = t.period === 'year' ? t.amount : t.period === 'semester' ? t.amount * 2 : t.period === 'total' && p.durationYears ? t.amount / p.durationYears : null;
      if (yearly === null || !Number.isFinite(yearly) || yearly <= 0) continue;
      byCurrency.set(t.currency, [...(byCurrency.get(t.currency) ?? []), { yearly, academicYear: p.academicYear ?? null }]);
      break; // one line per programme: the first that applies to students from abroad
    }
  }
  let best: [string, PricedLine[]] | null = null;
  for (const entry of byCurrency) if (!best || entry[1].length > best[1].length) best = entry;
  return best ? { currency: best[0], lines: best[1] } : null;
}
