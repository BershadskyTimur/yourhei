// Turns data/seed/wikidata-other.json (schools, vocational schools, colleges...) and data/seed/osm-language-schools.json
// into SQL files of 400 institutions each: supabase/data/institutions_other_01.sql, _02.sql, ...
// Run: node scripts/build-other-sql.mjs
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';

const FILES = ['data/seed/wikidata-other.json', 'data/seed/osm-language-schools.json', 'data/seed/osm-region.json'];
const institutions = FILES.filter(existsSync).flatMap((f) => JSON.parse(readFileSync(f, 'utf8')).institutions);
const CHUNK = 400;
const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`);
const ext = (i) => (i.wikidata ? { key: 'wikidata', value: i.wikidata } : { key: 'osm', value: i.osm });

mkdirSync('supabase/data', { recursive: true });
for (const f of readdirSync('supabase/data')) if (/^institutions_other.*\.sql$/.test(f)) rmSync(`supabase/data/${f}`);

const sorted = [...institutions].sort((a, b) => a.country.localeCompare(b.country) || a.type.localeCompare(b.type) || a.slug.localeCompare(b.slug));
const parts = Math.ceil(sorted.length / CHUNK);
for (let p = 0; p < parts; p++) {
  const part = sorted.slice(p * CHUNK, (p + 1) * CHUNK);
  const rows = part.map((i) => {
    const e = ext(i);
    return `  (${q(i.slug)}, ${q(i.type)}, ${q(i.country)}, ${q(JSON.stringify(i.city))}::jsonb, ${q(JSON.stringify(i.names))}::jsonb, extensions.ST_SetSRID(extensions.ST_MakePoint(${i.lng}, ${i.lat}), 4326)::extensions.geography, ${q(i.website)}, ${i.foundedYear ?? 'null'}, ${q(JSON.stringify({ [e.key]: e.value }))}::jsonb)`;
  });
  const name = `institutions_other_${String(p + 1).padStart(2, '0')}.sql`;
  writeFileSync(
    `supabase/data/${name}`,
    `-- Part ${p + 1} of ${parts}: schools, vocational schools, colleges and language schools (Wikidata CC0, OpenStreetMap ODbL), ${rows.length} rows (${part[0].country}..${part.at(-1).country}). Run all parts, in any order.
-- Institutions already in the database (same Wikidata / OpenStreetMap id) are left as they are. Safe to run again.
insert into public.institutions (slug, type, country, city, names, location, website, founded_year, external_ids)
select v.* from (values
${rows.join(',\n')}
) as v(slug, type, country, city, names, location, website, founded_year, external_ids)
where not exists (
  select 1 from public.institutions i
  where (v.external_ids ? 'wikidata' and i.external_ids ->> 'wikidata' = v.external_ids ->> 'wikidata')
     or (v.external_ids ? 'osm' and i.external_ids ->> 'osm' = v.external_ids ->> 'osm')
)
on conflict (country, slug) do nothing;
`,
  );
}
console.log(`${institutions.length} institutions -> ${parts} files in supabase/data/`);