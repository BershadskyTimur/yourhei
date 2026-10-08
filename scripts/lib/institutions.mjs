// Shared by the country importers: finds an institution among the ones we already know (Wikidata / OpenStreetMap
// seeds) by its name, or finds its position through OpenStreetMap Nominatim (ODbL, one request per second, cached).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
export const norm = (s) =>
  s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\(.*?\)/g, ' ').replace(/\b(the|of|and|für|der|die|das|van|de|het|en)\b/g, ' ').replace(/\buniversity\b|\buniversiteit\b|\buniversität\b|\buniversitat\b|\buniversitesi\b|\buniversity of applied sciences\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

/** The institutions of one country that are already known, by normalised name. */
export function knownInstitutions(country) {
  const known = new Map();
  for (const f of ['data/seed/wikidata-region.json', 'data/seed/wikidata-world.json', 'data/seed/wikidata-other.json', 'data/seed/osm-region.json']) {
    if (!existsSync(f)) continue;
    for (const i of JSON.parse(readFileSync(f, 'utf8')).institutions) {
      if (i.country !== country) continue;
      for (const n of Object.values(i.names ?? {})) if (n) known.set(norm(String(n)), i);
    }
  }
  return known;
}

/**
 * Makes the institution record the loader needs: the known one when the name matches, otherwise a new one placed with
 * Nominatim. Returns null when the place cannot be found.
 * @param {{country:string, name:string, nameEn?:string, city?:string, website?:string|null, cacheFile:string, known:Map<string,any>, type?:string}} o
 */
export async function resolveInstitution(o) {
  const seed = o.known.get(norm(o.name)) ?? (o.nameEn ? o.known.get(norm(o.nameEn)) : undefined);
  if (seed) {
    return {
      externalIds: seed.wikidata ? { wikidata: seed.wikidata } : { osm: seed.osm },
      slug: seed.slug ?? slugify(o.nameEn ?? o.name),
      existing: true,
      country: o.country,
      type: seed.type ?? o.type ?? 'university',
      names: seed.names,
      city: seed.city ?? {},
      lat: seed.lat,
      lng: seed.lng,
      website: seed.website ?? o.website ?? null,
      ownership: null,
      size: null,
    };
  }
  mkdirSync(path.dirname(o.cacheFile), { recursive: true });
  const geo = existsSync(o.cacheFile) ? JSON.parse(readFileSync(o.cacheFile, 'utf8')) : {};
  const key = `${o.name}|${o.city ?? ''}`;
  if (!(key in geo)) {
    let found = null;
    // the name as given, the name alone, then the city (the pin is then only the city centre)
    const queries = [`${o.name}, ${o.city ?? ''}`, o.name, ...(o.city ? [o.city] : [])];
    for (const q of queries) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=${o.country.toLowerCase()}&q=${encodeURIComponent(q)}`, {
          headers: { 'User-Agent': 'YourHEI-dev/0.1 (student project)' },
          signal: AbortSignal.timeout(30000),
        });
        const r = res.ok ? await res.json() : [];
        if (r[0]) found = { lat: Math.round(Number(r[0].lat) * 1e5) / 1e5, lng: Math.round(Number(r[0].lon) * 1e5) / 1e5 };
      } catch {
        /* try the next query */
      }
      await sleep(1100);
      if (found) break;
    }
    geo[key] = found;
    writeFileSync(o.cacheFile, JSON.stringify(geo));
  }
  const at = geo[key];
  if (!at) return null;
  const slug = `${slugify(o.nameEn ?? o.name)}-${o.country.toLowerCase()}`;
  return {
    externalIds: { [`${o.country.toLowerCase()}_portal`]: slug },
    slug,
    existing: false,
    country: o.country,
    type: o.type ?? 'university',
    names: { original: o.name, ...(o.nameEn ? { en: o.nameEn } : {}) },
    city: o.city ? { en: o.city } : {},
    lat: at.lat,
    lng: at.lng,
    website: o.website ?? null,
    ownership: null,
    size: null,
  };
}
