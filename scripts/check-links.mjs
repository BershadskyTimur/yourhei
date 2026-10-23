// Checks that the official links kept in the project still work (scholarships, country guides, data sources).
//   node scripts/check-links.mjs
// Writes docs/LINK_REPORT.md. A link counts as working when the page answers 200-399. Some sites refuse robots (403/429/503):
// those are listed separately, as "check by hand", because they may work fine in a browser.
// Be gentle: 4 requests at a time, each link once, a clear User-Agent.
import { readFileSync, writeFileSync } from 'node:fs';

const urls = new Map(); // url -> where it is used
const add = (url, where) => {
  if (typeof url === 'string' && /^https?:\/\//.test(url)) (urls.get(url) ?? urls.set(url, new Set()).get(url)).add(where);
};

for (const s of JSON.parse(readFileSync('data/scholarships/national.json', 'utf8')).items) add(s.url, `scholarship: ${s.names.en}`);
for (const g of JSON.parse(readFileSync('data/countries/guides.json', 'utf8')).items) {
  for (const k of ['visa', 'work', 'after']) if (g[k]) add(g[k].url, `country ${g.country}: ${k}`);
}
for (const i of JSON.parse(readFileSync('data/reference/living-costs.json', 'utf8')).items) add(i.url, `living cost ${i.country}`);
const sourcesTs = readFileSync('src/lib/institutions/sources.ts', 'utf8');
for (const m of sourcesTs.matchAll(/url: '(https?:\/\/[^']+)'/g)) add(m[1], 'data source');
add('https://www.enic-naric.net/', 'recognition link');

const list = [...urls.keys()];
const results = [];
let next = 0;
async function worker() {
  while (next < list.length) {
    const url = list[next++];
    let status = 0;
    let note = '';
    try {
      let res = await fetch(url, { method: 'HEAD', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; YourHEI-linkcheck/1.0; +https://www.yourhei.com)' }, signal: AbortSignal.timeout(25000) });
      if (res.status >= 400) res = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (compatible; YourHEI-linkcheck/1.0; +https://www.yourhei.com)' }, signal: AbortSignal.timeout(25000) });
      status = res.status;
      if (res.url !== url && new URL(res.url).hostname !== new URL(url).hostname) note = `redirects to ${new URL(res.url).hostname}`;
    } catch (e) {
      note = e instanceof Error ? e.message.slice(0, 80) : 'error';
    }
    results.push({ url, status, note, where: [...urls.get(url)].join('; ') });
  }
}
await Promise.all(Array.from({ length: 4 }, worker));

const ok = results.filter((r) => r.status >= 200 && r.status < 400);
const hand = results.filter((r) => [401, 403, 429, 503].includes(r.status));
const broken = results.filter((r) => !(r.status >= 200 && r.status < 400) && ![401, 403, 429, 503].includes(r.status));
const line = (r) => `- ${r.status || 'no answer'} ${r.url}${r.note ? ` (${r.note})` : ''}\n  used in: ${r.where}`;
const text = [
  '# Проверка официальных ссылок',
  '',
  `Проверено ссылок: ${results.length}. Работают: ${ok.length}. Требуют проверки руками (сайт не пускает роботов): ${hand.length}. Не работают: ${broken.length}.`,
  `Дата: ${new Date().toISOString().slice(0, 10)}. Запуск: \`node scripts/check-links.mjs\`.`,
  '',
  '## Не работают',
  ...(broken.length ? broken.map(line) : ['Нет.']),
  '',
  '## Проверьте руками в браузере',
  ...(hand.length ? hand.map(line) : ['Нет.']),
  '',
].join('\n');
writeFileSync('docs/LINK_REPORT.md', text);
console.log(`links: ${results.length}, ok: ${ok.length}, by hand: ${hand.length}, broken: ${broken.length}`);
broken.forEach((r) => console.log('  BROKEN', r.status, r.url, r.note));
