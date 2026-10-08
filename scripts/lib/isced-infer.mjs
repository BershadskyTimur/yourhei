// Works out the narrow ISCED-F field (3 digits) of a programme from its NAME, using the everyday words in
// data/reference/isced-keywords.json. Used by the importers of countries whose portal gives no field code.
// It answers null when it is not sure: a missing field is better than a wrong one.
import { readFileSync } from 'node:fs';

const KEYWORDS = JSON.parse(readFileSync(new URL('../../data/reference/isced-keywords.json', import.meta.url), 'utf8'));
const norm = (s) => ` ${String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `;

const PHRASES = Object.entries(KEYWORDS)
  .filter(([code]) => /^\d{4}$/.test(code))
  .flatMap(([code, w]) => [...(w.en ?? []), ...(w.ru ?? [])].map((p) => ({ code, phrase: norm(p), words: norm(p).trim().split(' ').length })))
  .filter((x) => x.phrase.trim().length >= 3);

/** @returns {string|null} a 3-digit narrow field code, or null */
export function inferIsced(name) {
  const text = norm(name);
  const score = new Map();
  for (const { code, phrase, words } of PHRASES) {
    if (!text.includes(phrase)) continue;
    // a longer phrase is more specific ("international relations" beats "relations"); very short words count little
    const points = words * 2 + Math.min(phrase.trim().length, 12) / 12;
    const narrow = code.slice(0, 3);
    score.set(narrow, Math.max(score.get(narrow) ?? 0, points) + (score.has(narrow) ? 0.3 : 0));
  }
  if (score.size === 0) return null;
  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]);
  const [best, second] = ranked;
  // unsure when two fields are almost equally likely and are not in the same broad field
  if (second && best[1] - second[1] < 0.4 && best[0].slice(0, 2) !== second[0].slice(0, 2)) return null;
  return best[0];
}

/** A broad field (2 digits) from the coarse labels some portals use; only where the label is unambiguous. */
export function broadFromLabel(label) {
  const l = String(label ?? '').toLowerCase();
  if (/^engineering/.test(l)) return '07';
  if (/health care/.test(l)) return '09';
  if (/teacher training/.test(l)) return '01';
  if (/hotel|tourism|catering/.test(l)) return '10';
  if (/^economics, commerce/.test(l)) return '04';
  return null;
}
