import { describe, expect, it } from 'vitest';
import { composeDescription, institutionTitleCandidates, nameWithOriginal } from './institution-meta';
import { fitTitle } from './metadata';

// The Russian templates of messages/ru.json (Seo), filled the way next-intl fills them.
const RU: Record<string, string> = {
  institutionTitleFee: '{name}: стоимость обучения {year}',
  institutionTitleFeeShort: '{name}: стоимость {year}',
  institutionTitleProgrammes: '{name}, {place}: программы и поступление',
  institutionTitleProgrammesShort: '{name}: программы и поступление',
  institutionTitleProgrammesShortest: '{name}: программы',
};
const t = (key: string, values: Record<string, string | number> = {}) => RU[key].replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''));

describe('nameWithOriginal', () => {
  it('adds the original name when it differs', () => {
    expect(nameWithOriginal('Университет Бентли', 'Bentley University')).toBe('Университет Бентли (Bentley University)');
  });
  it('leaves it out when it is the same name or already inside', () => {
    expect(nameWithOriginal('Thomas University', 'Thomas University')).toBeNull();
    expect(nameWithOriginal('HWR Berlin', 'hwr-berlin')).toBeNull();
    expect(nameWithOriginal('Беннингтонский колледж', null)).toBeNull();
  });
  it('takes only the first of a list of names', () => {
    expect(nameWithOriginal('Колледж Хиллс', 'Hills College; Hurstville School')).toBe('Колледж Хиллс (Hills College)');
  });
});

describe('institutionTitleCandidates', () => {
  it('with a price: the year of the prices, the original name first', () => {
    const list = institutionTitleCandidates(t, { name: 'Университет Бентли', original: 'Bentley University', place: 'Уолтем', fee: true, year: '2025/26' });
    expect(list[0]).toBe('Университет Бентли (Bentley University): стоимость обучения 2025/26');
    expect(fitTitle(list)).toBe('Университет Бентли (Bentley University): стоимость 2025/26');
  });
  it('without a price: never promises the price', () => {
    const list = institutionTitleCandidates(t, { name: 'William James College', original: 'William James College', place: 'Ньютон', fee: false, year: null });
    expect(list.every((s) => !s.includes('стоимость'))).toBe(true);
    expect(fitTitle(list)).toBe('William James College, Ньютон: программы и поступление');
  });
  it('a price without a known year leaves no gap', () => {
    expect(institutionTitleCandidates(t, { name: 'X College', original: null, place: '', fee: true, year: null })[0]).toBe('X College: стоимость обучения');
  });
  it('a long name falls back to the shortest form', () => {
    const name = 'Technical University of Applied Sciences Würzburg-Schweinfurt';
    expect(fitTitle(institutionTitleCandidates(t, { name, original: name, place: 'Würzburg', fee: false, year: null }))).toBe(`${name}: программы`);
  });
});

describe('composeDescription', () => {
  it('adds the next sentences while they fit, skipping one that does not', () => {
    expect(composeDescription(['a'.repeat(100), 'b'.repeat(60), 'c'.repeat(40), null, 'd'.repeat(5)], 155)).toBe(`${'a'.repeat(100)} ${'c'.repeat(40)} ${'d'.repeat(5)}`);
  });
  it('keeps the first sentence even when it is long, and drops empty ones', () => {
    expect(composeDescription([false, 'x'.repeat(200), ''], 155)).toBe('x'.repeat(200));
    expect(composeDescription([])).toBe('');
  });
});
