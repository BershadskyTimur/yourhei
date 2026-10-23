// Marks the institutions that teach ONLY foundation (preparatory) programmes, with or without language courses, as type
// "foundation" (they were mixed in with language schools and colleges, so the "Foundation programmes" filter on the map
// showed 0). A university or college with other programmes as well keeps its type, and one that was marked by mistake
// gets its old type back (taken from the generated data files in data/generated).
//   node scripts/retype-foundation.mjs           shows what would change (works with the public key)
//   node scripts/retype-foundation.mjs --apply   changes the rows (needs SUPABASE_SERVICE_ROLE_KEY in .env.local)
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const apply = process.argv.includes('--apply');
const key = apply ? env.SUPABASE_SERVICE_ROLE_KEY : (env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
if (!key) throw new Error('No key: add SUPABASE_SERVICE_ROLE_KEY to .env.local for --apply');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, key, { auth: { persistSession: false } });

async function retry(fn) {
  for (let i = 0; ; i++) {
    const res = await fn();
    if (!res.error || res.error.code !== '57014' || i >= 5) return res;
  }
}

// the type an institution had before, from the data files it was loaded from (country/slug -> type)
const oldType = new Map();
for (const f of readdirSync('data/generated').filter((x) => x.endsWith('.json') && x !== 'study-combos.json')) {
  for (const i of JSON.parse(readFileSync(path.join('data/generated', f), 'utf8')).institutions ?? []) {
    if (i.type && i.type !== 'foundation') oldType.set(`${i.country}/${i.slug}`, i.type);
  }
}

// institutions that have a foundation programme, and institutions already typed foundation (the database returns 1000 rows at a time)
const candidates = new Set();
for (let from = 0; ; from += 1000) {
  const { data, error } = await retry(() => db.from('programs').select('institution_id').eq('level', 'foundation').eq('status', 'published').order('institution_id').range(from, from + 999));
  if (error) throw error;
  data.forEach((r) => candidates.add(r.institution_id));
  if (data.length < 1000) break;
}
for (let from = 0; ; from += 1000) {
  const { data, error } = await retry(() => db.from('institutions').select('id').eq('type', 'foundation').order('id').range(from, from + 999));
  if (error) throw error;
  data.forEach((r) => candidates.add(r.id));
  if (data.length < 1000) break;
}
console.log('institutions to look at:', candidates.size);

const toFoundation = [];
const restore = [];
const ids = [...candidates];
for (let i = 0; i < ids.length; i += 40) {
  const { data: inst, error } = await retry(() => db.from('institutions').select('id, type, slug, country, names').in('id', ids.slice(i, i + 40)));
  if (error) throw error;
  for (const x of inst) {
    // does it have a programme that is neither foundation nor a language course? (one question per institution)
    const { data: other, error: e2 } = await retry(() => db.from('programs').select('id').eq('institution_id', x.id).eq('status', 'published').not('level', 'in', '(foundation,language_course)').limit(1));
    if (e2) throw e2;
    const onlyFoundation = other.length === 0;
    if (onlyFoundation && x.type !== 'foundation') toFoundation.push(x);
    if (!onlyFoundation && x.type === 'foundation') restore.push({ ...x, back: oldType.get(`${x.country}/${x.slug}`) ?? 'university' });
  }
}
console.log('to become type "foundation":', toFoundation.length);
for (const x of toFoundation.slice(0, 12)) console.log('  ', x.type, '-> foundation |', x.names?.en ?? x.slug);
console.log('to get their old type back:', restore.length);
for (const x of restore.slice(0, 12)) console.log('  foundation ->', x.back, '|', x.names?.en ?? x.slug);

if (apply) {
  for (const x of toFoundation) {
    const { error } = await retry(() => db.from('institutions').update({ type: 'foundation' }).eq('id', x.id));
    if (error) throw error;
  }
  for (const x of restore) {
    const { error } = await retry(() => db.from('institutions').update({ type: x.back }).eq('id', x.id));
    if (error) throw error;
  }
  console.log('done');
}
