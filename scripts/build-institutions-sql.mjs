// Turns data/seed/wikidata-region.json (made by scripts/fetch-wikidata.mjs) into SQL files of 150
// institutions each: supabase/data/institutions_region_01.sql, _02.sql, ...
// Smaller files are easier to paste into the Supabase SQL editor. Run: node scripts/build-institutions-sql.mjs
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';

const { institutions } = JSON.parse(readFileSync('data/seed/wikidata-region.json', 'utf8'));
const CHUNK = 150;
const q = (s) => (s == null ? 'null' : `'${String(s).replace(/'/g, "''")}'`);

mkdirSync('supabase/data', { recursive: true });
for (const f of readdirSync('supabase/data')) if (/^institutions_region.*\.sql$/.test(f)) rmSync(`supabase/data/${f}`);

const parts = Math.ceil(institutions.length / CHUNK);
for (let p = 0; p < parts; p++) {
  const rows = institutions.slice(p * CHUNK, (p + 1) * CHUNK).map(
    (i) =>
      `  (${q(i.slug)}, ${q(i.type)}, ${q(i.country)}, ${q(JSON.stringify(i.city))}::jsonb, ${q(JSON.stringify(i.names))}::jsonb, extensions.ST_SetSRID(extensions.ST_MakePoint(${i.lng}, ${i.lat}), 4326)::extensions.geography, ${q(i.website)}, ${i.foundedYear ?? 'null'}, ${q(JSON.stringify({ wikidata: i.wikidata }))}::jsonb)`,
  );
  const name = `institutions_region_${String(p + 1).padStart(2, '0')}.sql`;
  writeFileSync(
    `supabase/data/${name}`,
    `-- Part ${p + 1} of ${parts}: universities and colleges from Wikidata (CC0), ${rows.length} rows. Run all parts, in any order.
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
