// Reads the official Czech portal "Study in Czechia" (studyin.gov.cz, run by the Czech Ministry of Education
// and the Czech universities) and builds data/generated/studyin-cz.json: 54 universities, about 5,000 programmes
// with level, language, duration, tuition, application deadline and application fee, copied as published.
//   1. Open https://studyin.gov.cz/study-programmes/ in a browser: the page loads the list of programmes as one JSON
//      file ("Ajax/ProgramSearch/GetMapData"). Save its content as data/raw/czechia/mapdata.json
//      (scripts/grab-studyin-cz.mjs does this with Playwright).
//   2. node scripts/scrape-studyin-cz.mjs      (about one page per second; resumable, so it can be stopped)
//   3. node scripts/load-programs.mjs data/generated/studyin-cz.json
// Each programme keeps the link to its page on the portal as its source.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const BASE = 'https://studyin.gov.cz';
const CACHE = 'data/raw/czechia/programs.json';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- the list of programmes
const raw = JSON.parse(readFileSync('data/raw/czechia/mapdata.json', 'utf8')).data[0].content;
const start = raw.indexOf("data-map-inline-data-value='") + "data-map-inline-data-value='".length;
const list = JSON.parse(raw.slice(start, raw.indexOf("'", start)).replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")).markers.filter((m) => m.type === 'program');

const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : {};
const save = () => writeFileSync(CACHE, JSON.stringify(cache));

const textOf = (html) => {
  const body = html.slice(Math.max(0, html.indexOf('<main')));
  return body
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<\/(p|div|li|dt|dd|h\d|tr|section)>/g, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n');
};
/** "Label:\nvalue" pairs of the key-information block */
const field = (text, label) => {
  const m = new RegExp(`${label}:{1,2}\\s*\\n\\s*([^\\n]+)`).exec(text);
  return m ? m[1].trim() : null;
};
const isoDate = (d) => (d && /^\d{2}\.\d{2}\.\d{4}$/.test(d) ? `${d.slice(6)}-${d.slice(3, 5)}-${d.slice(0, 2)}` : null);

function parse(html, marker) {
  const text = textOf(html);
  const tuition = /([\d.,]+)\s*-\s*([\d.,]+)\s*([A-Z]{3})\s*\/\s*(academic year|semester|year)/.exec(text);
  const fee = /Application fee:\s*\n\s*([\d.,]+)\s*([A-Z]{3})/.exec(text);
  const code = field(text, 'Study programme code');
  const apply = /\n\s*(https?:\/\/[^\s]+)\s*\n\s*Apply/.exec(text);
  return {
    id: marker.id,
    title: marker.tooltip.title,
    university: marker.tooltip.university,
    faculty: marker.tooltip.faculty,
    url: marker.tooltip.url,
    lat: marker.location?.lat ?? null,
    lng: marker.location?.lng ?? null,
    city: marker.location?.address?.city ?? null,
    field: field(text, 'Field of study'),
    language: field(text, 'Study language'),
    code,
    isced: field(text, 'ISCED code'),
    form: field(text, 'Study form'),
    duration: field(text, 'Study duration'),
    deadline: isoDate(field(text, 'Application deadline')),
    fee: fee ? { amount: Number(fee[1].replace(/,/g, '')), currency: fee[2] } : null,
    tuition: tuition ? { min: Number(tuition[1].replace(/,/g, '')), max: Number(tuition[2].replace(/,/g, '')), currency: tuition[3], period: tuition[4] } : null,
    applyUrl: apply ? apply[1] : null,
  };
}

let done = 0;
async function worker(queue) {
  while (queue.length) {
    const m = queue.shift();
    if (cache[m.id]) continue;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(BASE + m.tooltip.url, { headers: { 'User-Agent': 'YourHEI-dev/0.1 (student project)' }, signal: AbortSignal.timeout(40000) });
        if (res.ok) {
          cache[m.id] = parse(await res.text(), m);
          break;
        }
        if (res.status === 404) break;
      } catch {
        /* retry */
      }
      await sleep(3000 * attempt);
    }
    if (++done % 100 === 0) {
      save();
      console.log(`${Object.keys(cache).length}/${list.length}`);
    }
    await sleep(500);
  }
}
const queue = list.filter((m) => !cache[m.id]);
await Promise.all([worker(queue), worker(queue), worker(queue)]);
save();
console.log(`Pages read: ${Object.keys(cache).length}/${list.length}`);

// ---- build the file for the loader
const slugify = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
const norm = (s) => s.toLowerCase().replace(/\(.*?\)/g, ' ').replace(/\bthe\b/g, ' ').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
const known = new Map();
const used = new Set();
for (const f of ['data/seed/wikidata-region.json', 'data/seed/wikidata-world.json', 'data/seed/wikidata-other.json']) {
  if (!existsSync(f)) continue;
  for (const i of JSON.parse(readFileSync(f, 'utf8')).institutions) {
    if (i.country !== 'CZ') continue;
    used.add(i.slug);
    for (const n of Object.values(i.names)) known.set(norm(n), i.slug);
  }
}
// The first letter of the Czech programme code is the type: B bachelor, N follow-up master, M long master, P doctoral.
const LEVEL = { B: 'bachelor', N: 'master', M: 'master', P: 'phd' };
const byUni = new Map();
for (const p of Object.values(cache)) {
  const arr = byUni.get(p.university) ?? [];
  arr.push(p);
  byUni.set(p.university, arr);
}
const out = [];
for (const [name, ps] of byUni) {
  const matched = known.get(norm(name));
  let slug = matched;
  if (!slug) {
    slug = slugify(name);
    if (used.has(slug)) slug = `${slug}-cz`;
    used.add(slug);
  }
  const first = ps.find((p) => p.lat !== null) ?? ps[0];
  const programs = ps
    .filter((p) => LEVEL[(p.code ?? '')[0]] ?? null)
    .map((p) => {
      const level = LEVEL[p.code[0]];
      const years = p.duration ? Number(/([\d.]+)/.exec(p.duration)?.[1]) || null : null;
      const per = p.tuition?.period === 'semester' ? 'semester' : 'year';
      const tuition = p.tuition ? [{ amount: p.tuition.min, currency: p.tuition.currency, period: per, applies_to: 'international' }] : [];
      const title = p.faculty && !/^(fakulta|faculty)/i.test('') ? `${p.title}` : p.title;
      return {
        names: { original: title, en: title },
        level,
        isced_f: p.isced && /^\d{2,4}$/.test(p.isced) ? p.isced : null,
        languages: (p.language ?? '').split(/[,;/ ]+/).map((l) => l.toLowerCase()).filter((l) => /^[a-z]{2}$/.test(l)).map((l) => (l === 'cz' ? 'cs' : l)), // the portal writes CZ for Czech; the ISO 639-1 code is cs

        duration_years: years && years > 0 && years <= 12 ? years : null,
        tuition,
        deadlines: p.deadline ? [{ intake: `${p.deadline.slice(0, 4)}-09`, applies_to: 'international', date: p.deadline }] : [],
        applicationFee: p.fee,
        applicationUrl: p.applyUrl,
        code: p.code,
        sourceUrl: BASE + p.url,
        academic_year: p.deadline ? `${p.deadline.slice(0, 4)}/${Number(p.deadline.slice(0, 4)) + 1}` : '2026/2027',
        faculty: p.faculty,
      };
    });
  out.push({
    externalIds: { studyin_cz: slugify(name) },
    slug,
    existing: Boolean(matched),
    country: 'CZ',
    type: 'university',
    names: { original: name, en: name },
    city: first.city ? { en: first.city } : {},
    lat: Math.round(first.lat * 1e5) / 1e5,
    lng: Math.round(first.lng * 1e5) / 1e5,
    website: null,
    ownership: null,
    size: null,
    programs,
  });
}
mkdirSync('data/generated', { recursive: true });
writeFileSync('data/generated/studyin-cz.json', JSON.stringify({ source: 'Study in Czechia, studyin.gov.cz (Czech Ministry of Education)', sourceKey: 'studyin_cz', institutions: out }) + '\n');
console.log(`${out.length} universities, ${out.reduce((n, i) => n + i.programs.length, 0)} programmes (of which in English: ${out.reduce((n, i) => n + i.programs.filter((p) => p.languages.includes('en')).length, 0)})`);
