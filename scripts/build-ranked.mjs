// Builds data/generated/ranked-institutions.json: the institutions with a place in a world ranking (QS, THE, Shanghai ARWU; the
// rankings table, Wikidata CC0) that have published programmes. The site links to them from the home page and from the top of
// each country's list (src/lib/institutions/ranked.ts).
//   node --env-file=.env.local scripts/build-ranked.mjs
// Reads with the publishable key (rankings and the sitemap list are public); about 300 KB from the database.
import { writeFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are needed (.env.local)');
const db = createClient(url, key, { auth: { persistSession: false } });

// institutions with published programmes, as the sitemap has them: [slug, country]
const { data: points, error: e1 } = await db.rpc('sitemap_points');
if (e1) throw e1;
const withPrograms = new Set(points.map(([s, c]) => `${c.toLowerCase()}/${s}`));

const { data: rows, error: e2 } = await db
  .from('rankings')
  .select('position, institutions!inner(slug, country, status, names)')
  .eq('scope', 'world')
  .eq('institutions.status', 'published');
if (e2) throw e2;

const LOCALES = ['en', 'ru', 'ka', 'es', 'zh', 'original'];
const by = new Map();
for (const r of rows) {
  const i = r.institutions;
  const pos = Number(/^[0-9]+/.exec(String(r.position ?? ''))?.[0]);
  const id = `${i.country.toLowerCase()}/${i.slug}`;
  if (!Number.isFinite(pos) || pos < 1 || !withPrograms.has(id)) continue;
  const cur = by.get(id);
  if (cur && cur.best <= pos) continue;
  const names = Object.fromEntries(LOCALES.filter((l) => i.names?.[l]).map((l) => [l, i.names[l]]));
  by.set(id, { c: i.country.toLowerCase(), s: i.slug, best: pos, names });
}
const items = [...by.values()].sort((a, b) => a.best - b.best || a.c.localeCompare(b.c) || a.s.localeCompare(b.s));
const file = {
  generated: new Date().toISOString().slice(0, 10),
  count: items.length,
  rule: 'Published institutions with published programmes and a position in the QS, THE or Shanghai (ARWU) world ranking (Wikidata CC0); best = the best position. Regenerate with scripts/build-ranked.mjs.',
  items,
};
writeFileSync('data/generated/ranked-institutions.json', `${JSON.stringify(file, null, 1)}\n`);
console.log(`${items.length} institutions`);
