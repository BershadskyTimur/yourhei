export const MIN_PASSWORD_LENGTH = 10;

/** Keys of Register.errors.* in the translation files. */
export type PasswordProblem = 'passwordTooShort' | 'passwordNeedsLetter' | 'passwordNeedsDigit' | 'passwordCommon' | 'passwordLikeEmail';

// A small blocklist of the most common passwords that would pass the other rules.
const COMMON = new Set([
  'password12', 'password123', 'password1234', 'qwerty1234', 'qwerty12345', 'qwertyuiop1',
  '1234567890a', 'a1234567890', 'iloveyou123', 'welcome123', 'admin12345', 'letmein1234',
  'abc1234567', 'abcd123456', 'yourhei123',
]);

/** Returns every problem found; an empty list means the password is acceptable. */
export function checkPassword(password: string, email = ''): PasswordProblem[] {
  const problems: PasswordProblem[] = [];
  if (password.length < MIN_PASSWORD_LENGTH) problems.push('passwordTooShort');
  if (!/\p{L}/u.test(password)) problems.push('passwordNeedsLetter');
  if (!/\d/.test(password)) problems.push('passwordNeedsDigit');
  const lower = password.toLowerCase();
  if (COMMON.has(lower)) problems.push('passwordCommon');
  const local = email.split('@')[0]?.toLowerCase();
  if (local && local.length >= 4 && (lower === email.toLowerCase() || lower.includes(local))) {
    problems.push('passwordLikeEmail');
  }
  return problems;
}
