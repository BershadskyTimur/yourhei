// Fetches universities and colleges of the countries of the region "Caucasus, Central Asia and
// Eastern Europe" from Wikidata (CC0) and writes
//   data/seed/wikidata-region.json   (raw, for review)
// then run  node scripts/build-institutions-sql.mjs  to make the SQL files for the Supabase SQL editor.
// Run: node scripts/fetch-wikidata.mjs
// Only open base data (names, coordinates, website): programmes are collected separately.
import { mkdirSync, writeFileSync } from 'node:fs';

const COUNTRIES = {
  AM: 'Q399', AZ: 'Q227', BY: 'Q184', GE: 'Q230', KZ: 'Q232', KG: 'Q813',
  MD: 'Q217', RU: 'Q159', TJ: 'Q863', TM: 'Q874', UZ: 'Q265', UA: 'Q212',
};
const CLASSES = { university: 'Q3918', college: 'Q189004' };
const LIMIT = { RU: 120, UA: 120 }; // the biggest countries: the largest/best described first, more later
const DEFAULT_LIMIT = 150;

// Institutions in territories whose status is disputed are left out until the owner decides
// (SPEC.md section 5). Rough boxes: [south, west, north, east].
const DISPUTED = [
  ['Crimea', 44.3, 32.4, 46.3, 36.7],
  ['Abkhazia', 42.6, 40.0, 43.6, 42.0],
  ['South Ossetia', 42.1, 43.6, 42.8, 44.9],
  ['Transnistria', 46.4, 28.5, 48.2, 29.95],
  ['Donetsk and Luhansk', 47.0, 37.5, 49.5, 40.3],
];
const disputed = (lat, lng) => DISPUTED.find(([, s, w, n, e]) => lat >= s && lat <= n && lng >= w && lng <= e)?.[0] ?? null;

const slugify = (s) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

async function sparql(query) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query), {
        headers: { 'User-Agent': 'YourHEI-dev/0.1 (student project)' },
        signal: AbortSignal.timeout(90_000),
      });
      if (res.ok) return (await res.json()).results.bindings;
      console.warn('  HTTP', res.status);
    } catch (e) {
      console.warn('  retry', attempt, String(e.message ?? e).slice(0, 60));
    }
    await new Promise((r) => setTimeout(r, 4000 * attempt));
  }
  return [];
}

const val = (x) => (x && x.value ? x.value : null);
const rows = [];
const seen = new Set();
const dropped = [];

for (const [cc, qid] of Object.entries(COUNTRIES)) {
  for (const [type, cls] of Object.entries(CLASSES)) {
    const limit = LIMIT[cc] ?? DEFAULT_LIMIT;
    const q = `SELECT ?item ?coord ?site ?inc ?cityL
 (SAMPLE(?len) AS ?en) (SAMPLE(?lru) AS ?ru) (SAMPLE(?lka) AS ?ka) (SAMPLE(?les) AS ?es) (SAMPLE(?lzh) AS ?zh) (SAMPLE(?lnat) AS ?nat) WHERE {
  ?item wdt:P31 wd:${cls}; wdt:P17 wd:${qid}; wdt:P625 ?coord .
  OPTIONAL { ?item wdt:P856 ?site } OPTIONAL { ?item wdt:P571 ?inc }
  OPTIONAL { ?item wdt:P131 ?city . ?city rdfs:label ?cityL FILTER(lang(?cityL)="en") }
  OPTIONAL { ?item rdfs:label ?len FILTER(lang(?len)="en") }
  OPTIONAL { ?item rdfs:label ?lru FILTER(lang(?lru)="ru") }
  OPTIONAL { ?item rdfs:label ?lka FILTER(lang(?lka)="ka") }
  OPTIONAL { ?item rdfs:label ?les FILTER(lang(?les)="es") }
  OPTIONAL { ?item rdfs:label ?lzh FILTER(lang(?lzh)="zh" || lang(?lzh)="zh-hans" || lang(?lzh)="zh-cn") }
  OPTIONAL { ?item wdt:P1448 ?lnat }
} GROUP BY ?item ?coord ?site ?inc ?cityL LIMIT ${limit}`;
    const found = await sparql(q);
    let kept = 0;
    for (const r of found) {
      const wikidata = val(r.item).split('/').pop();
      const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(val(r.coord) ?? '');
      const en = val(r.en);
      if (!m || !en || seen.has(wikidata)) continue;
      const lng = Number(m[1]);
      const lat = Number(m[2]);
      const where = disputed(lat, lng);
      if (where) {
        dropped.push({ wikidata, name: en, country: cc, reason: where });
        continue;
      }
      seen.add(wikidata);
      const names = { original: val(r.nat) ?? (cc === 'GE' ? val(r.ka) : null) ?? val(r.ru) ?? en };
      for (const l of ['en', 'ru', 'ka', 'es', 'zh']) if (val(r[l])) names[l] = val(r[l]);
      const city = val(r.cityL);
      const inc = val(r.inc);
      rows.push({
        country: cc, type, names, city: city ? { en: city } : {},
        lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6,
        website: val(r.site), foundedYear: inc ? Number(inc.slice(0, 4)) || null : null, wikidata,
      });
      kept++;
    }
    console.log(`${cc} ${type}: ${found.length} found, ${kept} kept`);
    await new Promise((r) => setTimeout(r, 1500));
  }
}

// unique slugs per country
const used = new Set();
for (const r of rows) {
  let slug = slugify(r.names.en) || r.wikidata.toLowerCase();
  if (used.has(`${r.country}/${slug}`)) slug = `${slug}-${r.wikidata.toLowerCase()}`;
  used.add(`${r.country}/${slug}`);
  r.slug = slug;
}

mkdirSync('data/seed', { recursive: true });
mkdirSync('supabase/data', { recursive: true });
writeFileSync('data/seed/wikidata-region.json', JSON.stringify({ institutions: rows, droppedDisputed: dropped }, null, 1) + '\n');

console.log(`Wrote ${rows.length} institutions; ${dropped.length} left out (disputed territories). Next: node scripts/build-institutions-sql.mjs`);
