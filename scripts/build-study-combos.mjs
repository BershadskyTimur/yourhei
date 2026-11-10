// Builds data/generated/study-combos.json: which pairs "country + field of study" have enough programmes to deserve
// their own page (/study/<country>/<field>): at least 5 programmes at 2 or more institutions. The pairs come from the
// generated data files (the same data that is loaded into the database), so the list and the site agree.
//   node scripts/build-study-combos.mjs
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DIR = 'data/generated';
const isced = JSON.parse(readFileSync('data/reference/isced-f.json', 'utf8'));
const NARROW = new Set(isced.filter((e) => e.c.length === 3).map((e) => e.c));

const programmes = new Map(); // "AU|061" -> count
const withProgrammes = new Set(); // every country that has at least one programme (for the admin panel)
const institutions = new Map(); // "AU|061" -> Set of slugs
const prices = new Map(); // "AU|061" -> Map of currency -> yearly prices for students from abroad, one per programme

// The yearly price of a programme for a student from abroad: the same rule as src/lib/seo/tuition-range.ts
// (lines for EU or home students and lines without an amount are left out; a total is divided by the years).
function yearlyPrice(p) {
  for (const t of Array.isArray(p.tuition) ? p.tuition : []) {
    if (t.applies_to === 'eu' || t.applies_to === 'domestic' || typeof t.amount !== 'number' || t.amount <= 0) continue;
    const yearly = t.period === 'year' ? t.amount : t.period === 'semester' ? t.amount * 2 : t.period === 'total' && p.duration_years > 0 ? t.amount / p.duration_years : null;
    if (yearly === null || !Number.isFinite(yearly) || yearly <= 0 || typeof t.currency !== 'string') continue;
    return { yearly, currency: t.currency };
  }
  return null;
}
/**
 * What most programmes of a pair cost a year: the 10th and the 90th percentile of the yearly prices, in the currency most
 * programmes use. The cheapest and the dearest price are not used: single wrong figures in the sources ("1 AUD a year")
 * would end up in the page description. Null when fewer than 5 programmes have a price, when the main currency covers
 * less than 60 % of the priced programmes, or when the lower figure is below 100 (not a yearly tuition in any currency here).
 */
function feeOf(key) {
  const byCurrency = prices.get(key);
  if (!byCurrency) return null;
  let best = null;
  let all = 0;
  for (const entry of byCurrency) {
    all += entry[1].length;
    if (!best || entry[1].length > best[1].length) best = entry;
  }
  if (!best || best[1].length < 5 || best[1].length < all * 0.6) return null;
  const sorted = [...best[1]].sort((x, y) => x - y);
  const at = (q) => sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
  const min = Math.round(at(0.1));
  const max = Math.round(at(0.9));
  return min >= 100 ? { min, max, currency: best[0], priced: sorted.length } : null;
}
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'study-combos.json' && f !== 'programme-countries.json' && f !== 'deadlines.json')) {
  const data = JSON.parse(readFileSync(path.join(DIR, file), 'utf8'));
  for (const inst of data.institutions ?? []) {
    if ((inst.programs ?? []).length > 0) withProgrammes.add(inst.country);
    for (const p of inst.programs ?? []) {
      const code = typeof p.isced_f === 'string' ? p.isced_f.slice(0, 3) : '';
      if (!NARROW.has(code)) continue;
      const key = `${inst.country}|${code}`;
      programmes.set(key, (programmes.get(key) ?? 0) + 1);
      (institutions.get(key) ?? institutions.set(key, new Set()).get(key)).add(inst.slug);
      const price = yearlyPrice(p);
      if (price) {
        const byCurrency = prices.get(key) ?? prices.set(key, new Map()).get(key);
        (byCurrency.get(price.currency) ?? byCurrency.set(price.currency, []).get(price.currency)).push(price.yearly);
      }
    }
  }
}

const combos = [...programmes.entries()]
  .map(([key, n]) => {
    const [country, code] = key.split('|');
    // the range is shown as "most programmes cost …": only where at least half of the programmes have a price
    // (in Germany most programmes are free and have no price line; the few priced ones would mislead)
    const fee = feeOf(key);
    return { country, code, programmes: n, institutions: institutions.get(key).size, ...(fee && fee.priced * 2 >= n ? { fee } : {}) };
  })
  .filter((c) => c.programmes >= 5 && c.institutions >= 2)
  .sort((a, b) => a.country.localeCompare(b.country) || b.programmes - a.programmes);

writeFileSync('data/generated/study-combos.json', JSON.stringify({ built: new Date().toISOString().slice(0, 10), combos }) + '\n');
writeFileSync('data/generated/programme-countries.json', JSON.stringify({ countries: [...withProgrammes].sort() }) + '\n');
const countries = new Set(combos.map((c) => c.country));
console.log(`${combos.length} pages for ${countries.size} countries`);
