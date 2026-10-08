// Reads the official Finnish study portal Opintopolku / Studyinfo (run by the Finnish National Agency for Education,
// open data) and builds data/generated/finland.json: the degree programmes of universities and universities of applied
// sciences that are taught in English, with level, duration, deadline and a link to the programme page.
//   1. node scripts/scrape-finland.mjs          (about 3 requests per programme, 4 at a time; resumable via a cache file)
//   2. node scripts/load-programs.mjs data/generated/finland.json     (needs the service key in .env.local for a moment)
// The institution and the yearly tuition fee for applicants from outside the EU/EEA come from the portal's list of
// organisers of each programme ("jarjestajat"); where it gives no fee, tuition stays empty instead of being guessed.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const BASE = 'https://opintopolku.fi/konfo-backend';
const HEADERS = { 'Caller-Id': '1.2.246.562.10.00000000001.yourhei-student-project', 'User-Agent': 'YourHEI-dev/0.1 (student project)' };
const CACHE = 'data/raw/finland/programs.json';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const en = (v) => (v && typeof v === 'object' ? (v.en ?? v.fi ?? v.sv ?? '') : '').toString().replace(/\s+/g, ' ').trim();

async function get(path, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(BASE + path, { headers: HEADERS, signal: AbortSignal.timeout(40000) });
      if (res.ok) return await res.json();
      if (res.status === 404) return null;
    } catch {
      /* retry */
    }
    await sleep(2000 * i);
  }
  return null;
}

mkdirSync('data/raw/finland', { recursive: true });
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
const save = () => writeFileSync(CACHE, JSON.stringify(cache));

// ---- 1. the list: every English-taught degree programme of universities (yo) and applied sciences (amk)
const hits = [];
for (const type of ['yo', 'amk']) {
  for (let page = 1; page < 40; page++) {
    const r = await get(`/search/koulutukset?koulutustyyppi=${type}&lng=en&order=desc&page=${page}&size=100&sort=score&opetuskieli=oppilaitoksenopetuskieli_4`);
    if (!r || !r.hits?.length) break;
    hits.push(...r.hits.map((h) => ({ oid: h.oid, type })));
    if (hits.length >= (r.total ?? 0) + 0 && page * 100 >= r.total) break;
  }
}
console.log(`${hits.length} programmes in the list`);

// ---- 2. the details
let done = 0;
async function worker(queue) {
  while (queue.length) {
    const h = queue.shift();
    if (cache[h.oid]) continue;
    const k = await get(`/koulutus/${h.oid}?draft=false`);
    if (!k) continue;
    const items = [];
    for (const t of k.toteutukset ?? []) {
      const oid = t.oid ?? t;
      const d = await get(`/toteutus/${oid}?draft=false`);
      if (!d) continue;
      const o = d.metadata?.opetus ?? {};
      const langs = (o.opetuskieli ?? []).map((x) => String(x.koodiUri ?? '').split('#')[0]);
      const periods = (d.hakutiedot ?? []).flatMap((x) => x.hakukohteet ?? []).flatMap((x) => x.hakuajat ?? []).map((x) => x.paattyy).filter(Boolean);
      items.push({
        oid,
        org: en(d.organisaatio?.nimi ?? d.tarjoajat?.[0]?.nimi) || null,
        name: en(d.nimi),
        english: langs.includes('oppilaitoksenopetuskieli_4'),
        years: o.suunniteltuKestoVuodet ?? null,
        months: o.suunniteltuKestoKuukaudet ?? null,
        deadlines: periods,
      });
      await sleep(250);
    }
    cache[h.oid] = {
      oid: h.oid,
      type: h.type,
      name: en(k.nimi),
      eqf: (k.eqf ?? []).map((x) => x.koodiUri),
      title: en((k.metadata?.tutkintonimike ?? [])[0]?.nimi),
      scope: k.metadata?.opintojenLaajuusNumero ?? null,
      providers: (k.tarjoajat ?? []).map((x) => en(x?.nimi ?? x?.organisaatio?.nimi)).filter(Boolean),
      items,
    };
    if (++done % 25 === 0) {
      save();
      console.log(`${Object.keys(cache).length}/${hits.length}`);
    }
    await sleep(250);
  }
}
const queue = hits.filter((h) => !cache[h.oid]);
await Promise.all([worker(queue), worker(queue), worker(queue), worker(queue)]);
save();
console.log(`Details read: ${Object.keys(cache).length}/${hits.length}`);

// ---- 2b. the organisers of every programme: the institution and the yearly fee
async function organisers(queue) {
  while (queue.length) {
    const p = queue.shift();
    const r = await get(`/search/koulutus/${p.oid}/jarjestajat?lng=en&page=1&size=100&order=asc&sort=name`);
    p.jarj = (r?.hits ?? []).map((x) => ({
      toteutusOid: x.toteutusOid,
      org: en(x.nimi),
      fee: typeof x.lukuvuosimaksunMaara === 'number' ? x.lukuvuosimaksunMaara : null,
      types: (x.maksullisuustyypit ?? []).map((m) => String(m).split('#')[0]),
    }));
    if (r && ++done % 40 === 0) {
      save();
      console.log(`organisers ${done}`);
    }
    await sleep(250);
  }
}
// ---- 2c. the field of study: the Finnish classification of education follows ISCED-F 2013, the 3-digit level is the narrow field
const fieldOf = (k) =>
  [...new Set((k?.koulutuskoodienAlatJaAsteet ?? []).flatMap((x) => x.koulutusalaKoodiUrit ?? []).map((u) => /koulutusalataso2_(\d{3})/.exec(String(u))?.[1]).filter(Boolean))];
async function fields(queue) {
  while (queue.length) {
    const p = queue.shift();
    const k = await get(`/koulutus/${p.oid}?draft=false`);
    p.ala = fieldOf(k);
    if (k && ++done % 40 === 0) {
      save();
      console.log(`fields ${done}`);
    }
    await sleep(250);
  }
}
const noField = Object.values(cache).filter((p) => !p.ala);
await Promise.all([fields(noField), fields(noField), fields(noField), fields(noField)]);
save();

const pending = Object.values(cache).filter((p) => !p.jarj);
await Promise.all([organisers(pending), organisers(pending), organisers(pending), organisers(pending)]);
save();

// ---- 3. build the file for the loader
const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const norm = (s) => s.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/\buniversity of\b/g, ' ').replace(/\buniversity\b/g, ' ').replace(/\bof\b/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
const known = new Map();
for (const f of ['data/seed/wikidata-region.json', 'data/seed/wikidata-world.json', 'data/seed/wikidata-other.json']) {
  if (!existsSync(f)) continue;
  for (const i of JSON.parse(readFileSync(f, 'utf8')).institutions) {
    if (i.country !== 'FI') continue;
    for (const n of Object.values(i.names)) known.set(norm(n), i);
  }
}
const LEVEL = { eqf_6: 'bachelor', eqf_7: 'master', eqf_8: 'phd' };
const byOrg = new Map();
for (const p of Object.values(cache)) {
  const level = LEVEL[p.eqf.find((e) => LEVEL[e])] ?? null;
  if (!level) continue;
  for (const it of p.items) {
    if (!it.english) continue;
    const jar = (p.jarj ?? []).find((x) => x.toteutusOid === it.oid);
    const org = jar?.org || (p.providers.length === 1 ? p.providers[0] : null);
    if (!org) continue;
    const fee = jar?.fee && jar.fee > 0 ? jar.fee : null;
    const freeForAll = !fee && (jar?.types ?? []).length > 0 && (jar?.types ?? []).every((x) => x === 'maksuton');
    const years = it.years ? Number(it.years) + (it.months ? Number(it.months) / 12 : 0) : it.months ? Number(it.months) / 12 : null;
    const today = new Date().toISOString().slice(0, 10);
    const dates = it.deadlines.map((x) => x.slice(0, 10)).sort();
    const date = dates.find((x) => x >= today) ?? dates.at(-1) ?? null;
    const prog = {
      names: { original: it.name || p.name, en: it.name || p.name },
      level,
      isced_f: p.ala?.[0] ?? null,
      languages: ['en'],
      duration_years: years && years > 0 && years <= 12 ? Math.round(years * 10) / 10 : null,
      tuition: fee ? [{ amount: fee, currency: 'EUR', period: 'year', applies_to: 'international' }] : freeForAll ? [{ amount: 0, currency: 'EUR', period: 'year', applies_to: 'all' }] : [],
      deadlines: date ? [{ intake: `${date.slice(0, 4)}-09`, applies_to: 'international', date }] : [],
      applicationFee: null,
      applicationUrl: `https://opintopolku.fi/konfo/en/toteutus/${it.oid}`,
      code: it.oid,
      sourceUrl: `https://opintopolku.fi/konfo/en/toteutus/${it.oid}`,
      academic_year: date ? `${date.slice(0, 4)}/${Number(date.slice(0, 4)) + 1}` : '2026/2027',
    };
    byOrg.set(org, [...(byOrg.get(org) ?? []), prog]);
  }
}
const GEO = 'data/raw/finland/geocode.json';
const geo = existsSync(GEO) ? JSON.parse(readFileSync(GEO, 'utf8')) : {};
async function geocode(name) {
  if (name in geo) return geo[name];
  let found = null;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=fi&q=${encodeURIComponent(name + ', Finland')}`, { headers: { 'User-Agent': 'YourHEI-dev/0.1 (student project)' }, signal: AbortSignal.timeout(30000) });
    const r = res.ok ? await res.json() : [];
    if (r[0]) found = { lat: Math.round(Number(r[0].lat) * 1e5) / 1e5, lng: Math.round(Number(r[0].lon) * 1e5) / 1e5, city: (r[0].display_name ?? '').split(',').slice(-4, -3)[0]?.trim() || null };
  } catch {
    /* not found */
  }
  geo[name] = found;
  writeFileSync(GEO, JSON.stringify(geo));
  await sleep(1100);
  return found;
}

const out = [];
const unmatched = [];
for (const [org, programs] of byOrg) {
  let seed = known.get(norm(org));
  if (!seed) {
    const at = /university|college|institute|school|academy|yliopisto|korkeakoulu/i.test(org) ? await geocode(org) : null;
    if (!at) {
      unmatched.push(`${org} (${programs.length})`);
      continue;
    }
    seed = { slug: slugify(org) + '-fi', names: { original: org, en: org }, city: at.city ? { en: at.city } : {}, lat: at.lat, lng: at.lng, website: null, type: 'university', osm: `opintopolku/${slugify(org)}` };
  }
  out.push({
    externalIds: seed.wikidata ? { wikidata: seed.wikidata } : { osm: seed.osm },
    slug: seed.slug ?? slugify(org),
    existing: true,
    country: 'FI',
    type: seed.type ?? 'university',
    names: seed.names,
    city: seed.city ?? {},
    lat: seed.lat,
    lng: seed.lng,
    website: seed.website ?? null,
    ownership: null,
    size: null,
    programs,
  });
}
mkdirSync('data/generated', { recursive: true });
writeFileSync('data/generated/finland.json', JSON.stringify({ source: 'Opintopolku / Studyinfo, Finnish National Agency for Education (open data)', sourceKey: 'opintopolku', institutions: out }) + '\n');
console.log(`${out.length} institutions, ${out.reduce((n, i) => n + i.programs.length, 0)} programmes. Not matched to a known institution: ${unmatched.length ? unmatched.join('; ') : 'none'}`);
