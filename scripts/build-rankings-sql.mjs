// University rankings from Wikidata (CC0): the latest position of each institution in the QS, THE and Shanghai (ARWU) world
// rankings, and in the Best Chinese Universities Ranking (a country ranking). Builds supabase/data/rankings_wikidata.sql.
//   node scripts/build-rankings-sql.mjs
// Only overall rankings are taken (statements about one subject or part are left out), only from 2022 on, and only for
// institutions that are in our database (matched by their Wikidata id). Running the SQL again replaces the earlier rows.
import { mkdirSync, writeFileSync } from 'node:fs';

const METHODS = {
  Q1790510: { name: 'QS World University Rankings', scope: 'world' },
  Q1318318: { name: 'THE World University Rankings', scope: 'world' },
  Q478743: { name: 'ARWU (Shanghai Ranking)', scope: 'world' },
  Q56274575: { name: 'Best Chinese Universities Ranking', scope: 'country' },
};
const FROM_YEAR = 2022;

const query = `SELECT ?u ?method ?pos ?y ?part WHERE {
  VALUES ?method { ${Object.keys(METHODS).map((q) => `wd:${q}`).join(' ')} }
  ?u p:P1352 ?st . ?st ps:P1352 ?pos ; pq:P459 ?method ; pq:P585 ?t ; wikibase:rank ?rank .
  FILTER(?rank != wikibase:DeprecatedRank)
  BIND(YEAR(?t) AS ?y)
  OPTIONAL { ?st pq:P518|pq:P642|pq:P1013 ?part }
}`;

const res = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`, {
  headers: { Accept: 'application/sparql-results+json', 'User-Agent': 'YourHEI-dev/0.1 (student project; yourheisupp@gmail.com)' },
  signal: AbortSignal.timeout(170_000),
});
if (!res.ok) throw new Error(`Wikidata answered ${res.status}`);
const rows = (await res.json()).results.bindings;

const qid = (uri) => uri.slice(uri.lastIndexOf('/') + 1);
// the latest year of each institution in each ranking; on the same year the best position
const best = new Map();
for (const r of rows) {
  if (r.part) continue; // a subject or a part of the institution, not the overall ranking
  const year = Number(r.y.value);
  const position = Math.round(Number(r.pos.value));
  if (year < FROM_YEAR || !Number.isFinite(position) || position < 1) continue;
  const key = `${qid(r.u.value)}|${qid(r.method.value)}`;
  const cur = best.get(key);
  if (!cur || year > cur.year || (year === cur.year && position < cur.position)) best.set(key, { year, position });
}

const lit = (s) => `'${String(s).replace(/'/g, "''")}'`;
const values = [...best.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([key, v]) => {
    const [wd, method] = key.split('|');
    const m = METHODS[method];
    return `  (${lit(wd)}, ${lit(m.name)}, ${v.year}, ${lit(v.position)}, ${lit(m.scope)}, ${lit(`https://www.wikidata.org/wiki/${wd}`)})`;
  });

const sql = `-- University rankings from Wikidata (CC0), built by scripts/build-rankings-sql.mjs on ${new Date().toISOString().slice(0, 10)}.
-- ${values.length} positions (QS, THE, ARWU world rankings and the Best Chinese Universities Ranking), latest year from ${FROM_YEAR}.
-- Only institutions already in the database get a row (matched by their Wikidata id). Safe to run again: the earlier rows
-- from Wikidata are replaced, rankings added by hand stay.
-- Paste into Supabase -> SQL Editor -> Run.
begin;
delete from public.rankings where source_url like 'https://www.wikidata.org/wiki/Q%';
insert into public.rankings (institution_id, name, year, position, scope, source_url)
select i.id, v.name, v.year, v.position, v.scope, v.url
from (values
${values.join(',\n')}
) as v(wikidata, name, year, position, scope, url)
join public.institutions i on i.external_ids ->> 'wikidata' = v.wikidata;
commit;
`;
mkdirSync('supabase/data', { recursive: true });
writeFileSync('supabase/data/rankings_wikidata.sql', sql);
const perRanking = {};
for (const key of best.keys()) perRanking[METHODS[key.split('|')[1]].name] = (perRanking[METHODS[key.split('|')[1]].name] ?? 0) + 1;
console.log(`${rows.length} statements read, ${values.length} positions written to supabase/data/rankings_wikidata.sql`, perRanking);
