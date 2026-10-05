import { describe, expect, it } from 'vitest';
import { checkPassword } from './password';

describe('checkPassword', () => {
  it('accepts a good password', () => {
    expect(checkPassword('Maple-tree-4-ever')).toEqual([]);
  });
  it('rejects short passwords', () => {
    expect(checkPassword('Ab1')).toContain('passwordTooShort');
  });
  it('needs a letter and a digit', () => {
    expect(checkPassword('1234567890123')).toContain('passwordNeedsLetter');
    expect(checkPassword('onlylettershere')).toContain('passwordNeedsDigit');
  });
  it('accepts letters of any alphabet', () => {
    expect(checkPassword('Тбилиси-2026-осень')).toEqual([]);
    expect(checkPassword('საქართველო2026ა')).toEqual([]);
  });
  it('rejects common passwords', () => {
    expect(checkPassword('Password123')).toContain('passwordCommon');
  });
  it('rejects a password built from the e-mail name', () => {
    expect(checkPassword('timurdimitriev1', 'timurdimitriev@example.com')).toContain('passwordLikeEmail');
  });
  it('can report several problems at once', () => {
    expect(checkPassword('abc')).toEqual(expect.arrayContaining(['passwordTooShort', 'passwordNeedsDigit']));
  });
});
