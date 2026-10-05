import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Reads the real tokens from globals.css, so the test cannot drift from the site.
const css = readFileSync('src/app/globals.css', 'utf8');

function block(selector: string): Record<string, string> {
  const start = css.indexOf(`${selector} {`);
  const end = css.indexOf('\n}', start);
  const body = css.slice(start, end);
  const tokens: Record<string, string> = {};
  for (const m of body.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)) tokens[m[1]] = m[2];
  return tokens;
}

const light = block(':root');
const dark = { ...light, ...block('[data-theme="dark"]') };

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// [foreground token, background token, minimum ratio]
// 4.5 = WCAG AA for normal text, 3 = large text and UI graphics.
const TEXT_PAIRS: [string, string, number][] = [
  ['text', 'bg', 4.5],
  ['text', 'surface', 4.5],
  ['text', 'surface-strong', 4.5],
  ['text-muted', 'bg', 4.5],
  ['text-muted', 'surface', 4.5],
  ['brand-text', 'bg', 4.5],
  ['brand-text', 'surface', 4.5],
  ['accent-text', 'bg', 4.5],
  ['accent-text', 'surface', 4.5],
  ['on-accent', 'accent', 4.5],
  ['text', 'accent-soft', 4.5],
  ['footer-text', 'footer-bg', 4.5],
  ['footer-muted', 'footer-bg', 4.5],
  ['on-cluster', 'cluster', 4.5],
];
const UI_PAIRS: [string, string, number][] = [
  ['border-strong', 'bg', 3],
  ['focus', 'bg', 3],
  ['type-university-on', 'type-university', 3],
  ['type-college-on', 'type-college', 3],
  ['type-school-on', 'type-school', 3],
  ['type-language_school-on', 'type-language_school', 3],
  ['type-foundation-on', 'type-foundation', 3],
  ['type-vocational-on', 'type-vocational', 3],
];

describe.each([
  ['light', light],
  ['dark', dark],
])('%s theme contrast', (_name, tokens) => {
  it.each([...TEXT_PAIRS, ...UI_PAIRS])('%s on %s is at least %s:1', (fg, bg, min) => {
    expect(tokens[fg], `token --${fg}`).toBeDefined();
    expect(tokens[bg], `token --${bg}`).toBeDefined();
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(min);
  });
});

it('gold text is readable on the light background', () => {
  expect(contrast(light['gold-text'], light['bg'])).toBeGreaterThanOrEqual(4.5);
  expect(contrast(dark['gold-text'], dark['bg'])).toBeGreaterThanOrEqual(4.5);
});
