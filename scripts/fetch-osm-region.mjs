// Fetches schools, colleges, vocational schools and language schools of chosen countries from OpenStreetMap
// (ODbL; the site credits OpenStreetMap contributors in the footer) and writes data/seed/osm-region.json (resumable).
//   Run:  node scripts/fetch-osm-region.mjs GE AM AZ
// Only places that have a name AND a website are taken: those are the ones an applicant can actually contact.
// OpenStreetMap's free servers are shared by everybody: one request at a time, with pauses.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const COUNTRIES = process.argv.slice(2).filter((c) => /^[A-Z]{2}$/.test(c));
if (!COUNTRIES.length) {
  console.error('Usage: node scripts/fetch-osm-region.mjs GE AM AZ');
  process.exit(1);
}
const OUT = 'data/seed/osm-region.json';
const MIRRORS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const KINDS = [
  { type: 'school', filter: '["amenity"="school"]', limit: 80 },
  { type: 'college', filter: '["amenity"="college"]', limit: 60 },
  { type: 'language_school', filter: '["amenity"="language_school"]', limit: 40 },
  { type: 'university', filter: '["amenity"="university"]', limit: 60 },
];
const DISPUTED = [[44.3, 32.4, 46.3, 36.7], [42.6, 40.0, 43.6, 42.0], [42.1, 43.6, 42.8, 44.9], [46.4, 28.5, 48.2, 29.95], [47.0, 37.5, 49.5, 40.3]];
const disputed = (lat, lng) => DISPUTED.some(([s, w, n, e]) => lat >= s && lat <= n && lng >= w && lng <= e);
const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const norm = (s) => s.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const webOk = (v) => {
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
};
const host = (u) => {
  try {
    return new URL(u).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

async function overpass(cc, filter) {
  const q = `[out:json][timeout:120];area["ISO3166-1"="${cc}"]->.a;(node${filter}["name"]["website"](area.a);way${filter}["name"]["website"](area.a););out center tags 400;`;
  for (let attempt = 0; attempt < 4; attempt++) {
    const base = MIRRORS[attempt % MIRRORS.length];
    try {
      const res = await fetch(base, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(q),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'YourHEI-dev/0.1 (student project)' },
        signal: AbortSignal.timeout(150_000),
      });
      if (res.ok) return (await res.json()).elements ?? [];
      console.warn(`  ${cc} HTTP ${res.status}`);
    } catch (e) {
      console.warn(`  ${cc} retry ${attempt + 1}: ${String(e.message ?? e).slice(0, 60)}`);
    }
    await sleep(10000 * (attempt + 1));
  }
  return null;
}

// already known institutions (never add the same place twice)
const known = new Set();
const used = new Set();
for (const f of ['data/seed/wikidata-region.json', 'data/seed/wikidata-world.json', 'data/seed/wikidata-other.json', 'data/seed/osm-language-schools.json']) {
  if (!existsSync(f)) continue;
  for (const i of JSON.parse(readFileSync(f, 'utf8')).institutions) {
    used.add(`${i.country}/${i.slug}`);
    for (const n of Object.values(i.names)) known.add(`${i.country}|${norm(n)}`);
    if (i.website) known.add(`${i.country}|host|${host(i.website)}`);
  }
}

mkdirSync('data/seed', { recursive: true });
const state = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { done: [], institutions: [] };
const save = () => writeFileSync(OUT, JSON.stringify(state) + '\n');
for (const i of state.institutions) {
  used.add(`${i.country}/${i.slug}`);
  known.add(`${i.country}|${norm(i.names.original)}`);
  if (i.website) known.add(`${i.country}|host|${host(i.website)}`);
}

for (const cc of COUNTRIES) {
  for (const kind of KINDS) {
    const key = `${cc}:${kind.type}`;
    if (state.done.includes(key)) continue;
    const found = await overpass(cc, kind.filter);
    if (found === null) {
      console.log(`${key}: FAILED (will be retried on the next run)`);
      continue;
    }
    let kept = 0;
    for (const el of found) {
      if (kept >= kind.limit) break;
      const t = el.tags ?? {};
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      const website = webOk(t.website ?? t['contact:website'] ?? '');
      if (lat == null || lng == null || !website || !t.name || disputed(lat, lng)) continue;
      if (known.has(`${cc}|${norm(t.name)}`) || known.has(`${cc}|host|${host(website)}`)) continue;
      const osm = `${el.type}/${el.id}`;
      const names = { original: t.name };
      if (t['name:en']) names.en = t['name:en'];
      else if (/^[\x20-\x7EÀ-ɏ]+$/.test(t.name)) names.en = t.name;
      if (t['name:ru']) names.ru = t['name:ru'];
      const city = t['addr:city'] ?? t['addr:town'] ?? null;
      let slug = slugify(names.en ?? '') || `osm-${osm.replace('/', '-')}`;
      if (used.has(`${cc}/${slug}`)) slug = `${slug}-${osm.replace('/', '-')}`;
      used.add(`${cc}/${slug}`);
      known.add(`${cc}|${norm(t.name)}`);
      known.add(`${cc}|host|${host(website)}`);
      state.institutions.push({
        country: cc, type: kind.type, slug, names, city: city ? { original: city } : {},
        lat: Math.round(lat * 1e6) / 1e6, lng: Math.round(lng * 1e6) / 1e6, website, foundedYear: null, osm,
      });
      kept++;
    }
    state.done.push(key);
    save();
    console.log(`${key}: ${found.length} found, ${kept} kept (total ${state.institutions.length})`);
    await sleep(5000);
  }
}
console.log(`Done: ${state.institutions.length} places.`);
