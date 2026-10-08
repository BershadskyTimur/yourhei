// Reads the DAAD database "International Programmes in Germany" (German Academic Exchange Service) through the search
// list that the site itself uses, and builds data/generated/germany.json: bachelor, master and PhD programmes taught
// (also) in English, with the tuition fee (per semester on the portal, converted to a year), the first application
// deadline, duration and a link back to the DAAD page of the programme.
//   1. node scripts/scrape-germany.mjs          (list: ~25 requests; the fee details of priced programmes: 1 request each)
//   2. node scripts/load-programs.mjs data/generated/germany.json
// Only facts are copied (name, institution, fee, deadline); every programme links back to its DAAD page.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { broadFromLabel, inferIsced } from './lib/isced-infer.mjs';
import { knownInstitutions, resolveInstitution, sleep } from './lib/institutions.mjs';

const ORIGIN = 'https://www2.daad.de';
const LIST = `${ORIGIN}/deutschland/studienangebote/international-programmes/api/solr/en/search.json`;
const HEADERS = { 'User-Agent': 'YourHEI-dev/0.1 (student project; contact via the site)' };
const CACHE = 'data/raw/germany/programs.json';
mkdirSync('data/raw/germany', { recursive: true });
const cache = existsSync(CACHE) ? JSON.parse(readFileSync(CACHE, 'utf8')) : { list: [], detail: {} };
const save = () => writeFileSync(CACHE, JSON.stringify(cache));

async function get(url, json = true) {
  for (let i = 1; i <= 4; i++) {
    try {
      const res = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(40000) });
      if (res.ok) return json ? await res.json() : await res.text();
      if (res.status === 404) return null;
    } catch {
      /* retry */
    }
    await sleep(2000 * i);
  }
  return null;
}

// ---- 1. the list: degree 1 = bachelor, 2 = master, 3 = doctorate
const LEVEL = { 1: 'bachelor', 2: 'master', 3: 'phd' };
if (cache.list.length === 0) {
  for (const degree of [1, 2, 3]) {
    for (let offset = 0; offset < 3000; offset += 100) {
      const r = await get(`${LIST}?display=list&sort=4&limit=100&offset=${offset}&degree%5B%5D=${degree}`);
      if (!r?.courses?.length) break;
      cache.list.push(...r.courses.map((c) => ({ ...c, level: LEVEL[degree] })));
      await sleep(400);
    }
  }
  save();
}
console.log(`${cache.list.length} programmes in the list`);

// ---- 2. the fee details of the programmes that show an amount
function parseFees(html) {
  const text = html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
  const i = text.search(/Tuition fees (per semester|per year|in total|per term|per trimester|per course)/i);
  if (i < 0) return null;
  const block = text.slice(i, i + 700).split(/Semester contribution|Costs of living|Tuition fees may vary/i)[0];
  const period = /per semester/i.test(block) ? 'semester' : /per year/i.test(block) ? 'year' : /in total/i.test(block) ? 'total' : null;
  const groups = [];
  for (const m of block.matchAll(/(all countries|EU countries|EU\/EEA countries|non-EU countries|countries outside the EU[^\d]*|other countries)[^\d]{0,30}([\d.,]+)\s*EUR/gi)) {
    groups.push({ who: m[1].toLowerCase(), amount: Number(m[2].replace(/,/g, '')) });
  }
  return { period, groups };
}
const needFee = cache.list.filter((c) => /\d/.test(c.tuitionFees ?? '') && !(c.id in cache.detail));
let done = 0;
async function worker(queue) {
  while (queue.length) {
    const c = queue.shift();
    const html = await get(`${ORIGIN}${c.link}`, false);
    cache.detail[c.id] = html ? parseFees(html) : null;
    if (++done % 50 === 0) {
      save();
      console.log(`fee details ${done}/${needFee.length}`);
    }
    await sleep(300);
  }
}
await Promise.all([worker(needFee), worker(needFee), worker(needFee)]);
save();

// ---- 3. build the file for the loader
const MONTHS = { January: '01', February: '02', March: '03', April: '04', May: '05', June: '06', July: '07', August: '08', September: '09', October: '10', November: '11', December: '12' };
const deadlineOf = (text) => {
  const m = /(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})/.exec(text ?? '');
  return m ? `${m[3]}-${MONTHS[m[2]]}-${String(m[1]).padStart(2, '0')}` : null;
};
const yearsOf = (text) => {
  const nums = [...String(text ?? '').matchAll(/(\d+(?:\.\d+)?)\s*semesters?/g)].map((m) => Number(m[1]));
  return nums.length ? Math.max(...nums) / 2 : null;
};
const langCodes = { English: 'en', German: 'de', French: 'fr', Spanish: 'es', Chinese: 'zh', Italian: 'it' };

function tuitionOf(c) {
  const f = String(c.tuitionFees ?? '');
  if (/no tuition/i.test(f)) return [{ amount: 0, currency: 'EUR', period: 'year', applies_to: 'all' }];
  const d = cache.detail[c.id];
  if (!d?.groups?.length || !d.period) return [];
  const factor = d.period === 'semester' ? 2 : 1;
  const per = d.period === 'total' ? 'total' : 'year';
  return d.groups.flatMap((g) => {
    const who = /^all/.test(g.who) ? 'all' : /^eu/.test(g.who) ? 'eu' : 'international';
    return [{ amount: Math.round(g.amount * (per === 'total' ? 1 : factor)), currency: 'EUR', period: per, applies_to: who }];
  });
}

const known = knownInstitutions('DE');
const byInst = new Map();
const seen = new Set();
for (const c of cache.list) {
  const langs = (c.languages ?? []).map((l) => langCodes[l]).filter(Boolean);
  if (!langs.includes('en') || !c.academy || seen.has(c.id)) continue;
  seen.add(c.id);
  const name = String(c.courseName).replace(/\s+/g, ' ').trim();
  const date = deadlineOf(c.applicationDeadline);
  const prog = {
    names: { original: name, en: name },
    level: c.level,
    isced_f: inferIsced(`${name} ${c.subject ?? ''}`) ?? inferIsced(c.subject ?? '') ?? broadFromLabel(c.subject ?? ''),
    languages: langs,
    duration_years: yearsOf(c.programmeDuration),
    tuition: tuitionOf(c),
    deadlines: date ? [{ intake: `${date.slice(0, 4)}-${/summer/i.test(c.beginning ?? '') && !/winter/i.test(c.beginning ?? '') ? '04' : '10'}`, applies_to: 'all', date }] : [],
    applicationFee: null,
    applicationUrl: `${ORIGIN}${c.link}`,
    code: String(c.id),
    sourceUrl: `${ORIGIN}${c.link}`,
    academic_year: date ? `${date.slice(0, 4)}/${Number(date.slice(0, 4)) + 1}` : '2026/2027',
    faculty: null,
  };
  const key = `${c.academy}|${c.city}`;
  const entry = byInst.get(key) ?? { name: c.academy, city: c.city, programs: [] };
  entry.programs.push(prog);
  byInst.set(key, entry);
}
const out = [];
const unplaced = [];
for (const { name, city, programs } of byInst.values()) {
  const rec = await resolveInstitution({ country: 'DE', name, city, cacheFile: 'data/raw/germany/geocode.json', known, type: 'university' });
  if (!rec) {
    unplaced.push(`${name} (${programs.length})`);
    continue;
  }
  // one institution can have several campuses (cities) or several seed records: they share one slug, so one record
  const same = out.find((x) => x.slug === rec.slug);
  if (same) same.programs.push(...programs);
  else out.push({ ...rec, programs });
}
mkdirSync('data/generated', { recursive: true });
writeFileSync('data/generated/germany.json', JSON.stringify({ source: 'DAAD International Programmes in Germany (daad.de)', sourceKey: 'daad', institutions: out }) + '\n');
const total = out.reduce((n, i) => n + i.programs.length, 0);
const priced = out.reduce((n, i) => n + i.programs.filter((p) => p.tuition.length).length, 0);
const fielded = out.reduce((n, i) => n + i.programs.filter((p) => p.isced_f).length, 0);
console.log(`${out.length} institutions, ${total} programmes (fee known: ${priced}, field known: ${fielded}). Not placed: ${unplaced.join('; ') || 'none'}`);
