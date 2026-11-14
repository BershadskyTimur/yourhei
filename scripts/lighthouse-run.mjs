// Measures pages with Lighthouse (phone and desktop) and prints one table.
// Usage: node scripts/lighthouse-run.mjs <origin> <out-dir> [runs]
//   node scripts/lighthouse-run.mjs https://www.yourhei.com lighthouse-out/live 3
// Every page is measured `runs` times; the table shows the median run (by performance score).
// Lighthouse itself is fetched by npx on first use; Chrome must be installed.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const [origin, outDir, runsArg] = process.argv.slice(2);
if (!origin || !outDir) {
  console.error('Usage: node scripts/lighthouse-run.mjs <origin> <out-dir> [runs]');
  process.exit(1);
}
const runs = Number(runsArg ?? 3);
const PAGES = [
  ['home', '/ru'],
  ['catalog', '/ru/catalog'],
  ['institution', '/ru/institutions/us/harvard-university'],
  ['article', '/ru/blog/how-much-does-it-cost-to-study-abroad-tuition-by-country'],
];
mkdirSync(outDir, { recursive: true });

function measure(url, file, desktop) {
  if (existsSync(file)) return;
  const args = ['-y', 'lighthouse', url, '--output=json', `--output-path=${file}`, '--quiet', '--chrome-flags=--headless=new'];
  if (desktop) args.push('--preset=desktop');
  try {
    execFileSync('npx', args, { stdio: 'ignore', shell: true, timeout: 180000 });
  } catch {
    // On Windows Lighthouse often fails while deleting Chrome's temporary folder, after the report is already written.
  }
}

const num = (lhr, id) => lhr.audits[id]?.numericValue ?? null;
function row(lhr) {
  const items = lhr.audits['resource-summary']?.details?.items ?? [];
  const requests = lhr.audits['network-requests']?.details?.items ?? [];
  const sum = (type) => requests.filter((r) => r.resourceType === type).reduce((a, r) => a + (r.transferSize ?? 0), 0);
  const total = items.find((i) => i.resourceType === 'total')?.transferSize ?? requests.reduce((a, r) => a + (r.transferSize ?? 0), 0);
  const score = (c) => Math.round((lhr.categories[c]?.score ?? 0) * 100);
  return {
    perf: score('performance'),
    a11y: score('accessibility'),
    bp: score('best-practices'),
    seo: score('seo'),
    fcp: num(lhr, 'first-contentful-paint'),
    lcp: num(lhr, 'largest-contentful-paint'),
    tbt: num(lhr, 'total-blocking-time'),
    cls: num(lhr, 'cumulative-layout-shift'),
    si: num(lhr, 'speed-index'),
    ttfb: num(lhr, 'server-response-time'),
    requests: requests.length,
    totalKb: total / 1024,
    jsKb: sum('Script') / 1024,
    cssKb: sum('Stylesheet') / 1024,
    fontKb: sum('Font') / 1024,
    htmlKb: sum('Document') / 1024,
  };
}

const summary = [];
const failed = new Map();
for (const mode of ['mobile', 'desktop']) {
  for (const [name, p] of PAGES) {
    const rows = [];
    for (let i = 1; i <= runs; i++) {
      const file = path.join(outDir, `${name}-${mode}-${i}.json`);
      measure(origin + p, file, mode === 'desktop');
      if (!existsSync(file)) continue;
      const lhr = JSON.parse(readFileSync(file, 'utf8'));
      if (lhr.runtimeError) continue;
      rows.push(row(lhr));
      for (const cat of Object.values(lhr.categories)) {
        for (const ref of cat.auditRefs) {
          const a = lhr.audits[ref.id];
          if (a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicable' && a.scoreDisplayMode !== 'manual') {
            const key = `${cat.id}: ${a.id}`;
            const pages = failed.get(key) ?? { title: a.title, pages: new Set(), display: new Set() };
            pages.pages.add(`${name}/${mode}`);
            if (a.displayValue) pages.display.add(a.displayValue);
            failed.set(key, pages);
          }
        }
      }
    }
    if (rows.length === 0) {
      console.error(`no result: ${name} ${mode}`);
      continue;
    }
    rows.sort((a, b) => a.perf - b.perf);
    summary.push({ page: name, mode, runs: rows.length, ...rows[Math.floor(rows.length / 2)] });
  }
}

const ms = (v) => (v === null ? '?' : v >= 1000 ? `${(v / 1000).toFixed(1)} s` : `${Math.round(v)} ms`);
const kb = (v) => `${Math.round(v)}`;
console.log('| page | mode | Perf | A11y | BP | SEO | TTFB | FCP | LCP | TBT | CLS | SI | requests | total KB | JS KB | CSS KB | fonts KB | HTML KB |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const r of summary) {
  console.log(`| ${r.page} | ${r.mode} | ${r.perf} | ${r.a11y} | ${r.bp} | ${r.seo} | ${ms(r.ttfb)} | ${ms(r.fcp)} | ${ms(r.lcp)} | ${ms(r.tbt)} | ${r.cls.toFixed(3)} | ${ms(r.si)} | ${r.requests} | ${kb(r.totalKb)} | ${kb(r.jsKb)} | ${kb(r.cssKb)} | ${kb(r.fontKb)} | ${kb(r.htmlKb)} |`);
}
console.log('\nFailed or weak audits:');
for (const [key, v] of [...failed].sort()) console.log(`- ${key} — ${v.title} [${[...v.pages].join(', ')}] ${[...v.display].slice(0, 2).join(' / ')}`);
writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2));
