// Loads institutions WITH their programmes from a generated file (built from an official open dataset) into your
// Supabase database:
//   node scripts/load-programs.mjs data/generated/cricos.json
// Needs SUPABASE_SERVICE_ROLE_KEY in .env.local (SECRET: only on your computer; remove it afterwards).
// For every institution in the file:
//   - the institution is created if it is not in the database yet (otherwise the existing row is used);
//   - its programmes that came from the same source earlier are replaced (so it is safe to run again);
//   - each programme gets a source row with a link to the official register (see DATA_COLLECTION.md rule 3).
// Programmes are saved as published, with confidence "medium": they come from an official register, but entry
// requirements and deadlines are not always in it.
// Speed: institutions are processed in groups of 100 and several groups at the same time.
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
const KEY = data.sourceKey ?? 'cricos';
const today = new Date().toISOString().slice(0, 10);
const now = new Date().toISOString();
const GROUP = 100;
const PARALLEL = 4;
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

async function processGroup(group) {
  // 1. ids of the institutions that exist already
  const idOf = new Map();
  const slugsByCountry = {};
  for (const i of group) (slugsByCountry[i.country] ??= []).push(i.slug);
  for (const [country, slugs] of Object.entries(slugsByCountry)) {
    const { data: rows, error } = await supabase.from('institutions').select('id, slug, ownership, size, website').eq('country', country).in('slug', slugs);
    check('read institutions', error);
    for (const r of rows) idOf.set(`${country}/${r.slug}`, r);
  }

  // 2. create the missing ones (one request)
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
      .select('id, country, slug, ownership, size, website');
    check('create institutions', error);
    for (const r of rows) idOf.set(`${r.country}/${r.slug}`, r);
    created += missing.length;
  }
  const withId = group.filter((i) => idOf.has(`${i.country}/${i.slug}`)).map((i) => ({ i, row: idOf.get(`${i.country}/${i.slug}`) }));
  const ids = withId.map((x) => x.row.id);

  // 3. publish the institution cards (one request) and fill what is empty (never overwrite what a person has edited)
  check('publish institutions', (await supabase.from('institutions').update({ status: 'published', verified_at: now }).in('id', ids)).error);
  for (const { i, row } of withId) {
    const patch = {};
    if (!row.ownership && i.ownership) patch.ownership = i.ownership;
    if (!row.size && i.size) patch.size = i.size;
    if (!row.website && i.website) patch.website = i.website;
    if (Object.keys(patch).length) check('fill institution', (await supabase.from('institutions').update(patch).eq('id', row.id)).error);
  }

  // 4. remove the programmes that came from this source earlier (and their source rows)
  const { data: old, error: oldError } = await supabase.from('programs').select('id').in('institution_id', ids).eq('requirements->>source', KEY).limit(20000);
  check('read old programmes', oldError);
  for (const part of chunks(old.map((o) => o.id), 200)) {
    check('delete old sources', (await supabase.from('sources').delete().eq('entity', 'program').in('entity_id', part)).error);
    check('delete old programmes', (await supabase.from('programs').delete().in('id', part)).error);
  }

  // 5. new programmes (chunks of 1000) and one source row per programme with a price
  const rows = [];
  for (const { i, row } of withId) {
    for (const p of i.programs) {
      rows.push({
        meta: p,
        row: {
          institution_id: row.id,
          names: p.names, level: p.level, isced_f: p.isced_f, languages: p.languages, duration_years: p.duration_years,
          format: 'on_campus', intakes: [], tuition: p.tuition,
          free: p.tuition.length > 0 && p.tuition.every((t) => t.amount === 0),
          requirements: { source: KEY, source_code: p.cricos ?? p.code ?? null, faculty: p.faculty ?? null, documents: [], min_scores: [] },
          deadlines: p.deadlines ?? [], application_fee: p.applicationFee ?? null,
          application_url: p.applicationUrl ?? i.website ?? p.sourceUrl ?? null,
          academic_year: p.academic_year ?? String(new Date().getFullYear()),
          status: 'published', verified_at: now,
        },
      });
    }
  }
  for (const part of chunks(rows, 1000)) {
    const { data: inserted, error } = await supabase.from('programs').insert(part.map((x) => x.row)).select('id');
    check('insert programmes', error);
    programs += inserted.length;
    const sources = inserted.flatMap((r, k) => {
      const p = part[k].meta;
      return p.sourceUrl && p.tuition.length ? [{ entity: 'program', entity_id: r.id, field: 'tuition', url: p.sourceUrl, accessed_at: today, confidence: 'medium' }] : [];
    });
    for (const s of chunks(sources, 1000)) check('insert sources', (await supabase.from('sources').insert(s)).error);
  }
  institutions += group.length;
  console.log(`  ${institutions}/${data.institutions.length} institutions, ${programs} programmes (${created} institutions created)`);
}

const queue = chunks(data.institutions, GROUP);
await Promise.all(
  Array.from({ length: PARALLEL }, async () => {
    while (queue.length) await processGroup(queue.shift());
  }),
);
console.log(`Done. Source: ${SOURCE}`);
