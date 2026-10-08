// Reads Study in NL, the official student website of the Netherlands (Nuffic, a Dutch government-funded organisation),
// through the programme list that the site itself uses (https://www.studyinnl.org/api/programs), and builds
// data/generated/netherlands.json: bachelor and master programmes taught mainly in English, with the statutory (EU) and
// the international tuition fee, the application deadlines, duration and a link to the programme page.
//   1. node scripts/scrape-netherlands.mjs
//   2. node scripts/load-programs.mjs data/generated/netherlands.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { broadFromLabel, inferIsced } from './lib/isced-infer.mjs';
import { knownInstitutions, resolveInstitution, sleep } from './lib/institutions.mjs';

const API = 'https://www.studyinnl.org/api/programs';
const RAW = 'data/raw/netherlands/programs.json';
mkdirSync('data/raw/netherlands', { recursive: true });

let all = existsSync(RAW) ? JSON.parse(readFileSync(RAW, 'utf8')) : [];
if (all.length === 0) {
  for (let offset = 0; offset < 4000; offset += 100) {
    const res = await fetch(`${API}?limit=100&offset=${offset}`, { headers: { 'User-Agent': 'YourHEI-dev/0.1 (student project)' }, signal: AbortSignal.timeout(60000) });
    if (!res.ok) throw new Error(`HTTP ${res.status} at ${offset}`);
    const list = (await res.json()).data.programs;
    if (!list.length) break;
    all.push(...list);
    await sleep(500);
  }
  writeFileSync(RAW, JSON.stringify(all));
}
console.log(`${all.length} programmes read`);

const LEVEL = { Bachelor: 'bachelor', Master: 'master' };
const LANG = { English: 'en', German: 'de', French: 'fr', Dutch: 'nl' };
const today = new Date().toISOString().slice(0, 10);

function years(text) {
  const m = /^([\d.]+)\s*(year|month)/i.exec(String(text ?? ''));
  if (!m) return null;
  const v = Number(m[1]) / (m[2].toLowerCase() === 'month' ? 12 : 1);
  return v > 0 && v <= 8 ? Math.round(v * 100) / 100 : null;
}

/** The fee lines of the first academic year that has fees: statutory = EU/EEA students, international = everyone else. */
function tuitionOf(p) {
  const rows = (p.tuitions ?? []).filter((t) => t.period === 'year' && t.program_form === 'fulltime');
  const useRows = rows.length ? rows : (p.tuitions ?? []).filter((t) => t.period === 'year');
  if (!useRows.length) return [];
  const startYear = Number((p.start_months?.[0]?.start_date ?? '').slice(0, 4)) || Math.min(...useRows.map((t) => t.year));
  const year = useRows.map((t) => t.year).filter((y) => y >= startYear).sort()[0] ?? Math.min(...useRows.map((t) => t.year));
  const lines = [];
  for (const t of useRows.filter((x) => x.year === year)) {
    if (!(t.amount > 0)) continue;
    const who = t.tuition_fee_type === 'statutory' ? 'eu' : 'international';
    if (!lines.some((l) => l.applies_to === who)) lines.push({ amount: Math.round(t.amount), currency: 'EUR', period: 'year', applies_to: who });
  }
  return lines;
}

const known = knownInstitutions('NL');
const byInst = new Map();
for (const p of all) {
  const level = LEVEL[p.type];
  if (!level || !p.institution?.name) continue;
  const langs = (p.languages ?? []).map((l) => LANG[l.name]).filter(Boolean);
  if (!langs.includes('en')) continue;
  const months = (p.start_months ?? []).filter((m) => m.start_date >= today).sort((a, b) => a.start_date.localeCompare(b.start_date));
  const start = months[0] ?? (p.start_months ?? [])[0] ?? null;
  const deadlines = [];
  if (start?.application_deadline_non_eu) deadlines.push({ intake: start.start_date.slice(0, 7), applies_to: 'international', date: start.application_deadline_non_eu });
  if (start?.application_deadline) deadlines.push({ intake: start.start_date.slice(0, 7), applies_to: 'eu', date: start.application_deadline });
  const name = String(p.name).replace(/\s+/g, ' ').trim();
  const prog = {
    names: { original: name, en: name },
    level,
    isced_f: inferIsced(name) ?? broadFromLabel(p.field_of_study),
    languages: langs,
    duration_years: years(p.duration),
    tuition: tuitionOf(p),
    deadlines,
    applicationFee: null,
    applicationUrl: (p.admission_url?.[0] ?? p.website ?? '').split('?')[0] || null,
    code: String(p.hodex_id ?? p.id),
    sourceUrl: `https://www.studyinnl.org/dutch-education/studies/${p.slug}`,
    academic_year: start?.start_date ? `${start.start_date.slice(0, 4)}/${Number(start.start_date.slice(0, 4)) + 1}` : '2026/2027',
    faculty: null,
  };
  const key = p.institution.name;
  const entry = byInst.get(key) ?? { inst: p.institution, programs: [] };
  entry.programs.push(prog);
  byInst.set(key, entry);
}

const out = [];
const unmatched = [];
for (const [name, { inst, programs }] of byInst) {
  const type = /applied sciences|hogeschool/i.test(name) ? 'university' : 'university';
  const record = await resolveInstitution({ country: 'NL', name, city: inst.city, website: inst.url ?? null, cacheFile: 'data/raw/netherlands/geocode.json', known, type });
  if (!record) {
    unmatched.push(`${name} (${programs.length})`);
    continue;
  }
  out.push({ ...record, programs });
}
mkdirSync('data/generated', { recursive: true });
writeFileSync('data/generated/netherlands.json', JSON.stringify({ source: 'Study in NL, Nuffic (studyinnl.org)', sourceKey: 'studyinnl', institutions: out }) + '\n');
const total = out.reduce((n, i) => n + i.programs.length, 0);
const priced = out.reduce((n, i) => n + i.programs.filter((p) => p.tuition.some((t) => t.applies_to === 'international')).length, 0);
const fielded = out.reduce((n, i) => n + i.programs.filter((p) => p.isced_f).length, 0);
console.log(`${out.length} institutions, ${total} programmes (international price: ${priced}, field known: ${fielded}). Not placed: ${unmatched.join('; ') || 'none'}`);
