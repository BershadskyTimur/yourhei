import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LOCALE_CODES } from '../src/config/locales';

type Tree = { [key: string]: string | Tree };

const load = (code: string): Tree =>
  JSON.parse(readFileSync(`messages/${code}.json`, 'utf8')) as Tree;

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(tree)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') out[key] = v;
    else Object.assign(out, flatten(v, key));
  }
  return out;
}

const reference = flatten(load('en'));

describe.each(LOCALE_CODES.filter((c) => c !== 'en'))('messages/%s.json', (code) => {
  const messages = flatten(load(code));

  it('has exactly the same keys as English', () => {
    expect(Object.keys(messages).sort()).toEqual(Object.keys(reference).sort());
  });

  it('has no empty texts', () => {
    for (const [key, value] of Object.entries(messages)) {
      expect(value.trim(), key).not.toBe('');
    }
  });

  it('uses the same {placeholders} as English', () => {
    // A parameter is "{name}" or "{name, plural|select, ...}"; words inside the option texts are not parameters.
    const names = (s: string) => [...new Set([...s.matchAll(/\{(\w+)\s*(?:,|\})/g)].map((m) => m[1]))].sort();
    for (const key of Object.keys(reference)) {
      expect(names(messages[key]), key).toEqual(names(reference[key]));
    }
  });
});
