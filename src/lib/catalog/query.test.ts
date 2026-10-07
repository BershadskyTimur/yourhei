import { describe, expect, it } from 'vitest';
import { nameFilter, searchTerm } from './query';

describe('searchTerm', () => {
  it('removes characters that could break a filter', () => {
    expect(searchTerm('a,b(c)%*d')).toBe('a b c d');
    expect(searchTerm('  Tbilisi   State  ')).toBe('Tbilisi State');
  });
  it('limits the length', () => {
    expect(searchTerm('x'.repeat(200)).length).toBe(60);
  });
});

describe('nameFilter', () => {
  it('builds an or-filter over the name keys', () => {
    expect(nameFilter('law', ['en', 'original'])).toBe('names->>en.ilike.%law%,names->>original.ilike.%law%');
  });
  it('is null for empty text', () => {
    expect(nameFilter('  ,, ', ['en'])).toBeNull();
  });
});
