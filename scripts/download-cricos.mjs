import { writeFileSync } from 'node:fs';
const files = {
  'CRICOS Institutions.csv': 'https://data.gov.au/data/dataset/e5ae7059-bfa8-4fa4-a5c0-c13cf3520193/resource/7f6941f3-5327-4db7-b556-5f16d77f63c1/download/cricos-institutions.csv',
  'CRICOS Courses.csv': 'https://data.gov.au/data/dataset/e5ae7059-bfa8-4fa4-a5c0-c13cf3520193/resource/48cacf69-2082-415e-9595-f17d0c3a4af0/download/cricos-courses.csv',
  'CRICOS Locations.csv': 'https://data.gov.au/data/dataset/e5ae7059-bfa8-4fa4-a5c0-c13cf3520193/resource/45d29535-1360-4486-8242-3850e61b5524/download/cricos-locations.csv',
};
for (const [name, url] of Object.entries(files)) {
  const r = await fetch(url, { headers: { 'User-Agent': 'YourHEI-dev/0.1' } });
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(`data/raw/cricos/${name}`, buf);
  console.log(r.status, name, buf.length, 'bytes');
}
