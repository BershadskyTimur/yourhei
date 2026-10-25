// Tells Bing, Yandex and other IndexNow search engines about new or changed pages, so that they come to read them at once
// (instead of waiting for their crawler). The key file public/<key>.txt proves that the site is ours; it is public by design.
//   node scripts/indexnow.mjs                       every address of the languages offered to search engines (from the sitemap)
//   node scripts/indexnow.mjs https://www.yourhei.com/ru/blog/...   only these addresses
import { readdirSync, readFileSync } from 'node:fs';

const HOST = 'www.yourhei.com';
const key = readdirSync('public').find((f) => /^[0-9a-f]{32}\.txt$/.test(f))?.replace('.txt', '');
if (!key) throw new Error('no key file in public/ (a 32-character name ending in .txt)');
if (readFileSync(`public/${key}.txt`, 'utf8').trim() !== key) throw new Error('the key file does not contain its own name');

let urls = process.argv.slice(2);
if (urls.length === 0) {
  const xml = await (await fetch(`https://${HOST}/sitemap/0.xml`)).text();
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}
urls = urls.filter((u) => u.startsWith(`https://${HOST}/`));
// the limit of one request is 10 000 addresses
for (let i = 0; i < urls.length; i += 10000) {
  const batch = urls.slice(i, i + 10000);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key, keyLocation: `https://${HOST}/${key}.txt`, urlList: batch }),
  });
  console.log(`${batch.length} addresses -> ${res.status} ${res.statusText}`);
}
