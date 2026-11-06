import { describe, expect, it } from 'vitest';
import { wikidataIdOf } from './detail';

describe('wikidataIdOf', () => {
  it('accepts an item id', () => {
    expect(wikidataIdOf('Q49112')).toBe('Q49112');
    expect(wikidataIdOf(' Q1 ')).toBe('Q1');
  });

  it('ignores everything else, so nothing odd reaches the page', () => {
    for (const v of ['', 'q49112', 'Q0', 'Q12a', 'https://evil.example/Q1', 'Q1/../x', null, undefined, 5, {}]) {
      expect(wikidataIdOf(v)).toBeNull();
    }
  });
});
