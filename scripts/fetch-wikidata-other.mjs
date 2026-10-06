// Fetches the institutions that are not plain universities - schools, vocational schools, community /
// technical colleges, conservatories, universities of applied sciences - from Wikidata (CC0).
// Writes data/seed/wikidata-other.json (resumable: finished countries are skipped).
//   Run:  node scripts/fetch-wikidata-other.mjs
//   Then: node scripts/build-other-sql.mjs   (or: node scripts/load-institutions.mjs data/seed/wikidata-other.json)
// The best described institutions (most Wikipedia languages) come first in every country.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT = 'data/seed/wikidata-other.json';
const regions = JSON.parse(readFileSync('data/reference/regions.json', 'utf8'));
const COUNTRIES = [...new Set(regions.flatMap((r) => r.countries))];

// type -> Wikidata classes, and how many per country (big countries get more)
const GROUPS = [
  {
    type: 'school',
    limit: 10,
    big: 25,
    classes: ['Q572835', 'Q123523193', 'Q3423323', 'Q269770', 'Q2418495', 'Q3238833', 'Q9826', 'Q159334', 'Q10947886', 'Q1314860', 'Q55043', 'Q1542966', 'Q16969697', 'Q16463', 'Q4367464', 'Q1703577', 'Q12241709', 'Q423208'],
  },
  { type: 'vocational', limit: 8, big: 20, classes: ['Q322563', 'Q2696153', 'Q7692354', 'Q59419153', 'Q1021290'] },
  { type: 'college', limit: 8, big: 20, classes: ['Q1336920', 'Q370258', 'Q6313528', 'Q184644', 'Q17028020', 'Q20077174'] },
  { type: 'university', limit: 6, big: 15, classes: ['Q1365560', 'Q19152599', 'Q845392'] },
  { type: 'language_school', limit: 6, big: 10, classes: ['Q897403'] },
];
const BIG = new Set(['US', 'CN', 'IN', 'JP', 'BR', 'GB', 'DE', 'FR', 'IT', 'ES', 'MX', 'CA', 'AU', 'RU', 'KR', 'TR', 'ID', 'PL', 'UA', 'IR', 'PK']);

// Territories whose status is disputed are left out (SPEC.md section 5): rough boxes [south, west, north, east].
const DISPUTED = [
  ['Crimea', 44.3, 32.4, 46.3, 36.7],
  ['Abkhazia', 42.6, 40.0, 43.6, 42.0],
  ['South Ossetia', 42.1, 43.6, 42.8, 44.9],
  ['Transnistria', 46.4, 28.5, 48.2, 29.95],
  ['Donetsk and Luhansk', 47.0, 37.5, 49.5, 40.3],
];
const disputed = (lat, lng) => DISPUTED.some(([, s, w, n, e]) => lat >= s && lat <= n && lng >= w && lng <= e);

const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);

async function sparql(query) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query), {
        headers: { 'User-Agent': 'YourHEI-dev/0.1 (student project)' },
        signal: AbortSignal.timeout(100_000),
      });
      if (res.ok) return (await res.json()).results.bindings;
      console.warn('  HTTP', res.status);
    } catch (e) {
      console.warn('  retry', attempt, String(e.message ?? e).slice(0, 60));
    }
    await new Promise((r) => setTimeout(r, 5000 * attempt));
  }
  return null;
}
const val = (x) => (x && x.value ? x.value : null);

const idRows = await sparql(`SELECT ?code ?c WHERE { ?c wdt:P297 ?code . FILTER(?code IN (${COUNTRIES.map((c) => `"${c}"`).join(',')})) }`);
if (!idRows) throw new Error('Wikidata is not reachable');
const qidOf = {};
for (const r of idRows) (qidOf[val(r.code)] ??= []).push(val(r.c).split('/').pop());
Object.assign(qidOf, { NL: ['Q29999', 'Q55'], CY: ['Q229'] });

// Wikidata ids already in the database files: never add the same institution twice.
const known = new Set();
for (const f of ['data/seed/wikidata-region.json', 'data/seed/wikidata-world.json']) {
  if (existsSync(f)) for (const i of JSON.parse(readFileSync(f, 'utf8')).institutions) known.add(i.wikidata);
}

mkdirSync('data/seed', { recursive: true });
const state = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { doneCountries: [], institutions: [] };
const seen = new Set([...known, ...state.institutions.map((i) => i.wikidata)]);
const save = () => writeFileSync(OUT, JSON.stringify(state) + '\n');

for (const cc of COUNTRIES) {
  if (state.doneCountries.includes(cc)) continue;
  const qid = qidOf[cc];
  if (!qid?.length) {
    state.doneCountries.push(cc);
    continue;
  }
  let kept = 0;
  let failed = false;
  for (const g of GROUPS) {
    const limit = BIG.has(cc) ? g.big : g.limit;
    const q = `SELECT ?item ?coord ?site ?inc ?cityL ?sl
 (SAMPLE(?len) AS ?en) (SAMPLE(?lru) AS ?ru) (SAMPLE(?lka) AS ?ka) (SAMPLE(?les) AS ?es) (SAMPLE(?lzh) AS ?zh)
 (SAMPLE(?luk) AS ?uk) (SAMPLE(?lhy) AS ?hy) (SAMPLE(?lkk) AS ?kk) (SAMPLE(?lnat) AS ?nat) WHERE {
  VALUES ?cls { ${g.classes.map((c) => 'wd:' + c).join(' ')} }
  VALUES ?country { ${qid.map((c) => 'wd:' + c).join(' ')} }
  ?item wdt:P31 ?cls; wdt:P17 ?country; wikibase:sitelinks ?sl .
  ?item wdt:P625|wdt:P131/wdt:P625|wdt:P159/wdt:P625 ?coord .
  ?item rdfs:label ?len FILTER(lang(?len)="en")
  OPTIONAL { ?item wdt:P856 ?site } OPTIONAL { ?item wdt:P571 ?inc }
  OPTIONAL { ?item wdt:P131 ?city . ?city rdfs:label ?cityL FILTER(lang(?cityL)="en") }
  OPTIONAL { ?item rdfs:label ?lru FILTER(lang(?lru)="ru") }
  OPTIONAL { ?item rdfs:label ?lka FILTER(lang(?lka)="ka") }
  OPTIONAL { ?item rdfs:label ?les FILTER(lang(?les)="es") }
  OPTIONAL { ?item rdfs:label ?lzh FILTER(lang(?lzh)="zh" || lang(?lzh)="zh-hans" || lang(?lzh)="zh-cn") }
  OPTIONAL { ?item rdfs:label ?luk FILTER(lang(?luk)="uk") }
  OPTIONAL { ?item rdfs:label ?lhy FILTER(lang(?lhy)="hy") }
  OPTIONAL { ?item rdfs:label ?lkk FILTER(lang(?lkk)="kk") }
  OPTIONAL { ?item wdt:P1448 ?lnat }
} GROUP BY ?item ?coord ?site ?inc ?cityL ?sl ORDER BY DESC(?sl) LIMIT ${limit * 3}`;
    const found = await sparql(q);
    if (found === null) {
      failed = true;
      break;
    }
    let n = 0;
    for (const r of found) {
      if (n >= limit) break;
      const wikidata = val(r.item).split('/').pop();
      const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(val(r.coord) ?? '');
      const en = val(r.en);
      if (!m || !en || seen.has(wikidata)) continue;
      const lng = Number(m[1]);
      const lat = Number(m[2]);
      if (disputed(lat, lng)) continue;
      seen.add(wikidata);
      const names = { original: val(r.nat) ?? en };
      for (const l of ['en', 'ru', 'ka', 'es', 'zh', 'uk', 'hy', 'kk']) if (val(r[l])) names[l] = val(r[l]);
      const city = val(r.cityL);
      const inc = val(r.inc);
      state.institutions.push({
        country: cc, type: g.type, names, city: city ? { en: city } : {},
        lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6,
        website: val(r.site), foundedYear: inc ? Number(inc.slice(0, 4)) || null : null, wikidata,
      });
      n++;
      kept++;
    }
    await new Promise((r) => setTimeout(r, 1200));
  }
  if (failed) {
    console.log(`${cc}: FAILED (will be retried on the next run)`);
    continue;
  }
  state.doneCountries.push(cc);
  save();
  console.log(`${cc}: ${kept} kept (total ${state.institutions.length}; ${state.doneCountries.length}/${COUNTRIES.length} countries)`);
}

// unique slugs per country (also against the slugs of the earlier files)
const used = new Set();
for (const f of ['data/seed/wikidata-region.json', 'data/seed/wikidata-world.json']) {
  if (existsSync(f)) for (const i of JSON.parse(readFileSync(f, 'utf8')).institutions) used.add(`${i.country}/${i.slug}`);
}
for (const r of state.institutions) {
  let slug = slugify(r.names.en) || r.wikidata.toLowerCase();
  if (used.has(`${r.country}/${slug}`)) slug = `${slug}-${r.wikidata.toLowerCase()}`;
  used.add(`${r.country}/${slug}`);
  r.slug = slug;
}
save();
console.log(`Done: ${state.institutions.length} institutions in ${state.doneCountries.length} countries.`);
