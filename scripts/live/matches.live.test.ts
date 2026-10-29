// A check of the matching on the LIVE database (read only, with the public key): typical survey answers go through the
// same loader and engine as the "My matches" page, and the results must be varied and not empty.
//   npm run matches:check
// Run it after every big data load. It is not part of `npm test` (it needs the internet and the database).
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';
import { matchPrograms } from '@/lib/matching/engine';
import { buildMatchInput } from '@/lib/matching/input';
import { loadMatchData } from '@/lib/matching/load';
import type { Rates } from '@/lib/matching/types';
import fallback from '../../data/reference/fallback-rates.json';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => /^NEXT_PUBLIC_SUPABASE_(URL|PUBLISHABLE_KEY)=/.test(l))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false } });

const common = {
  start: '2027-09', format: ['on_campus'], grade: { system: 'five', value: 4.5 }, exams: [], rating: 'any', ownership: 'any',
  climate: 'any', dorm: 'any', recognition: 'any', extras: [], strategy: 'balanced',
};
const PROFILES: { name: string; answers: Record<string, unknown>; minCountries: number }[] = [
  { name: 'bachelor IT, English B2, 10 000 USD', minCountries: 3, answers: { ...common, level: 'bachelor', fields: ['061'], languages: [{ lang: 'ru', level: 'native' }, { lang: 'en', level: 'b2' }], study_languages: { languages: ['en'], prepYear: false }, funding: 'both', budget: { currency: 'USD', tuition: 10000, living: 10000 }, priorities: ['price', 'field', 'chances'] } },
  { name: 'bachelor business, free only, preparatory year', minCountries: 1, answers: { ...common, level: 'bachelor', fields: ['041'], languages: [{ lang: 'ru', level: 'native' }, { lang: 'en', level: 'b1' }], study_languages: { languages: ['en'], prepYear: true }, funding: 'free', budget: { currency: 'USD', tuition: 0, living: 5000 }, priorities: ['price', 'chances', 'field'] } },
  { name: 'bachelor medicine, English C1, 30 000 USD', minCountries: 3, answers: { ...common, level: 'bachelor', fields: ['091'], languages: [{ lang: 'en', level: 'c1' }], study_languages: { languages: ['en'], prepYear: false }, funding: 'both', budget: { currency: 'USD', tuition: 30000, living: 15000 }, priorities: ['prestige', 'field', 'career'] } },
  { name: 'master engineering, English C1, 15 000 EUR', minCountries: 3, answers: { ...common, level: 'master', fields: ['071'], languages: [{ lang: 'en', level: 'c1' }], study_languages: { languages: ['en'], prepYear: false }, funding: 'both', budget: { currency: 'EUR', tuition: 20000, living: 10000 }, priorities: ['field', 'career', 'price'] } },
  { name: 'master any field, English B2, 5 000 EUR', minCountries: 3, answers: { ...common, level: 'master', fields: [], languages: [{ lang: 'en', level: 'b2' }], study_languages: { languages: ['en'], prepYear: false }, funding: 'both', budget: { currency: 'EUR', tuition: 5000, living: 10000 }, priorities: ['price', 'chances', 'career'] } },
];

async function liveRates(): Promise<Rates> {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    const j = (await r.json()) as { rates?: Rates };
    if (j.rates?.EUR) return j.rates;
  } catch {
    /* the built-in table */
  }
  return fallback.rates as Rates;
}

describe('matching on the live database', async () => {
  const rates = await liveRates();
  for (const p of PROFILES) {
    it(p.name, async () => {
      const input = buildMatchInput(p.answers, { residence: 'KZ', citizenships: ['KZ'], countries: [], types: [] });
      const prefixes = [...new Set(input.fields.filter((f) => /^\d{2,4}$/.test(f)).map((f) => f.slice(0, 3)))];
      const data = await loadMatchData(supabase, { level: input.level, fieldPrefixes: prefixes }, Date.now() + 40_000);
      const m = matchPrograms(data.programs, input, { countries: data.countries, rates });
      const shown = [...m.safe, ...m.suitable, ...m.ambitious];
      const byCountry: Record<string, number> = {};
      for (const r of shown) byCountry[r.program.institution.country] = (byCountry[r.program.institution.country] ?? 0) + 1;
      console.log(`${p.name}: read ${data.programs.length}${data.partial ? ' (partial)' : ''}, passed ${m.passed}, shown ${shown.length} ${JSON.stringify(byCountry)}`);
      expect(shown.length, 'nothing shown').toBeGreaterThan(0);
      expect(Object.keys(byCountry).length, 'too few countries').toBeGreaterThanOrEqual(Math.min(p.minCountries, new Set(data.programs.map((x) => x.institution.country)).size));
      if (p.minCountries > 1) expect(Math.max(...Object.values(byCountry)) / shown.length, 'one country takes most of the list').toBeLessThanOrEqual(0.5);
    }, 120_000);
  }
});
