import { describe, expect, it } from 'vitest';
import { pickNeighbours } from './similar';

const items = (...slugs: string[]) => slugs.map((slug) => ({ slug }));

describe('pickNeighbours', () => {
  it('takes the next ones after the institution first', () => {
    expect(pickNeighbours(items('d', 'e'), items('a', 'b'), 'c', 3).map((i) => i.slug)).toEqual(['d', 'e', 'a']);
  });
  it('never the institution itself, no repeats, at most the count', () => {
    expect(pickNeighbours(items('c', 'd'), items('d', 'a', 'b'), 'c', 2).map((i) => i.slug)).toEqual(['d', 'a']);
    expect(pickNeighbours([], [], 'c')).toEqual([]);
  });
});
