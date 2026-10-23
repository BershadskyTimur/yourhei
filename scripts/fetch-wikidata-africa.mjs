// Fetches universities and colleges of Africa from Wikidata (CC0)
// and writes  data/seed/wikidata-africa.json  (raw, for review). It can be stopped and started again:
// countries that are already in the file are skipped.
//   Run:  node scripts/fetch-wikidata-africa.mjs
//   Then: node scripts/load-institutions.mjs data/seed/wikidata-africa.json
// Only open base data (names, coordinates, website, year): programmes are collected separately.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT = 'data/seed/wikidata-africa.json';
// The countries of Africa (ISO 3166-1). Western Sahara is left out (its status is disputed, SPEC.md section 5).
const WANTED = [
  'DZ', 'AO', 'BJ', 'BW', 'BF', 'BI', 'CV', 'CM', 'CF', 'TD', 'KM', 'CG', 'CD', 'CI', 'DJ', 'EG', 'GQ', 'ER', 'SZ', 'ET', 'GA', 'GM', 'GH', 'GN',
  'GW', 'KE', 'LS', 'LR', 'LY', 'MG', 'MW', 'ML', 'MR', 'MU', 'MA', 'MZ', 'NA', 'NE', 'NG', 'RW', 'ST', 'SN', 'SC', 'SL', 'SO', 'ZA', 'SS', 'SD',
  'TZ', 'TG', 'TN', 'UG', 'ZM', 'ZW',
];

// How many per country: the best described (most Wikipedia languages) come first. "As many as possible": the big ones get more.
const HUGE = { EG: 140, NG: 140, ZA: 120, MA: 90, DZ: 90, TN: 80, KE: 80, ET: 70, GH: 70, UG: 60, TZ: 60, SD: 50, CM: 50, SN: 40, CI: 40 };
const DEFAULT_LIMIT = 40;

// Classes of higher education institutions in Wikidata.
const UNIVERSITY = ['Q3918', 'Q875538', 'Q902104', 'Q15936437', 'Q38723', 'Q62078547'];
const COLLEGE = ['Q189004', 'Q1321960'];

// Territories whose status is disputed are left out (SPEC.md section 5): rough boxes [south, west, north, east].
const DISPUTED = [
  ['Western Sahara', 20.7, -17.2, 27.7, -8.6],
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

// ISO code -> Wikidata id of the country
const idRows = await sparql(`SELECT ?code ?c WHERE { ?c wdt:P297 ?code . FILTER(?code IN (${WANTED.map((c) => `"${c}"`).join(',')})) }`);
if (!idRows) throw new Error('Wikidata is not reachable');
// A code can have several Wikidata entries (e.g. the Kingdom of the Netherlands and the country Netherlands).
const qidOf = {};
for (const r of idRows) (qidOf[val(r.code)] ??= []).push(val(r.c).split('/').pop());

mkdirSync('data/seed', { recursive: true });
const state = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { doneCountries: [], institutions: [], droppedDisputed: [] };
const seen = new Set(state.institutions.map((i) => i.wikidata));
const save = () => writeFileSync(OUT, JSON.stringify(state) + '\n');

for (const cc of WANTED) {
  if (state.doneCountries.includes(cc)) continue;
  const qid = qidOf[cc];
  const limit = HUGE[cc] ?? DEFAULT_LIMIT;
  if (!qid?.length || limit === 0) {
    state.doneCountries.push(cc);
    continue;
  }
  let kept = 0;
  let failed = false;
  for (const [type, classes] of [['university', UNIVERSITY], ['college', COLLEGE]]) {
    const typeLimit = type === 'college' ? Math.max(5, Math.round(limit / 4)) : limit;
    const q = `SELECT ?item ?coord ?site ?inc ?cityL ?sl
 (SAMPLE(?len) AS ?en) (SAMPLE(?lru) AS ?ru) (SAMPLE(?lka) AS ?ka) (SAMPLE(?les) AS ?es) (SAMPLE(?lzh) AS ?zh)
 (SAMPLE(?luk) AS ?uk) (SAMPLE(?lhy) AS ?hy) (SAMPLE(?lkk) AS ?kk) (SAMPLE(?lnat) AS ?nat) WHERE {
  VALUES ?cls { ${classes.map((c) => 'wd:' + c).join(' ')} }
  VALUES ?country { ${qid.map((c) => 'wd:' + c).join(' ')} }
  ?item wdt:P31 ?cls; wdt:P17 ?country; wikibase:sitelinks ?sl .
  # coordinates of the institution itself, else of its city (many entries have none of their own)
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
} GROUP BY ?item ?coord ?site ?inc ?cityL ?sl ORDER BY DESC(?sl) LIMIT ${typeLimit * 2}`;
    const found = await sparql(q);
    if (found === null) {
      failed = true;
      break;
    }
    let n = 0;
    for (const r of found) {
      if (n >= typeLimit) break;
      const wikidata = val(r.item).split('/').pop();
      const m = /Point\(([-\d.]+) ([-\d.]+)\)/.exec(val(r.coord) ?? '');
      const en = val(r.en);
      if (!m || !en || seen.has(wikidata)) continue;
      const lng = Number(m[1]);
      const lat = Number(m[2]);
      const where = disputed(lat, lng);
      if (where) {
        state.droppedDisputed.push({ wikidata, name: en, country: cc, reason: where });
        continue;
      }
      seen.add(wikidata);
      const names = { original: val(r.nat) ?? en };
      for (const l of ['en', 'ru', 'ka', 'es', 'zh', 'uk', 'hy', 'kk']) if (val(r[l])) names[l] = val(r[l]);
      const city = val(r.cityL);
      const inc = val(r.inc);
      state.institutions.push({
        country: cc, type, names, city: city ? { en: city } : {},
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
  console.log(`${cc}: ${kept} kept (total ${state.institutions.length}; ${state.doneCountries.length}/${WANTED.length} countries)`);
}

// unique slugs per country
const used = new Set();
for (const r of state.institutions) {
  let slug = slugify(r.names.en) || r.wikidata.toLowerCase();
  if (used.has(`${r.country}/${slug}`)) slug = `${slug}-${r.wikidata.toLowerCase()}`;
  used.add(`${r.country}/${slug}`);
  r.slug = slug;
}
save();
console.log(`Done: ${state.institutions.length} institutions in ${state.doneCountries.length} countries.`);
