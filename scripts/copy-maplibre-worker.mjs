// MapLibre runs map calculations in a web worker file. Bundlers do not handle that file
// reliably, so we serve it as a plain static file from public/maplibre/ and point the map at it
// (see src/components/InstitutionMap.tsx). Runs automatically before `npm run dev` and `build`.
import { copyFileSync, mkdirSync } from 'node:fs';

const from = 'node_modules/maplibre-gl/dist';
const to = 'public/maplibre';
mkdirSync(to, { recursive: true });
for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(`${from}/${file}`, `${to}/${file}`);
}
console.log('MapLibre worker copied to public/maplibre/');
