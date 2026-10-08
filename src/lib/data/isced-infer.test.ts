import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JavaScript module without types
import { broadFromLabel, inferIsced } from '../../../scripts/lib/isced-infer.mjs';

describe('inferIsced', () => {
  it('finds the field of a programme by its name', () => {
    expect(inferIsced('MSc International Relations')).toBe('031');
    expect(inferIsced('Master of Science in Computer Science and Artificial Intelligence')).toBe('061');
    expect(inferIsced('Bachelor Mechanical Engineering')).toBe('071');
    expect(inferIsced('LL.M. International Law')).toBe('042');
    expect(inferIsced('Medicine')).toBe('091');
    expect(inferIsced('Marketing and Brand Management')).toBe('041');
  });
  it('prefers the more specific phrase', () => {
    expect(inferIsced('Master in Public Administration')).toBe('041');
    expect(inferIsced('European Studies')).toBe('031');
  });
  it('is not sure about nonsense', () => {
    expect(inferIsced('Programme xyz')).toBeNull();
    expect(inferIsced('')).toBeNull();
  });
});

describe('broadFromLabel', () => {
  it('maps only unambiguous labels', () => {
    expect(broadFromLabel('Engineering')).toBe('07');
    expect(broadFromLabel('Health care, social services and care services')).toBe('09');
    expect(broadFromLabel('General programmes')).toBeNull();
    expect(broadFromLabel('Humanities, social sciences, communication and arts')).toBeNull();
  });
});
