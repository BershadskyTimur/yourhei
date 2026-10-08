import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env = Object.fromEntries(readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
// institutions by country and type (published), paged
const inst = {};
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from('institutions').select('country, type').eq('status', 'published').range(from, from + 999);
  if (error) throw error;
  for (const r of data) { const c = (inst[r.country] ??= { total: 0 }); c.total++; c[r.type] = (c[r.type] ?? 0) + 1; }
  if (data.length < 1000) break;
}
// programmes by country via the catalog function is too slow; sample counts with exact count per country for a few
const target = ['GE', 'AM', 'AZ', 'KZ', 'UZ', 'KG', 'TR', 'UA', 'BY', 'RU', 'CZ', 'PL', 'HU', 'DE', 'AT', 'IT', 'ES', 'FR', 'NL', 'GB', 'IE', 'US', 'CA', 'AU', 'CN', 'KR', 'JP', 'MY', 'SG', 'AE', 'LT', 'LV', 'EE', 'FI', 'SE'];
const rows = [];
for (const c of target) {
  const { count } = await sb.from('programs').select('id, institutions!inner(country)', { count: 'estimated', head: true }).eq('status', 'published').eq('institutions.country', c);
  rows.push({ c, inst: inst[c]?.total ?? 0, uni: inst[c]?.university ?? 0, school: inst[c]?.school ?? 0, lang: inst[c]?.language_school ?? 0, college: inst[c]?.college ?? 0, programs: count ?? '?' });
}
console.table(rows);
console.log('total institutions', Object.values(inst).reduce((a, b) => a + b.total, 0), 'countries', Object.keys(inst).length);
