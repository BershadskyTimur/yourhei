// Loads institutions WITH their programmes from a generated file (built from an official open dataset) into your
// Supabase database:
//   node scripts/load-programs.mjs data/generated/cricos.json
// Needs SUPABASE_SERVICE_ROLE_KEY in .env.local (SECRET: only on your computer; remove it afterwards).
// For every institution in the file:
//   - the institution is created if it is not in the database yet (otherwise the existing row is used);
//   - its programmes that came from the same source earlier are replaced (so it is safe to run again);
//   - each programme gets a source row with a link to the official register (see DATA_COLLECTION.md rule 3).
// Programmes are saved as published, with confidence "medium": they come from an official register, but entry
// requirements and deadlines are not in it.
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/load-programs.mjs data/generated/<file>.json');
  process.exit(1);
}
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
);
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Add SUPABASE_SERVICE_ROLE_KEY=... to .env.local first (see docs/SUPABASE_FILES.md).');
  process.exit(1);
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

const data = JSON.parse(readFileSync(file, 'utf8'));
const SOURCE = data.source ?? file;
const KEY = (data.sourceKey ?? 'cricos');
const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();
const check = (label, error) => {
  if (error) {
    console.error(`${label}: ${error.message}`);
    process.exit(1);
  }
};
const chunks = (list, n) => Array.from({ length: Math.ceil(list.length / n) }, (_, i) => list.slice(i * n, (i + 1) * n));

let institutions = 0;
let created = 0;
let programs = 0;
for (const group of chunks(data.institutions, 25)) {
  // 1. ids of the institutions that exist already
  const slugsByCountry = {};
  for (const i of group) (slugsByCountry[i.country] ??= []).push(i.slug);
  const idOf = new Map();
  for (const [country, slugs] of Object.entries(slugsByCountry)) {
    const { data: rows, error } = await supabase.from('institutions').select('id, slug').eq('country', country).in('slug', slugs);
    check('read institutions', error);
    for (const r of rows) idOf.set(`${country}/${r.slug}`, r.id);
  }

  // 2. create the missing ones
  const missing = group.filter((i) => !idOf.has(`${i.country}/${i.slug}`));
  if (missing.length) {
    const { data: rows, error } = await supabase
      .from('institutions')
      .insert(
        missing.map((i) => ({
          slug: i.slug, type: i.type, country: i.country, city: i.city, names: i.names,
          location: `SRID=4326;POINT(${i.lng} ${i.lat})`, website: i.website, ownership: i.ownership, size: i.size,
          external_ids: i.externalIds ?? { [KEY]: i.cricos }, status: 'published', verified_at: now,
        })),
      )
      .select('id, country, slug');
    check('create institutions', error);
    for (const r of rows) idOf.set(`${r.country}/${r.slug}`, r.id);
    created += missing.length;
  }

  for (const i of group) {
    const id = idOf.get(`${i.country}/${i.slug}`);
    if (!id) continue;
    // 3. publish the institution card; fill what is empty (never overwrite what a person has edited)
    const { data: cur } = await supabase.from('institutions').select('ownership, size, website').eq('id', id).single();
    const patch = { status: 'published', verified_at: now };
    if (cur && !cur.ownership && i.ownership) patch.ownership = i.ownership;
    if (cur && !cur.size && i.size) patch.size = i.size;
    if (cur && !cur.website && i.website) patch.website = i.website;
    check('update institution', (await supabase.from('institutions').update(patch).eq('id', id)).error);

    // 4. replace the programmes that came from this source
    const { data: old, error: oldError } = await supabase.from('programs').select('id').eq('institution_id', id).eq('requirements->>source', KEY);
    check('read old programmes', oldError);
    if (old.length) {
      const ids = old.map((o) => o.id);
      check('delete old sources', (await supabase.from('sources').delete().eq('entity', 'program').in('entity_id', ids)).error);
      check('delete old programmes', (await supabase.from('programs').delete().in('id', ids)).error);
    }
    if (!i.programs.length) continue;
    const rows = i.programs.map((p) => ({
      institution_id: id,
      names: p.names, level: p.level, isced_f: p.isced_f, languages: p.languages, duration_years: p.duration_years,
      format: 'on_campus', intakes: [], tuition: p.tuition, free: false,
      requirements: { source: KEY, source_code: p.cricos ?? p.code ?? null, documents: [], min_scores: [] },
      deadlines: [], application_url: i.website, academic_year: p.academic_year ?? String(new Date().getFullYear()),
      status: 'published', verified_at: now,
    }));
    const { data: inserted, error } = await supabase.from('programs').insert(rows).select('id, requirements');
    check('insert programmes', error);
    programs += inserted.length;
    // 5. one source row per programme with a price
    const sources = inserted.flatMap((row, k) => {
      const p = i.programs[k];
      return p.sourceUrl && p.tuition.length ? [{ entity: 'program', entity_id: row.id, field: 'tuition', url: p.sourceUrl, accessed_at: today, confidence: 'medium' }] : [];
    });
    if (sources.length) check('insert sources', (await supabase.from('sources').insert(sources)).error);
  }
  institutions += group.length;
  console.log(`  ${institutions}/${data.institutions.length} institutions, ${programs} programmes (${created} institutions created)`);
}
console.log(`Done. Source: ${SOURCE}`);
