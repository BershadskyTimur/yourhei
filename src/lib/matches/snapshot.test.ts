import { describe, expect, it } from 'vitest';
import type { MatchResult, Matches } from '../matching/types';
import { buildSnapshot, parseSnapshot } from './snapshot';

const result = (n: number, group: MatchResult['group']): MatchResult =>
  ({
    program: { id: `p${n}`, names: { en: `Programme ${n}` }, level: 'bachelor', institution: { country: 'GE', slug: `uni-${n}`, names: { en: `University ${n}` } } },
    score: 80.6 - n,
    group,
  }) as unknown as MatchResult;

describe('buildSnapshot', () => {
  const matches = { safe: [result(1, 'safe'), result(2, 'safe')], suitable: [result(3, 'suitable')], ambitious: [], checked: 10, passed: 3 } as Matches;
  it('keeps the order of the groups and rounds the score', () => {
    const items = buildSnapshot(matches);
    expect(items.map((i) => i.group)).toEqual(['safe', 'safe', 'suitable']);
    expect(items[0]).toMatchObject({ slug: 'uni-1', score: 80, country: 'GE', level: 'bachelor' });
  });
  it('limits the number per group', () => {
    expect(buildSnapshot(matches, 1).map((i) => i.slug)).toEqual(['uni-1', 'uni-3']);
  });
});

describe('parseSnapshot', () => {
  it('round-trips and drops broken rows', () => {
    const items = buildSnapshot({ safe: [result(1, 'safe')], suitable: [], ambitious: [], checked: 1, passed: 1 } as Matches);
    expect(parseSnapshot(JSON.parse(JSON.stringify(items)))).toEqual(items);
    expect(parseSnapshot([{ group: 'nope' }, null, 5, { ...items[0], score: 'x' }])).toEqual([]);
    expect(parseSnapshot('text')).toEqual([]);
  });
});
