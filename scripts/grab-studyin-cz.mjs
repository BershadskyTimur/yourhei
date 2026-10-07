import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
let body = null;
page.on('response', async (r) => {
  if (r.url().includes('/Ajax/ProgramSearch/GetMapData')) body = await r.body();
});
await page.goto('https://studyin.gov.cz/study-programmes/', { waitUntil: 'networkidle', timeout: 90000 }).catch(() => {});
await page.waitForTimeout(3000);
if (body) writeFileSync('data/raw/czechia/mapdata.json', body);
console.log(body ? `saved ${body.length} bytes` : 'no data');
await browser.close();
