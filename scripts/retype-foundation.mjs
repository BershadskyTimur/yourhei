// Marks the institutions that teach ONLY foundation (preparatory) programmes, with or without language courses, as type
// "foundation" (they were mixed in with language schools and colleges, so the "Foundation programmes" filter on the map
// showed 0). A university or college with other programmes as well keeps its type.
//   node scripts/retype-foundation.mjs           shows what would change (works with the public key)
//   node scripts/retype-foundation.mjs --apply   changes the rows (needs SUPABASE_SERVICE_ROLE_KEY in .env.local)
import { readFileSync } from 'node:fs';
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
    if (!res.error || res.error.code !== '57014' || i >= 4) return res;
  }
}

// every institution that has a foundation programme (the database returns 1000 rows at a time)
const withFoundation = new Set();
for (let from = 0; ; from += 1000) {
  const { data, error } = await retry(() => db.from('programs').select('institution_id').eq('level', 'foundation').eq('status', 'published').order('institution_id').range(from, from + 999));
  if (error) throw error;
  data.forEach((r) => withFoundation.add(r.institution_id));
  if (data.length < 1000) break;
}
console.log('institutions with a foundation programme:', withFoundation.size);

const ids = [...withFoundation];
const change = [];
for (let i = 0; i < ids.length; i += 50) {
  const part = ids.slice(i, i + 50);
  const { data: others, error } = await retry(() => db.from('programs').select('institution_id').in('institution_id', part).eq('status', 'published').not('level', 'in', '(foundation,language_course)').limit(5000));
  if (error) throw error;
  const hasOther = new Set(others.map((r) => r.institution_id));
  const { data: inst, error: e2 } = await retry(() => db.from('institutions').select('id, type, slug, names').in('id', part));
  if (e2) throw e2;
  for (const x of inst) if (!hasOther.has(x.id) && x.type !== 'foundation') change.push(x);
}
console.log('to become type "foundation":', change.length);
for (const x of change.slice(0, 15)) console.log('  ', x.type, '->', 'foundation', '|', x.names?.en ?? x.slug);

if (apply) {
  for (let i = 0; i < change.length; i += 50) {
    const { error } = await retry(() => db.from('institutions').update({ type: 'foundation' }).in('id', change.slice(i, i + 50).map((x) => x.id)));
    if (error) throw error;
  }
  console.log('done');
}
