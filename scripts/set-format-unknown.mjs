// The loader (scripts/load-programs.mjs) used to mark every programme "on_campus" although the official sources do not
// say how a programme is taught. That made "online" or "blended" in the survey give almost no matches. This script sets
// the study format of those programmes to empty ("unknown"), which the matcher lets through.
//   node scripts/set-format-unknown.mjs           counts only
//   node scripts/set-format-unknown.mjs --apply   changes the rows
// Needs SUPABASE_SERVICE_ROLE_KEY in .env.local (temporarily). Only programmes loaded by load-programs.mjs
// (they have requirements.source) and marked on_campus are touched.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const apply = process.argv.includes('--apply');

const count = async (q) => {
  const { count, error } = await q;
  if (error) throw error;
  return count;
};
const base = () => db.from('programs').select('id', { count: 'exact', head: true });
const target = () => base().eq('format', 'on_campus').not('requirements->>source', 'is', null);

console.log('all programmes     :', await count(base()));
console.log('on_campus          :', await count(base().eq('format', 'on_campus')));
console.log('online / blended   :', await count(base().eq('format', 'online')), '/', await count(base().eq('format', 'blended')));
console.log('already unknown    :', await count(base().is('format', null)));
const n = await count(target());
console.log('to be set unknown  :', n);

if (apply) {
  // in groups of institutions so that no single request is too big
  // (the database returns at most 1000 rows per request, so the institutions are read page by page)
  const ids = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from('institutions').select('id').order('id').range(from, from + 999);
    if (error) throw error;
    ids.push(...data.map((i) => i.id));
    if (data.length < 1000) break;
  }
  let changed = 0;
  const GROUP = 25; // small groups: a bigger one can run into the database time limit
  for (let i = 0; i < ids.length; i += GROUP) {
    for (let attempt = 0; ; attempt++) {
      const { data, error: e } = await db
        .from('programs')
        .update({ format: null })
        .in('institution_id', ids.slice(i, i + GROUP))
        .eq('format', 'on_campus')
        .not('requirements->>source', 'is', null)
        .select('id');
      if (!e) {
        changed += data.length;
        break;
      }
      if (e.code !== '57014' || attempt >= 4) throw e;
    }
    if ((i / GROUP) % 40 === 0) console.log(`  ${i}/${ids.length} institutions, ${changed} programmes so far`);
  }
  console.log('changed            :', changed);
  console.log('left on_campus     :', await count(base().eq('format', 'on_campus')));
}
