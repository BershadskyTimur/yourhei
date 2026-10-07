// Finds map coordinates for the Australian providers: CRICOS has addresses but no coordinates.
// Uses OpenStreetMap Nominatim (one request per second, as its usage policy asks), once per postcode.
// Result: data/raw/cricos/geocache.json  ("postcode|state" -> {lat, lng}); resumable.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { readCsv } from './csv.mjs';

const OUT = 'data/raw/cricos/geocache.json';
const cache = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const locs = readCsv('data/raw/cricos/CRICOS Locations.csv');
const wanted = new Map();
for (const l of locs) if (l.Postcode && !wanted.has(`${l.Postcode}|${l.State}`)) wanted.set(`${l.Postcode}|${l.State}`, l);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(params) {
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=au&' + new URLSearchParams(params);
  const res = await fetch(url, { headers: { 'User-Agent': 'YourHEI-dev/0.1 (student project; contact via site)' }, signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const j = await res.json();
  return j[0] ? { lat: Math.round(Number(j[0].lat) * 1e5) / 1e5, lng: Math.round(Number(j[0].lon) * 1e5) / 1e5 } : null;
}

let n = 0;
for (const [key, l] of wanted) {
  if (key in cache) continue;
  try {
    cache[key] = (await search({ postalcode: l.Postcode })) ?? (await (sleep(1100), search({ q: `${l.City}, ${l.State}, Australia` })));
  } catch (e) {
    console.warn(key, String(e.message ?? e));
    await sleep(5000);
    continue;
  }
  if (++n % 25 === 0) {
    writeFileSync(OUT, JSON.stringify(cache));
    console.log(`${Object.keys(cache).length}/${wanted.size}`);
  }
  await sleep(1100);
}
writeFileSync(OUT, JSON.stringify(cache));
console.log(`Done: ${Object.keys(cache).length} postcodes, ${Object.values(cache).filter((v) => !v).length} not found`);
