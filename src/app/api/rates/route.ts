import { NextResponse } from 'next/server';
import fallback from '../../../../data/reference/fallback-rates.json';

// Exchange rates for the matching: loaded from a free source once a day and cached; if the source
// is down, a rough built-in table is used instead and the answer says so.
export const revalidate = 86400;

export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 86400 } });
    if (res.ok) {
      const data = (await res.json()) as { result?: string; rates?: Record<string, number>; time_last_update_utc?: string };
      if (data.result === 'success' && data.rates && data.rates.EUR) {
        return NextResponse.json({ rates: data.rates, source: 'live', updated: data.time_last_update_utc ?? null });
      }
    }
  } catch {
    // fall through to the built-in table
  }
  return NextResponse.json({ rates: fallback.rates, source: 'fallback', updated: fallback.updated });
}
