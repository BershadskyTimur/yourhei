// Draws the picture shown when a link to the site is shared (public/og.png, 1200x630). Run: node scripts/make-og-image.mjs
import sharp from 'sharp';

const dots = [];
let seed = 7;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
for (let i = 0; i < 170; i++) {
  const x = 40 + rnd() * 1120;
  const y = 40 + rnd() * 550;
  dots.push(`<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(2 + rnd() * 3).toFixed(1)}" fill="#e7b94b" opacity="${(0.12 + rnd() * 0.3).toFixed(2)}"/>`);
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#0a1a16"/>
${dots.join('')}
<g transform="translate(120 235) scale(4)">
<rect x="0.75" y="0.75" width="34.5" height="34.5" rx="2" fill="none" stroke="#f1efe6" stroke-width="1.5"/>
<path d="M7 15l11-5.5L29 15l-11 5.5z" fill="#f1efe6"/>
<path d="M12 19v5c0 1.8 2.7 3.5 6 3.5s6-1.7 6-3.5v-5l-6 3z" fill="#e7b94b"/>
</g>
<text x="300" y="352" font-family="Georgia, 'Times New Roman', serif" font-size="120" font-weight="500" fill="#f1efe6">YourHEI</text>
<rect x="300" y="390" width="120" height="4" fill="#e7b94b"/>
</svg>`;
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og.png');
console.log('public/og.png written');
