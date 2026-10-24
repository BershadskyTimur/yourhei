import { describe, expect, it } from 'vitest';
import { linkKind, parseInline, plainText } from './inline';

describe('article inline markup', () => {
  it('splits text, bold and links', () => {
    expect(parseInline('a **b** [c](/catalog) d')).toEqual([
      { kind: 'text', text: 'a ' },
      { kind: 'bold', text: 'b' },
      { kind: 'text', text: ' ' },
      { kind: 'link', text: 'c', href: '/catalog', external: false },
      { kind: 'text', text: ' d' },
    ]);
  });
  it('marks https addresses as external', () => {
    expect(parseInline('[x](https://example.org/a)')[0]).toMatchObject({ kind: 'link', external: true });
  });
  it('turns unsafe or odd addresses into plain text', () => {
    expect(parseInline('[x](javascript:alert(1))')[0]).toMatchObject({ kind: 'text' });
    expect(parseInline('[x](http://example.org)')[0]).toMatchObject({ kind: 'text' });
    expect(parseInline('[x](//evil.example)')[0]).toMatchObject({ kind: 'text' });
    expect(linkKind('data:text/html,1')).toBeNull();
  });
  it('gives the plain text', () => {
    expect(plainText('a **b** [c](/catalog) d')).toBe('a b c d');
  });
});
