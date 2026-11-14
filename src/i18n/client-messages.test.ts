import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { SHARED_CLIENT_NAMESPACES, isCovered, pickMessages } from './pick-messages';

// Only some groups of the interface texts are sent to the browser (pick-messages.ts). This test reads the source of every
// page, follows its imports, finds the components that run in the browser and checks that every group they ask for
// (useTranslations('Group')) is sent: either on every page, or named by the page in <ClientMessages namespaces={[…]}>.

const SRC = path.resolve(__dirname, '..');
const APP = path.join(SRC, 'app');

function resolveImport(from: string, spec: string): string | null {
  const base = spec.startsWith('@/') ? path.join(SRC, spec.slice(2)) : spec.startsWith('.') ? path.resolve(path.dirname(from), spec) : null;
  if (!base) return null;
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) {
    if (existsSync(candidate) && /\.tsx?$/.test(candidate)) return candidate;
  }
  return null;
}

const sources = new Map<string, string>();
const read = (file: string) => sources.get(file) ?? (sources.set(file, readFileSync(file, 'utf8')), sources.get(file)!);
const importsOf = (file: string) =>
  // "import type …" lines are removed first: a type brings no code with it
  [...read(file).replace(/import\s+type\s[^;]*;/g, '').matchAll(/(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"]+)['"]/g)]
    .map((m) => resolveImport(file, m[1]!))
    .filter((f): f is string => f !== null);
const isClientFile = (file: string) => /^\s*['"]use client['"]/.test(read(file));

/** The groups asked for by the browser components reachable from this file. */
function clientNamespaces(entry: string): Map<string, string> {
  const needed = new Map<string, string>();
  const seen = new Set<string>();
  const walk = (file: string, inClient: boolean) => {
    const client = inClient || isClientFile(file);
    const key = `${file}|${client}`;
    if (seen.has(key)) return;
    seen.add(key);
    if (client) for (const m of read(file).matchAll(/useTranslations\(\s*['"]([\w.]+)['"]\s*\)/g)) needed.set(m[1]!, path.relative(SRC, file));
    for (const next of importsOf(file)) walk(next, client);
  };
  walk(entry, false);
  return needed;
}

function declared(file: string): string[] {
  return [...read(file).matchAll(/<ClientMessages\s+namespaces=\{\[([^\]]*)\]\}/g)].flatMap((m) => [...m[1]!.matchAll(/['"]([\w.]+)['"]/g)].map((n) => n[1]!));
}

function filesNamed(dir: string, names: readonly string[]): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? filesNamed(path.join(dir, e.name), names) : names.includes(e.name) ? [path.join(dir, e.name)] : []));
}

describe('interface texts sent to the browser', () => {
  const entries = filesNamed(APP, ['page.tsx', 'layout.tsx', 'error.tsx', 'not-found.tsx']);

  it('finds the pages', () => {
    expect(entries.length).toBeGreaterThan(30);
  });

  it.each(entries.map((f) => [path.relative(SRC, f).replaceAll('\\', '/'), f] as const))('%s sends every group its browser components use', (_name, file) => {
    const sent = [...SHARED_CLIENT_NAMESPACES, ...declared(file)];
    const missing = [...clientNamespaces(file)].filter(([ns]) => !isCovered(ns, sent)).map(([ns, where]) => `${ns} (${where})`);
    expect(missing).toEqual([]);
  });

  it('names no group a page does not need', () => {
    const extra = entries.flatMap((file) => {
      const needed = [...clientNamespaces(file).keys()];
      return declared(file)
        .filter((d) => !needed.some((n) => isCovered(n, [d])))
        .map((d) => `${path.relative(SRC, file)}: ${d}`);
    });
    expect(extra).toEqual([]);
  });

  it('names only groups that exist in the translations', () => {
    const messages = JSON.parse(readFileSync(path.resolve(SRC, '..', 'messages', 'en.json'), 'utf8')) as Record<string, unknown>;
    const all = [...SHARED_CLIENT_NAMESPACES, ...entries.flatMap(declared)];
    const has = (ns: string) => ns.split('.').reduce<unknown>((o, p) => (typeof o === 'object' && o !== null ? (o as Record<string, unknown>)[p] : undefined), messages) !== undefined;
    expect(all.filter((ns) => !has(ns))).toEqual([]);
  });
});

describe('pickMessages', () => {
  const messages = { A: { x: '1' }, B: { c: { d: '2', e: '3' }, f: '4' }, G: { h: '5' } };

  it('keeps only the named groups', () => {
    expect(pickMessages(messages, ['A'])).toEqual({ A: { x: '1' } });
  });

  it('picks a group inside a group', () => {
    expect(pickMessages(messages, ['B.c'])).toEqual({ B: { c: { d: '2', e: '3' } } });
  });

  it('keeps the whole group when a part of it is named too, in any order', () => {
    expect(pickMessages(messages, ['B', 'B.c'])).toEqual({ B: messages.B });
    expect(pickMessages(messages, ['B.c', 'B'])).toEqual({ B: messages.B });
  });

  it('skips a group that does not exist', () => {
    expect(pickMessages(messages, ['Z', 'A.nope'])).toEqual({});
  });

  it('knows that a part is inside its group', () => {
    expect(isCovered('Survey.ui', ['Survey'])).toBe(true);
    expect(isCovered('Survey', ['Survey.ui'])).toBe(false);
    expect(isCovered('Surveyor', ['Survey'])).toBe(false);
  });
});
