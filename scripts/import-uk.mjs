// Builds data/generated/uk.json from the Discover Uni dataset (HESA, licence CC BY 4.0): full-time first-degree
// (bachelor) courses of UK universities and colleges, with the course page, duration and place. The dataset has NO
// tuition fees for international students and NO deadlines, so those stay empty rather than being guessed.
//   1. Download the dataset zip from https://www.hesa.ac.uk/kisdata and unpack it into data/raw/uk-discoveruni/
//   2. node scripts/import-uk.mjs
//   3. node scripts/load-programs.mjs data/generated/uk.json
// Attribution: "Discover Uni dataset, HESA (CC BY 4.0)".
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { readCsv } from './lib/csv.mjs';
import { inferIsced } from './lib/isced-infer.mjs';
import { knownInstitutions, norm, sleep, slugify } from './lib/institutions.mjs';

const ROOT = 'data/raw/uk-discoveruni';
const dir = readdirSync(ROOT, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => path.join(ROOT, e.name)).sort().at(-1) ?? ROOT;
const file = (n) => path.join(dir, n);
console.log(`Reading ${dir}`);

// The broad field (2 digits) of the Common Aggregation Hierarchy subject, used only when the course title tells nothing.
const CAH_BROAD = { '01': '09', '02': '09', '03': '05', '04': '03', '05': '08', '06': '08', '07': '05', '09': '05', '10': '07', '11': '06', '13': '07', '15': '03', '16': '04', '17': '04', '19': '02', '20': '02', '22': '01', '24': '03', '25': '02', '26': '05' };

const institutions = readCsv(file('INSTITUTION.csv'));
const courses = readCsv(file('KISCOURSE.csv')).filter((c) => c.KISLEVEL === '03' && c.KISMODE === '01' && c.DISTANCE !== '1' && c.TITLE);
const subjects = new Map();
for (const s of readCsv(file('SBJ.csv'))) {
  const key = `${s.PUBUKPRN}|${s.KISCOURSEID}|${s.KISMODE}`;
  if (!subjects.has(key)) subjects.set(key, s.SBJ);
}
const places = new Map(readCsv(file('LOCATION.csv')).map((l) => [`${l.UKPRN}|${l.LOCID}`, l]));
const courseLoc = new Map();
for (const l of readCsv(file('COURSELOCATION.csv'))) {
  if (l.KISMODE !== '01') continue;
  const k = `${l.PUBUKPRN}|${l.LOCID}`;
  courseLoc.set(k, (courseLoc.get(k) ?? 0) + 1);
}

const known = knownInstitutions('GB');
const GEO = 'data/raw/uk-discoveruni/city.json';
const city = existsSync(GEO) ? JSON.parse(readFileSync(GEO, 'utf8')) : {};
async function cityOf(lat, lng) {
  const key = `${lat},${lng}`;
  if (key in city) return city[key];
  let found = null;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&accept-language=en&lat=${lat}&lon=${lng}`, { headers: { 'User-Agent': 'YourHEI-dev/0.1 (student project)' }, signal: AbortSignal.timeout(30000) });
    const a = res.ok ? (await res.json()).address ?? {} : {};
    found = a.city ?? a.town ?? a.village ?? a.municipality ?? a.county ?? null;
  } catch {
    /* no city */
  }
  city[key] = found;
  writeFileSync(GEO, JSON.stringify(city));
  await sleep(1100);
  return found;
}

/** "ARTS UNIVERSITY BOURNEMOUTH, THE" -> "The Arts University Bournemouth"; names already in mixed case stay as they are. */
function tidyName(s) {
  let n = s.replace(/\s*\(THE\)$/i, ', THE');
  if (n === n.toUpperCase()) n = n.toLowerCase().replace(/(^|[\s(-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase()).replace(/\b(Of|And|The|For|In)\b(?!$)/g, (w) => w.toLowerCase());
  const m = /^(.*), the$/i.exec(n);
  return m ? `The ${m[1]}` : n;
}
const cleanCity = (c) => (c ? c.replace(/^(Royal )?Borough of /, '').replace(/^Greater London$/, 'London').replace(/ City$/, '').replace(/ \(.*\)$/, '') : c);

const byPrn = new Map();
for (const c of courses) {
  const field = inferIsced(c.TITLE) ?? CAH_BROAD[(subjects.get(`${c.PUBUKPRN}|${c.KISCOURSEID}|${c.KISMODE}`) ?? '').slice(3, 5)] ?? null;
  const url = (c.CRSEURL || c.ASSURL || '').split('#')[0] || null;
  const years = Number(c.NUMSTAGE);
  const prog = {
    names: { original: c.TITLE.trim(), en: c.TITLE.trim() },
    level: 'bachelor',
    isced_f: field,
    languages: ['en'],
    duration_years: years >= 1 && years <= 7 ? years : null,
    tuition: [],
    deadlines: [],
    applicationFee: null,
    applicationUrl: url,
    code: `${c.PUBUKPRN}-${c.KISCOURSEID}`,
    sourceUrl: url ?? 'https://discoveruni.gov.uk/',
    academic_year: '2026/2027',
    faculty: null,
  };
  const list = byPrn.get(c.PUBUKPRN) ?? [];
  if (!list.some((p) => p.code === prog.code)) list.push(prog);
  byPrn.set(c.PUBUKPRN, list);
}

const out = [];
const skipped = [];
for (const inst of institutions) {
  const programs = byPrn.get(inst.PUBUKPRN);
  if (!programs?.length) continue;
  const name = tidyName((inst.FIRST_TRADING_NAME || inst.LEGAL_NAME).trim());
  const website = inst.PROVURL ? `https://${inst.PROVURL.trim().replace(/^https?:\/\//, '')}` : null;
  const seed = known.get(norm(name)) ?? known.get(norm(inst.LEGAL_NAME));
  if (seed) {
    out.push({ externalIds: seed.wikidata ? { wikidata: seed.wikidata } : { osm: seed.osm }, slug: seed.slug ?? slugify(name), existing: true, country: 'GB', type: seed.type ?? 'university', names: seed.names, city: seed.city ?? {}, lat: seed.lat, lng: seed.lng, website: seed.website ?? website, ownership: null, size: null, programs });
    continue;
  }
  // the campus where most of its courses run
  const best = [...places.entries()].filter(([k]) => k.startsWith(`${inst.UKPRN}|`) || k.startsWith(`${inst.PUBUKPRN}|`)).map(([k, l]) => ({ l, n: courseLoc.get(`${inst.PUBUKPRN}|${k.split('|')[1]}`) ?? 0 })).filter((x) => x.l.LATITUDE && x.l.LONGITUDE).sort((a, b) => b.n - a.n)[0];
  if (!best) {
    skipped.push(`${name} (${programs.length})`);
    continue;
  }
  const lat = Math.round(Number(best.l.LATITUDE) * 1e5) / 1e5;
  const lng = Math.round(Number(best.l.LONGITUDE) * 1e5) / 1e5;
  const c = cleanCity(await cityOf(lat, lng));
  const slug = `${slugify(name)}-gb`;
  out.push({ externalIds: { gb_ukprn: String(inst.PUBUKPRN) }, slug, existing: false, country: 'GB', type: 'university', names: { original: name, en: name }, city: c ? { en: c } : {}, lat, lng, website, ownership: null, size: null, programs });
}
// two Discover Uni providers can match the same known institution: one record, programmes together
for (let i = out.length - 1; i > 0; i--) {
  const first = out.findIndex((x) => x.slug === out[i].slug);
  if (first !== i) out.splice(i, 1)[0].programs.forEach((p) => out[first].programs.push(p));
}
for (const i of out) i.programs = [...new Map(i.programs.map((p) => [p.code, p])).values()];
mkdirSync('data/generated', { recursive: true });
writeFileSync('data/generated/uk.json', JSON.stringify({ source: 'Discover Uni dataset, HESA (CC BY 4.0)', sourceKey: 'discoveruni', institutions: out }) + '\n');
const total = out.reduce((n, i) => n + i.programs.length, 0);
const fielded = out.reduce((n, i) => n + i.programs.filter((p) => p.isced_f).length, 0);
const narrow = out.reduce((n, i) => n + i.programs.filter((p) => p.isced_f?.length === 3).length, 0);
console.log(`${out.length} institutions (${out.filter((i) => i.existing).length} already known), ${total} programmes (field known: ${fielded}, narrow field: ${narrow}). Skipped: ${skipped.join('; ') || 'none'}`);
