---
name: seo-yourhei
description: SEO work on YourHEI (www.yourhei.com): check the live site as Googlebot sees it, read Search Console numbers, and improve titles, descriptions, internal links and articles. Use when asked about SEO, indexing, Google traffic, titles/descriptions, Search Console, or the sitemap.
---

# SEO on YourHEI

Facts about this site (checked November 2026) so the work does not start from zero.

## What exists and works
- **ru and en** are offered to search engines on every page (`INDEXED_LOCALES` in `src/config/seo.ts`); **es, zh, de, fr, pl** on every page except the institution pages and lists (`CONTENT_LOCALES`, owner's decision of 7 Nov 2026; `indexedLocalesFor(path)`). The other 9 languages are `noindex`. An article without its own translation stays `noindex` in that language. Do not change the lists without the owner.
- One sitemap (`/sitemap/0.xml`, about 12 000 addresses, ru + en with hreflang); `/sitemap.xml` redirects to it. `robots.txt` is built in `src/app/robots.ts` (training bots closed, search bots open) and merged by Cloudflare.
- Every page type sets title, description, canonical, hreflang through `seoMetadata()` in `src/lib/seo/metadata.ts`; structured data in `src/lib/seo/structured.ts`.
- IndexNow: `node scripts/indexnow.mjs <urls>` tells Yandex (accepted) and Bing (the key is refused, see PROGRESS.md) about new pages.

## How to check the site
1. `python scripts/seo-audit.py` reads robots, the sitemap and a sample of pages of every kind and flags: wrong status, redirects, canonical differing from the address, noindex, missing description, H1 not exactly one, pages slower than 3 s. Everything should print `200` and no flag.
2. For one page: open it, look at `<title>`, `<meta name="description">`, `<link rel="canonical">`, the JSON-LD.
3. Search Console is read by the owner (the browser tools are read-only for Chrome): ask for screenshots of Performance > Queries and Pages, and Pages (indexing). The report lags about two days, the indexing report about two weeks.

## What the data said (3 months to 4 Nov 2026)
- 39 clicks, 6 820 impressions, CTR 0.6 %, average position 41.9; growing since 31 Oct.
- People search a **specific institution plus price** ("гарвард университет стоимость", "all saints college fees"). Institution pages are the entry point, so the description of an institution page carries the yearly tuition range (`src/lib/seo/tuition-range.ts`).
- Blog articles already get impressions; link them to institution and country pages.

## Rules for changes
- Titles up to about 60 characters, descriptions 90-160 (`trimDescription`). Russian titles need the right case: `placeIn()` in `src/lib/seo/place.ts`.
- Never invent numbers: take them from the database or the generated data files and say how they were counted (see the article `how-much-does-it-cost-to-study-abroad-tuition-by-country`).
- A new page type must be in the sitemap, linked from at least one other page, and have a title and description of its own.
- After a change: build, tests (`npm test`), then merge to `main`; wait for the deploy and run the audit script again. Batch changes: every deploy resets the page cache and costs database traffic (see PROGRESS.md, section on Supabase traffic).

## Ideas not done yet
- Translate the new articles into the 14 languages (add the slug to `NOT_TRANSLATED_YET` in `posts.test.ts` until then).
- A count of programmes above 1 000 on huge institutions (the page reads at most 1 000 programmes).
- Cost-of-living article by city (data in `data/reference/living-costs.json`).
- Links from the blog to institution pages of the countries each article talks about.
