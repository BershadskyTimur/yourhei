// Loads data/seed/wikidata-world.json into your Supabase database in one go (instead of pasting SQL files).
//   Run:  node scripts/load-institutions.mjs
// Needs SUPABASE_SERVICE_ROLE_KEY in .env.local. That key is SECRET: it works only on your computer, in
// this script. Never put it in a variable that starts with NEXT_PUBLIC_ and never send it to anyone.
// Institutions that are already in the database (same Wikidata id) are skipped, so it is safe to run again.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Add SUPABASE_SERVICE_ROLE_KEY=... to .env.local first (see docs/SUPABASE_FILES.md).');
  process.exit(1);
}
const supabase = createClient(url, key, { auth: { persistSession: false } });

const { institutions } = JSON.parse(readFileSync('data/seed/wikidata-world.json', 'utf8'));

// Wikidata ids that are already in the database
const have = new Set();
for (let from = 0; ; from += 1000) {
  const { data, error } = await supabase.from('institutions').select('external_ids').range(from, from + 999);
  if (error) throw new Error(error.message);
  for (const r of data) if (r.external_ids?.wikidata) have.add(r.external_ids.wikidata);
  if (data.length < 1000) break;
}
const todo = institutions.filter((i) => !have.has(i.wikidata));
console.log(`${institutions.length} in the file, ${have.size} already in the database, ${todo.length} to add.`);

let added = 0;
for (let i = 0; i < todo.length; i += 200) {
  const batch = todo.slice(i, i + 200).map((r) => ({
    slug: r.slug,
    type: r.type,
    country: r.country,
    city: r.city,
    names: r.names,
    location: `SRID=4326;POINT(${r.lng} ${r.lat})`,
    website: r.website,
    founded_year: r.foundedYear,
    external_ids: { wikidata: r.wikidata },
  }));
  const { error } = await supabase.from('institutions').upsert(batch, { onConflict: 'country,slug', ignoreDuplicates: true });
  if (error) {
    console.error(`Batch ${i / 200 + 1} failed: ${error.message}`);
    process.exit(1);
  }
  added += batch.length;
  console.log(`  ${added}/${todo.length}`);
}
console.log('Done.');
