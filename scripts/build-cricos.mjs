// Builds data/generated/cricos.json from the official Australian register CRICOS (Commonwealth Register of
// Institutions and Courses for Overseas Students, data.gov.au, licence CC BY 2.5 AU).
//   1. node scripts/download-cricos.mjs      (the three CSV files into data/raw/cricos)
//   2. node scripts/geocode-au.mjs           (map coordinates of the addresses, OpenStreetMap Nominatim)
//   3. node scripts/build-cricos.mjs         (this file)
//   4. node scripts/load-programs.mjs data/generated/cricos.json   (writes to your Supabase; needs the secret key)
// What CRICOS gives: every provider that may enrol overseas students, its courses, level, field of education,
// duration and the total tuition fee in AUD. It does NOT give entry requirements or deadlines: they stay empty.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { readCsv } from './csv.mjs';

const inst = readCsv('data/raw/cricos/CRICOS Institutions.csv');
const courses = readCsv('data/raw/cricos/CRICOS Courses.csv').filter((c) => c.Expired !== 'Yes');
const locs = readCsv('data/raw/cricos/CRICOS Locations.csv');
const geo = JSON.parse(readFileSync('data/raw/cricos/geocache.json', 'utf8'));

const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const norm = (s) => s.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/\bthe\b/g, ' ').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const money = (v) => (v ? Number(String(v).replace(/[$,]/g, '')) || null : null);
const title = (s) => s.toLowerCase().replace(/(^|[\s-])([a-z])/g, (_, a, b) => a + b.toUpperCase());
const webOk = (v) => {
  try {
    const u = new URL(/^https?:\/\//i.test(v) ? v : `https://${v}`);
    return u.protocol === 'http:' || u.protocol === 'https:' ? u.toString() : null;
  } catch {
    return null;
  }
};

// ASCED narrow field of education -> ISCED-F 2013 (3 or 4 digits; null = no field, e.g. general programmes)
const FIELD = {
  '0101': '054', '0103': '053', '0105': '0531', '0107': '0532', '0109': '051', '0199': '050',
  '0201': '0613', '0203': '0612', '0299': '061',
  '0301': '072', '0303': '071', '0305': '071', '0307': '0715', '0309': '0732', '0311': '0732', '0313': '0713', '0315': '0715', '0317': '0715', '0399': '071',
  '0401': '0731', '0403': '0732',
  '0501': '081', '0503': '081', '0505': '0821', '0507': '0831', '0509': '052',
  '0601': '0912', '0603': '0913', '0605': '0916', '0607': '0911', '0609': '0915', '0611': '0919', '0613': '0915', '0615': '0915', '0617': '0919', '0699': '091',
  '0701': '0111', '0703': '011',
  '0801': '0411', '0803': '0413', '0805': '0414', '0807': '1015', '0809': '0415', '0811': '0412', '0899': '041',
  '0901': '0312', '0903': '031', '0905': '0923', '0907': '0313', '0909': '0421', '0911': '0421', '0913': '0322', '0915': '023', '0917': '0221', '0919': '0311', '0921': '1011',
  '1001': '0215', '1003': '0213', '1005': '0211', '1007': '0321',
  '1101': '1013', '1103': '1012',
};
const iscedOf = (c) => FIELD[(c['Field of Education 1 Narrow Field'] ?? '').slice(0, 4)] ?? null;

const LEVEL_ORDER = ['bachelor', 'master', 'phd', 'college', 'foundation', 'school', 'language_course'];
function programLevel(c) {
  const l = c['Course Level'];
  const name = c['Course Name'] ?? '';
  if (l === 'Bachelor Degree' || l === 'Bachelor Honours Degree') return 'bachelor';
  if (l.startsWith('Masters') || l === 'Graduate Certificate' || l === 'Graduate Diploma') return 'master';
  if (l === 'Doctoral Degree') return 'phd';
  if (l === 'Senior Secondary Certificate of Education' || l === 'Primary School Studies' || l === 'Junior Secondary Studies') return 'school';
  if (/english|elicos/i.test(name)) return 'language_course';
  if (/foundation/i.test(name) && l === 'Non AQF Award') return 'foundation';
  return 'college'; // diplomas, certificates, associate degrees, other short courses
}
const lang = { English: 'en', Korean: 'ko', Mandarin: 'zh', Chinese: 'zh', French: 'fr' };
const languageOf = (c) => {
  const k = Object.keys(lang).find((x) => (c['Course Language'] ?? '').startsWith(x));
  return k ? [lang[k]] : [];
};

// first physical location of each provider -> city and coordinates
const locOf = new Map();
for (const l of locs) {
  const g = geo[`${l.Postcode}|${l.State}`];
  if (g && !locOf.has(l['CRICOS Provider Code'])) locOf.set(l['CRICOS Provider Code'], { city: title(l.City || ''), lat: g.lat, lng: g.lng });
}

// Australian institutions that are already in the database (from Wikidata): match by name, reuse their slug.
const known = new Map();
const usedSlugs = new Set();
for (const f of ['data/seed/wikidata-region.json', 'data/seed/wikidata-world.json', 'data/seed/wikidata-other.json']) {
  if (!existsSync(f)) continue;
  for (const i of JSON.parse(readFileSync(f, 'utf8')).institutions) {
    if (i.country !== 'AU') continue;
    usedSlugs.add(i.slug);
    for (const n of Object.values(i.names)) known.set(norm(n), i.slug);
  }
}

const byProvider = new Map();
for (const c of courses) {
  const list = byProvider.get(c['CRICOS Provider Code']) ?? [];
  list.push(c);
  byProvider.set(c['CRICOS Provider Code'], list);
}

const out = [];
let skippedNoGeo = 0;
for (const p of inst) {
  const code = p['CRICOS Provider Code'];
  const list = byProvider.get(code);
  if (!list?.length) continue;
  const loc = locOf.get(code);
  if (!loc) {
    skippedNoGeo++;
    continue;
  }
  const levels = new Set(list.map(programLevel));
  const raw = list.map((c) => c['Course Level']);
  const type =
    raw.includes('Doctoral Degree') || (p['Institution Type'] === 'Government' && (levels.has('bachelor') || levels.has('master'))) ? 'university'
    : levels.has('bachelor') || levels.has('master') ? 'college'
    : levels.has('school') && !levels.has('bachelor') ? 'school'
    : [...levels].every((l) => l === 'language_course' || l === 'foundation') ? 'language_school'
    : 'vocational';

  const nameEn = (p['Trading Name'] || p['Institution Name']).replace(/\s*\(.*?\)\s*$/, '').trim();
  const matched = known.get(norm(nameEn)) ?? known.get(norm(p['Institution Name']));
  let slug = matched;
  if (!slug) {
    slug = slugify(nameEn) || `au-${code.toLowerCase()}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${code.toLowerCase()}`;
    usedSlugs.add(slug);
  }

  // programmes: unique names, best levels first, capped per provider
  const seen = new Set();
  const programs = list
    .map((c) => ({ c, level: programLevel(c) }))
    .sort((a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level) || a.c['Course Name'].localeCompare(b.c['Course Name']))
    .filter(({ c }) => {
      const k = c['Course Name'].toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, type === 'university' ? 80 : 40)
    .map(({ c, level }) => {
      const weeks = Number(c['Duration (Weeks)']);
      const years = weeks > 0 ? Math.min(12, Math.max(0.1, Math.round((weeks / 52) * 10) / 10)) : null;
      const fee = money(c['Tuition Fee']);
      return {
        names: { original: c['Course Name'], en: c['Course Name'] },
        level,
        isced_f: iscedOf(c),
        languages: languageOf(c),
        duration_years: years,
        tuition: fee !== null ? [{ amount: fee, currency: 'AUD', period: 'total', applies_to: 'international' }] : [],
        cricos: c['CRICOS Course Code'],
        sourceUrl: `https://cricos.education.gov.au/Course/CourseDetails.aspx?coursecode=${c['CRICOS Course Code']}`,
      };
    });

  const capacity = Number(String(p['Institution Capacity']).replace(/,/g, '')) || null;
  out.push({
    cricos: code,
    slug,
    existing: Boolean(matched),
    country: 'AU',
    type,
    names: { original: nameEn, en: nameEn },
    city: loc.city ? { en: loc.city } : {},
    lat: loc.lat,
    lng: loc.lng,
    website: webOk(p.Website ?? ''),
    ownership: p['Institution Type'] === 'Government' ? 'public' : p['Institution Type'] === 'Private' ? 'private' : null,
    size: capacity ? (capacity > 5000 ? 'large' : 'small') : null,
    programs,
  });
}

mkdirSync('data/generated', { recursive: true });
writeFileSync('data/generated/cricos.json', JSON.stringify({ source: 'CRICOS (data.gov.au, CC BY 2.5 AU)', institutions: out }) + '\n');
const types = {};
out.forEach((i) => (types[i.type] = (types[i.type] ?? 0) + 1));
console.log(`${out.length} institutions (${out.filter((i) => i.existing).length} already on the map), ${out.reduce((n, i) => n + i.programs.length, 0)} programmes; ${skippedNoGeo} skipped (no coordinates)`);
console.log(JSON.stringify(types));
