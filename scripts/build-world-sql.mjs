// Turns data/seed/wikidata-world.json (made by scripts/fetch-wikidata-world.mjs) into SQL files of 400
// institutions each: supabase/data/institutions_world_01.sql, _02.sql, ...
// Run: node scripts/build-world-sql.mjs
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';

const { institutions } = JSON.parse(readFileSync('data/seed/wikidata-world.json', 'utf8'));
const CHUNK = 400;
const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`);

mkdirSync('supabase/data', { recursive: true });
for (const f of readdirSync('supabase/data')) if (/^institutions_world.*\.sql$/.test(f)) rmSync(`supabase/data/${f}`);

// Group by country so that each file covers neighbouring countries.
const sorted = [...institutions].sort((a, b) => a.country.localeCompare(b.country) || a.slug.localeCompare(b.slug));
const parts = Math.ceil(sorted.length / CHUNK);
for (let p = 0; p < parts; p++) {
  const part = sorted.slice(p * CHUNK, (p + 1) * CHUNK);
  const rows = part.map(
    (i) =>
      `  (${q(i.slug)}, ${q(i.type)}, ${q(i.country)}, ${q(JSON.stringify(i.city))}::jsonb, ${q(JSON.stringify(i.names))}::jsonb, extensions.ST_SetSRID(extensions.ST_MakePoint(${i.lng}, ${i.lat}), 4326)::extensions.geography, ${q(i.website)}, ${i.foundedYear ?? 'null'}, ${q(JSON.stringify({ wikidata: i.wikidata }))}::jsonb)`,
  );
  const name = `institutions_world_${String(p + 1).padStart(2, '0')}.sql`;
  writeFileSync(
    `supabase/data/${name}`,
    `-- Part ${p + 1} of ${parts}: universities and colleges from Wikidata (CC0), ${rows.length} rows (${part[0].country}..${part.at(-1).country}). Run all parts, in any order.
-- Institutions already in the database (same Wikidata id) are left as they are. Safe to run again.
insert into public.institutions (slug, type, country, city, names, location, website, founded_year, external_ids)
select v.* from (values
${rows.join(',\n')}
) as v(slug, type, country, city, names, location, website, founded_year, external_ids)
where not exists (
  select 1 from public.institutions i where i.external_ids ->> 'wikidata' = v.external_ids ->> 'wikidata'
)
on conflict (country, slug) do nothing;
`,
  );
}
console.log(`${institutions.length} institutions -> ${parts} files in supabase/data/`);