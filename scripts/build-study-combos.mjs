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
const institutions = new Map(); // "AU|061" -> Set of slugs
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json') && f !== 'study-combos.json')) {
  const data = JSON.parse(readFileSync(path.join(DIR, file), 'utf8'));
  for (const inst of data.institutions ?? []) {
    for (const p of inst.programs ?? []) {
      const code = typeof p.isced_f === 'string' ? p.isced_f.slice(0, 3) : '';
      if (!NARROW.has(code)) continue;
      const key = `${inst.country}|${code}`;
      programmes.set(key, (programmes.get(key) ?? 0) + 1);
      (institutions.get(key) ?? institutions.set(key, new Set()).get(key)).add(inst.slug);
    }
  }
}

const combos = [...programmes.entries()]
  .map(([key, n]) => {
    const [country, code] = key.split('|');
    return { country, code, programmes: n, institutions: institutions.get(key).size };
  })
  .filter((c) => c.programmes >= 5 && c.institutions >= 2)
  .sort((a, b) => a.country.localeCompare(b.country) || b.programmes - a.programmes);

writeFileSync('data/generated/study-combos.json', JSON.stringify({ built: new Date().toISOString().slice(0, 10), combos }) + '\n');
const countries = new Set(combos.map((c) => c.country));
console.log(`${combos.length} pages for ${countries.size} countries`);
