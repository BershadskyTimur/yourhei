// Fetches language schools from OpenStreetMap (ODbL, the site credits OpenStreetMap contributors in the footer)
// and writes data/seed/osm-language-schools.json (resumable). Only schools that have a name AND a website are
// taken, up to a few per country: these are the ones a visitor can actually contact.
//   Run:  node scripts/fetch-osm-language-schools.mjs
// OpenStreetMap's free servers are shared by everyone: the script asks for one country at a time and waits between requests.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT = 'data/seed/osm-language-schools.json';
const regions = JSON.parse(readFileSync('data/reference/regions.json', 'utf8'));
const COUNTRIES = [...new Set(regions.flatMap((r) => r.countries))];
const PER_COUNTRY = 8;
const MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];

// Territories whose status is disputed are left out (SPEC.md section 5): rough boxes [south, west, north, east].
const DISPUTED = [
  [44.3, 32.4, 46.3, 36.7], [42.6, 40.0, 43.6, 42.0], [42.1, 43.6, 42.8, 44.9], [46.4, 28.5, 48.2, 29.95], [47.0, 37.5, 49.5, 40.3],
];
const disputed = (lat, lng) => DISPUTED.some(([s, w, n, e]) => lat >= s && lat <= n && lng >= w && lng <= e);
const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const webOk = (v) => {
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
};

async function overpass(cc) {
  const q = `[out:json][timeout:90];area["ISO3166-1"="${cc}"]->.a;(node["amenity"="language_school"]["name"]["website"](area.a);way["amenity"="language_school"]["name"]["website"](area.a););out center tags 60;`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const base = MIRRORS[attempt % MIRRORS.length];
    try {
      const res = await fetch(base, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(q),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'YourHEI-dev/0.1 (student project)' },
        signal: AbortSignal.timeout(120_000),
      });
      if (res.ok) return (await res.json()).elements ?? [];
      console.warn(`  ${cc} HTTP ${res.status} at ${base}`);
    } catch (e) {
      console.warn(`  ${cc} retry ${attempt + 1}: ${String(e.message ?? e).slice(0, 60)}`);
    }
    await sleep(8000 * (attempt + 1));
  }
  return null;
}

mkdirSync('data/seed', { recursive: true });
const state = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { doneCountries: [], institutions: [] };
const save = () => writeFileSync(OUT, JSON.stringify(state) + '\n');

for (const cc of COUNTRIES) {
  if (state.doneCountries.includes(cc)) continue;
  const found = await overpass(cc);
  if (found === null) {
    console.log(`${cc}: FAILED (will be retried on the next run)`);
    continue;
  }
  let kept = 0;
  for (const el of found) {
    if (kept >= PER_COUNTRY) break;
    const t = el.tags ?? {};
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    const website = webOk(t.website ?? t['contact:website'] ?? '');
    if (lat == null || lng == null || !website || !t.name || disputed(lat, lng)) continue;
    const osm = `${el.type}/${el.id}`;
    if (state.institutions.some((i) => i.osm === osm)) continue;
    const names = { original: t.name };
    if (t['name:en']) names.en = t['name:en'];
    else if (/^[\x20-\x7EÀ-ɏ]+$/.test(t.name)) names.en = t.name; // already in Latin letters
    if (t['name:ru']) names.ru = t['name:ru'];
    const city = t['addr:city'] ?? t['addr:town'] ?? null;
    state.institutions.push({
      country: cc, type: 'language_school', names, city: city ? { original: city } : {},
      lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6, website, foundedYear: null, osm,
    });
    kept++;
  }
  state.doneCountries.push(cc);
  save();
  console.log(`${cc}: ${kept} kept (total ${state.institutions.length}; ${state.doneCountries.length}/${COUNTRIES.length} countries)`);
  await sleep(4000);
}

// unique slugs per country
const used = new Set();
for (const f of ['data/seed/wikidata-region.json', 'data/seed/wikidata-world.json', 'data/seed/wikidata-other.json']) {
  if (existsSync(f)) for (const i of JSON.parse(readFileSync(f, 'utf8')).institutions) if (i.slug) used.add(`${i.country}/${i.slug}`);
}
for (const r of state.institutions) {
  let slug = slugify(r.names.en ?? '') || `osm-${r.osm.replace('/', '-')}`;
  if (used.has(`${r.country}/${slug}`)) slug = `${slug}-${r.osm.replace('/', '-')}`;
  used.add(`${r.country}/${slug}`);
  r.slug = slug;
}
save();
console.log(`Done: ${state.institutions.length} language schools in ${state.doneCountries.length} countries.`);
