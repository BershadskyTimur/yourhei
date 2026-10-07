// Builds data/generated/scorecard.json from the US Department of Education "College Scorecard" open data
// (public domain, https://collegescorecard.ed.gov/data/).
//   1. download "Most Recent Institution-Level Data" and "Most Recent Data by Field of Study" (CSV zip files)
//      into data/raw/scorecard and unzip them
//   2. node scripts/build-scorecard.mjs
//   3. node scripts/load-programs.mjs data/generated/scorecard.json   (needs the secret key in .env.local)
// What the Scorecard gives: every US degree-granting institution, its map position, ownership, size and the list of
// fields of study with the degree level. The price is the yearly published tuition (for state universities the
// out-of-state rate, which is what a foreign student pays). It does NOT give entry requirements for foreigners,
// deadlines or the length of the programmes: those stay empty.
import { createReadStream, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const INST = 'data/raw/scorecard/Most-Recent-Cohorts-Institution.csv';
const FOS = 'data/raw/scorecard/Most-Recent-Cohorts-Field-of-Study.csv';

/** Reads a big CSV line by line and calls `onRow` with an object of the wanted columns only. */
async function eachRow(path, wanted, onRow) {
  const rl = createInterface({ input: createReadStream(path, 'utf8'), crlfDelay: Infinity });
  let index = null;
  for await (const line of rl) {
    const cells = [];
    let cell = '';
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (q) {
        if (c === '"') {
          if (line[i + 1] === '"') { cell += '"'; i++; } else q = false;
        } else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { cells.push(cell); cell = ''; }
      else cell += c;
    }
    cells.push(cell);
    if (!index) {
      index = Object.fromEntries(wanted.map((w) => [w, cells.map((h) => h.replace(/^﻿/, '')).indexOf(w)]));
      continue;
    }
    onRow(Object.fromEntries(wanted.map((w) => [w, index[w] >= 0 ? cells[index[w]] : ''])));
  }
}

const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const norm = (s) => s.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/\bthe\b/g, ' ').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const num = (v) => (v && v !== 'NULL' && v !== 'PS' && Number.isFinite(Number(v)) ? Number(v) : null);
const webOk = (v) => {
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
};

// CIP (US classification of instructional programs) -> ISCED-F 2013. 4-digit overrides first, then the 2-digit family.
const CIP4 = {
  '0901': '0321', '0904': '0321', '1101': '0613', '1107': '0613', '1104': '0612', '1110': '0612', '1401': '071', '1402': '0715', '1404': '0732', '1405': '0719', '1407': '0711', '1408': '0732',
  '1409': '0714', '1410': '0713', '1419': '0715', '1427': '071', '1435': '0722', '1436': '0711', '4201': '0313', '5202': '0413', '5203': '0411', '5208': '0412', '5214': '0414', '5201': '0413', '5206': '0413',
  '5112': '0912', '5138': '0913', '5104': '0911', '5120': '0916', '4506': '0311', '4510': '0312', '4511': '0314', '2601': '0511', '2701': '0541', '2705': '0542', '4005': '0531', '4008': '0533', '4006': '0532',
  '5412': '0222', '2301': '0232', '3801': '0223', '5009': '0215', '5004': '0213', '5007': '0213', '5008': '0212', '1301': '0111', '2201': '0421', '4401': '0413', '4407': '0923', '3001': '0000', '2401': '0000',
};
const CIP2 = {
  '01': '081', '02': '081', '03': '052', '04': '073', '05': '031', '09': '032', '10': '021', '11': '061', '12': '101', '13': '011', '14': '071', '15': '071', '16': '023', '19': '101', '22': '042', '23': '0232',
  '24': '0000', '25': '0322', '26': '051', '27': '054', '29': '0000', '30': '0000', '31': '101', '38': '022', '39': '0221', '40': '053', '41': '071', '42': '0313', '43': '103', '44': '041', '45': '031',
  '46': '073', '47': '071', '48': '072', '49': '104', '50': '021', '51': '091', '52': '041', '54': '0222',
};
const iscedOf = (cip) => {
  const v = CIP4[cip.slice(0, 4)] ?? CIP2[cip.slice(0, 2)] ?? null;
  return v && v !== '0000' ? v : null;
};

// level (CREDLEV) -> programme level
const LEVEL = { 2: 'college', 3: 'bachelor', 5: 'master', 6: 'phd', 7: 'master' };
const LEVEL_NAME = { 2: "Associate degree", 3: "Bachelor's degree", 5: "Master's degree", 6: 'Doctoral degree', 7: 'Professional degree' };
const LEVEL_ORDER = ['bachelor', 'master', 'phd', 'college'];
// How many programmes of each level to keep per institution: the biggest ones (most graduates) come first, so the
// common fields of study are never lost. Doctoral programmes are left out (the site is about getting in).
const KEEP = { bachelor: 30, master: 10, college: 25, phd: 0 };
const graduates = (p) => (num(p.IPEDSCOUNT1) ?? 0) + (num(p.IPEDSCOUNT2) ?? 0);
const COUNTRY = { PR: 'PR', GU: 'GU', VI: 'VI', AS: 'AS', MP: 'MP' }; // US territories have their own country code

if (!existsSync(INST) || !existsSync(FOS)) {
  console.error('Unzip the two College Scorecard files into data/raw/scorecard first (see the top of this file).');
  process.exit(1);
}

// ---- institutions
const institutions = new Map();
await eachRow(INST, ['UNITID', 'INSTNM', 'CITY', 'STABBR', 'INSTURL', 'MAIN', 'ICLEVEL', 'PREDDEG', 'CONTROL', 'LATITUDE', 'LONGITUDE', 'UGDS', 'CURROPER', 'DISTANCEONLY', 'TUITIONFEE_IN', 'TUITIONFEE_OUT', 'TUITIONFEE_PROG'], (r) => {
  const lat = num(r.LATITUDE);
  const lng = num(r.LONGITUDE);
  if (r.MAIN !== '1' || r.CURROPER !== '1' || r.DISTANCEONLY === '1' || !['1', '2'].includes(r.ICLEVEL) || lat === null || lng === null) return;
  const control = Number(r.CONTROL);
  const tuition = control === 1 ? num(r.TUITIONFEE_OUT) ?? num(r.TUITIONFEE_IN) : num(r.TUITIONFEE_IN) ?? num(r.TUITIONFEE_OUT);
  institutions.set(r.UNITID, { r, lat, lng, control, tuition: tuition ?? num(r.TUITIONFEE_PROG) });
});

// ---- fields of study per institution
const fields = new Map();
await eachRow(FOS, ['UNITID', 'CIPCODE', 'CIPDESC', 'CREDLEV', 'IPEDSCOUNT1', 'IPEDSCOUNT2'], (r) => {
  if (!institutions.has(r.UNITID) || !LEVEL[r.CREDLEV]) return;
  const list = fields.get(r.UNITID) ?? [];
  list.push(r);
  fields.set(r.UNITID, list);
});

// ---- institutions already on the map (Wikidata): reuse their slug
const known = new Map();
const used = new Set();
for (const f of ['data/seed/wikidata-region.json', 'data/seed/wikidata-world.json', 'data/seed/wikidata-other.json']) {
  if (!existsSync(f)) continue;
  for (const i of JSON.parse(readFileSync(f, 'utf8')).institutions) {
    if (!['US', 'PR', 'GU', 'VI', 'AS', 'MP'].includes(i.country)) continue;
    used.add(`${i.country}/${i.slug}`);
    for (const n of Object.values(i.names)) known.set(`${i.country}|${norm(n)}`, i.slug);
  }
}

const out = [];
for (const [unitid, { r, lat, lng, control, tuition }] of institutions) {
  const programsAll = fields.get(unitid) ?? [];
  if (!programsAll.length) continue;
  const country = COUNTRY[r.STABBR] ?? 'US';
  const name = r.INSTNM.trim();
  const matched = known.get(`${country}|${norm(name)}`);
  let slug = matched;
  if (!slug) {
    slug = slugify(name) || `us-${unitid}`;
    if (used.has(`${country}/${slug}`)) slug = `${slug}-${unitid}`;
    used.add(`${country}/${slug}`);
  }
  const seen = new Set();
  const kept = {};
  const programs = programsAll
    .map((p) => ({ p, level: LEVEL[p.CREDLEV] }))
    .sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level) || graduates(b.p) - graduates(a.p) || a.p.CIPDESC.localeCompare(b.p.CIPDESC))
    .filter(({ p, level }) => {
      const k = `${p.CIPCODE}|${p.CREDLEV}`;
      if (seen.has(k)) return false;
      seen.add(k);
      kept[level] = (kept[level] ?? 0) + 1;
      return kept[level] <= (KEEP[level] ?? 0);
    })
    .map(({ p, level }) => {
      const title = `${p.CIPDESC.replace(/\.$/, '')}, ${LEVEL_NAME[p.CREDLEV]}`;
      return {
        names: { original: title, en: title },
        level,
        isced_f: iscedOf(p.CIPCODE),
        languages: ['en'],
        duration_years: null,
        tuition: tuition !== null ? [{ amount: tuition, currency: 'USD', period: 'year', applies_to: 'international' }] : [],
        code: p.CIPCODE,
        sourceUrl: `https://collegescorecard.ed.gov/school/?${unitid}`,
        academic_year: '2025/2026',
      };
    });
  const ugds = num(r.UGDS);
  out.push({
    cricos: undefined,
    externalIds: { ipeds: unitid },
    slug,
    existing: Boolean(matched),
    country,
    type: r.ICLEVEL === '1' ? 'university' : 'college',
    names: { original: name, en: name },
    city: r.CITY ? { en: r.CITY } : {},
    lat: Math.round(lat * 1e5) / 1e5,
    lng: Math.round(lng * 1e5) / 1e5,
    website: webOk(r.INSTURL ?? ''),
    ownership: control === 1 ? 'public' : 'private',
    size: ugds === null ? null : ugds > 10000 ? 'large' : 'small',
    programs,
  });
}

mkdirSync('data/generated', { recursive: true });
writeFileSync('data/generated/scorecard.json', JSON.stringify({ source: 'US Department of Education, College Scorecard (public domain)', sourceKey: 'scorecard', institutions: out }) + '\n');
const types = {};
out.forEach((i) => (types[i.type] = (types[i.type] ?? 0) + 1));
console.log(`${out.length} institutions (${out.filter((i) => i.existing).length} already on the map), ${out.reduce((n, i) => n + i.programs.length, 0)} programmes`);
console.log(JSON.stringify(types), 'with price:', out.filter((i) => i.programs[0]?.tuition.length).length);
