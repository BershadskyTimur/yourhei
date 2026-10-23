import { describe, expect, it } from 'vitest';
import { eligibilityFor, filterScholarships } from './eligibility';

const items = [
  { id: 'chevening', levels: ['master'], eligibleCountries: null },
  { id: 'bolashak', levels: ['bachelor', 'master', 'phd'], eligibleCountries: ['KZ'] },
  { id: 'visegrad', levels: ['master', 'phd'], eligibleCountries: ['GE', 'AM', 'UA'] },
  { id: 'elyurt', levels: ['bachelor', 'master'], eligibleCountries: ['UZ'] },
];

describe('scholarship eligibility by citizenship', () => {
  it('says nothing without a citizenship', () => {
    expect(eligibilityFor('', ['KZ'])).toBeNull();
  });
  it('yes when the country is listed, no when the list exists without it, check when there is no list', () => {
    expect(eligibilityFor('KZ', ['KZ'])).toBe('yes');
    expect(eligibilityFor('GE', ['KZ'])).toBe('no');
    expect(eligibilityFor('GE', null)).toBe('check');
  });
  it('hides what is closed to the citizenship and puts confirmed programmes first', () => {
    const list = filterScholarships(items, { citizenship: 'GE', level: '', hideClosed: true });
    expect(list.map((x) => x.id)).toEqual(['visegrad', 'chevening']);
  });
  it('can show the closed ones too, at the end', () => {
    const list = filterScholarships(items, { citizenship: 'GE', level: '', hideClosed: false });
    expect(list.map((x) => x.id)).toEqual(['visegrad', 'chevening', 'bolashak', 'elyurt']);
  });
  it('filters by level, and leaves the order alone without a citizenship', () => {
    expect(filterScholarships(items, { citizenship: '', level: 'phd', hideClosed: true }).map((x) => x.id)).toEqual(['bolashak', 'visegrad']);
    expect(filterScholarships(items, { citizenship: '', level: '', hideClosed: true }).map((x) => x.id)).toEqual(['chevening', 'bolashak', 'visegrad', 'elyurt']);
  });
});
