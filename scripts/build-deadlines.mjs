// Builds data/generated/deadlines.json: the application deadlines of the programmes, grouped by institution and date, for the
// public calendar (/deadlines). The deadlines come from the generated data files (the same data that is loaded into the
// database, taken from the official programme pages), so the calendar and the institution pages agree.
//   node scripts/build-deadlines.mjs
// Run it again after new programmes are loaded. Past dates are dropped when the calendar is drawn, so an old file only shows less.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DIR = 'data/generated';
const SKIP = new Set(['study-combos.json', 'programme-countries.json', 'deadlines.json']);
const KEEP_FROM = new Date(Date.now() - 31 * 86400000).toISOString().slice(0, 10);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

const groups = new Map(); // "DE|slug|2027-07-15|2027-10|all" -> row
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.json') && !SKIP.has(f))) {
  const data = JSON.parse(readFileSync(path.join(DIR, file), 'utf8'));
  for (const inst of data.institutions ?? []) {
    const name = inst.names?.en ?? inst.names?.original;
    if (!name || !inst.slug || !inst.country) continue;
    for (const p of inst.programs ?? []) {
      for (const d of p.deadlines ?? []) {
        if (typeof d.date !== 'string' || !ISO.test(d.date) || d.date < KEEP_FROM) continue;
        const applies = d.applies_to ?? d.appliesTo ?? 'all';
        const key = [inst.country, inst.slug, d.date, d.intake ?? '', applies].join('|');
        let row = groups.get(key);
        if (!row) {
          row = { c: inst.country, s: inst.slug, n: name, d: d.date, i: d.intake ?? null, a: applies, l: [], p: 0 };
          groups.set(key, row);
        }
        row.p += 1;
        if (p.level && !row.l.includes(p.level)) row.l.push(p.level);
      }
    }
  }
}

const rows = [...groups.values()]
  .map((r) => ({ ...r, l: r.l.sort() }))
  .sort((a, b) => a.d.localeCompare(b.d) || a.c.localeCompare(b.c) || a.n.localeCompare(b.n));
writeFileSync('data/generated/deadlines.json', JSON.stringify({ built: new Date().toISOString().slice(0, 10), rows }) + '\n');
const countries = new Set(rows.map((r) => r.c));
console.log(`${rows.length} deadlines at ${new Set(rows.map((r) => r.s)).size} institutions in ${countries.size} countries (${[...countries].join(', ')})`);
