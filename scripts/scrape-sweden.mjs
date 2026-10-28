// Reads the official Swedish application portal universityadmissions.se (run by the Swedish Council for Higher Education,
// UHR) and builds data/generated/sweden.json: the English-taught degree programmes of the autumn 2027 intake with
// level, credits, place, the total tuition fee and the first instalment for students from outside the EU/EEA/Switzerland,
// the application window and a link to the programme page.
//   1. node scripts/scrape-sweden.mjs                                 (about 35 requests, one at a time)
//   2. node scripts/load-programs.mjs data/generated/sweden.json     (needs the service key in .env.local for a moment)
// Fees are Swedish kronor. The portal gives the total for the whole programme; the yearly amount is the total divided by
// the length in years (60 credits = 1 year, full-time programmes only). Where the portal gives no fee, tuition stays empty.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { broadFromLabel, inferIsced } from './lib/isced-infer.mjs';
import { knownInstitutions, resolveInstitution } from './lib/institutions.mjs';

const API = 'https://www.universityadmissions.se/intl/api/sok';
const CACHE = 'data/raw/sweden/sok.json';
const HEADERS = { 'Content-Type': 'application/json', 'User-Agent': 'YourHEI-dev/0.1 (student project)' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page(n, tries = 4) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(API, { method: 'POST', headers: HEADERS, body: JSON.stringify({ sida: n }), signal: AbortSignal.timeout(40000) });
      if (res.ok) return JSON.parse((await res.text()).replace(/^\)\]\}',\s*/, ''));
    } catch {
      /* retry */
    }
    await sleep(2000 * i);
  }
  return null;
}

mkdirSync('data/raw/sweden', { recursive: true });
let items;
if (existsSync(CACHE) && !process.argv.includes('--refresh')) {
  items = JSON.parse(readFileSync(CACHE, 'utf8'));
} else {
  items = [];
  const first = await page(1);
  if (!first) throw new Error('The portal did not answer');
  const total = Number(first.totaltAntalTraffar);
  console.log(`${total} hits, term: ${first.termin}`);
  items.push(...first.sokresultatItems);
  for (let n = 2; items.length < total; n++) {
    const r = await page(n);
    if (!r || !r.sokresultatItems.length) break;
    items.push(...r.sokresultatItems);
    await sleep(400);
  }
  writeFileSync(CACHE, JSON.stringify(items));
}
console.log(`${items.length} items read`);
if (process.argv.includes('--stats')) {
  const progs = items.filter((x) => x.anmalningsalternativ.program);
  const count = (f) => progs.reduce((m, x) => ((m[f(x)] = (m[f(x)] ?? 0) + 1), m), {});
  console.log('programmes', progs.length, 'levels', count((x) => x.anmalningsalternativ.utbildningsniva), 'lang', count((x) => x.anmalningsalternativ.undervisningssprak), 'form', count((x) => x.anmalningsalternativ.undervisningsform), 'pace', count((x) => x.anmalningsalternativ.studietakt), 'status', count((x) => x.status), 'fee', count((x) => (x.anmalningsalternativ.studieavgiftTotal ? 'yes' : 'no')), 'terms', count((x) => `${x.anmalningsalternativ.ar}/${x.anmalningsalternativ.terminsPeriod}`));
  process.exit(0);
}

// ---- build the file for the loader
const LEVEL = { "Bachelor's": 'bachelor', "Master's": 'master' };
// names the portal writes differently from our institution list
const ALIAS = { 'KTH Royal Institute of Technology': 'Royal Institute of Technology', 'Halmstad University': 'Halmstad University College' };
const titleCase = (s) => (s ?? '').toLowerCase().replace(/(^|[\s-])(\p{L})/gu, (_, a, b) => a + b.toUpperCase());
const byOrg = new Map();
let skipped = 0;
for (const x of items) {
  const a = x.anmalningsalternativ;
  if (!a.program || x.status === 'installd' || a.undervisningssprak !== 'English' || !LEVEL[a.utbildningsniva]) {
    skipped++;
    continue;
  }
  const credits = Number(a.poang);
  const fullTime = a.studietakt === 100 && credits > 0;
  const years = fullTime ? Math.round((credits / 60) * 10) / 10 : null;
  const total = a.studieavgiftTotal > 0 ? a.studieavgiftTotal : null;
  const open = (x.slutdatum ?? '').slice(0, 10) || null;
  const prog = {
    names: { original: a.titel, en: a.titel },
    level: LEVEL[a.utbildningsniva],
    isced_f: inferIsced(a.titel) ?? broadFromLabel((a.valdaAmnesNamn ?? []).join(' ')),
    languages: ['en'],
    duration_years: years && years <= 8 ? years : null,
    format: a.undervisningsform === 'Distance' ? 'online' : 'on_campus',
    tuition: total && years ? [{ amount: Math.round(total / years), currency: 'SEK', period: 'year', applies_to: 'international' }] : [],
    deadlines: open ? [{ intake: '2027-09', applies_to: 'international', date: open }] : [],
    applicationFee: null,
    applicationUrl: a.kursbeskrivningUrl || 'https://www.universityadmissions.se/intl/search?period=2027',
    code: a.anmalningskod || a.anmalningsalternativKod,
    sourceUrl: 'https://www.universityadmissions.se/intl/search?period=2027',
    academic_year: '2027/2028',
    city: titleCase(a.studieort),
  };
  const org = a.organisation;
  // the portal lists some programmes twice (a second application round, another code): keep one
  const same = (byOrg.get(org)?.programs ?? []).some((q) => q.names.en === prog.names.en && q.level === prog.level && q.format === prog.format && q.duration_years === prog.duration_years && JSON.stringify(q.tuition) === JSON.stringify(prog.tuition));
  if (same) {
    skipped++;
    continue;
  }
  byOrg.set(org, { city: byOrg.get(org)?.city ?? prog.city, programs: [...(byOrg.get(org)?.programs ?? []), prog] });
}
const known = knownInstitutions('SE');
const out = [];
const unmatched = [];
for (const [name, { city, programs }] of byOrg) {
  const record = await resolveInstitution({ country: 'SE', name: ALIAS[name] ?? name, nameEn: name, city, website: null, cacheFile: 'data/raw/sweden/geocode.json', known, type: 'university' });
  if (!record) {
    unmatched.push(`${name} (${programs.length})`);
    continue;
  }
  out.push({ ...record, programs: programs.map((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'city'))) });
}
mkdirSync('data/generated', { recursive: true });
writeFileSync('data/generated/sweden.json', JSON.stringify({ source: 'Universityadmissions.se, Swedish Council for Higher Education (UHR)', sourceKey: 'universityadmissions', institutions: out }) + '\n');
const total = out.reduce((n, i) => n + i.programs.length, 0);
const priced = out.reduce((n, i) => n + i.programs.filter((p) => p.tuition.length).length, 0);
const fielded = out.reduce((n, i) => n + i.programs.filter((p) => p.isced_f).length, 0);
console.log(`${out.length} institutions (new: ${out.filter((i) => !i.existing).length}), ${total} programmes (price: ${priced}, field known: ${fielded}, skipped: ${skipped}). Not placed: ${unmatched.join('; ') || 'none'}`);
for (const i of out) console.log(`  ${i.existing ? 'known' : 'NEW  '} ${i.slug}: ${i.programs.length}`);
