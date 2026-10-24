// Collects every blog article of one language from a running site (BLOG_SHOW_ALL=1, port 3001) into one HTML file to read before publication.
//   node docs/build-review.mjs ru
const lang = process.argv[2] === 'en' ? 'en' : 'ru';
const base = 'http://localhost:3001';
const list = await (await fetch(`${base}/${lang}/blog`)).text();
const slugs = [...new Set([...list.matchAll(new RegExp(`/${lang}/blog/([a-z0-9-]+)"`, 'g'))].map((m) => m[1]))];
const parts = [];
for (const slug of slugs) {
  const html = await (await fetch(`${base}/${lang}/blog/${slug}`)).text();
  const article = /<article[\s\S]*?<\/article>/.exec(html)?.[0] ?? '';
  const date = /<time dateTime="([^"]+)"/.exec(article)?.[1] ?? '';
  parts.push(`<section class="post"><p class="meta">/blog/${slug} · ${date}</p>${article.replace(/<a [^>]*>← [^<]*<\/a>/, '')}</section>`);
}
const css = 'body{font:17px/1.6 Georgia,serif;max-width:760px;margin:2rem auto;padding:0 1rem;color:#0f2d26}h1{font-size:1.9rem}h2{margin-top:2rem}h3{margin-top:1.2rem}.post{border-top:4px solid #b8893a;padding-top:1rem;margin-top:3rem}.meta{font:13px monospace;color:#6a6a6a}li{margin:.4rem 0}a{color:#8a5a0b}nav{border:1px solid #c9d3cf;padding:.6rem 1rem;border-radius:8px}';
const out = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>YourHEI blog: review (${lang})</title><style>${css}</style></head><body><h1>Статьи блога на проверку (${slugs.length})</h1>${parts.join('\n')}</body></html>`;
const { writeFileSync } = await import('node:fs');
const file = process.argv[3] ?? `blog-review-${lang}.html`;
writeFileSync(file, out);
console.log(`${slugs.length} articles -> ${file}`);
