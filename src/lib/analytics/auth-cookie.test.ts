import { describe, expect, it } from 'vitest';
import { accessTokenFromCookies } from './auth-cookie';

const NOW = 1_800_000_000;
const TOKEN = 'aaa.bbb.ccc';
const b64url = (s: string) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const session = (extra: object = {}) => JSON.stringify({ access_token: TOKEN, expires_at: NOW + 600, ...extra });

describe('accessTokenFromCookies', () => {
  it('reads a base64 cookie, also when it is cut into pieces', () => {
    const value = 'base64-' + b64url(session());
    expect(accessTokenFromCookies([{ name: 'sb-abc123-auth-token', value }], NOW)).toBe(TOKEN);
    const half = Math.floor(value.length / 2);
    expect(
      accessTokenFromCookies(
        [
          { name: 'sb-abc123-auth-token.1', value: value.slice(half) },
          { name: 'theme', value: 'dark' },
          { name: 'sb-abc123-auth-token.0', value: value.slice(0, half) },
        ],
        NOW,
      ),
    ).toBe(TOKEN);
  });

  it('reads a plain JSON cookie', () => {
    expect(accessTokenFromCookies([{ name: 'sb-abc123-auth-token', value: encodeURIComponent(session()) }], NOW)).toBe(TOKEN);
  });

  it('gives nothing without a sign-in, for a token that ran out and for garbage', () => {
    expect(accessTokenFromCookies([{ name: 'theme', value: 'dark' }], NOW)).toBeNull();
    expect(accessTokenFromCookies([{ name: 'sb-abc123-auth-token', value: 'base64-' + b64url(session({ expires_at: NOW - 1 })) }], NOW)).toBeNull();
    expect(accessTokenFromCookies([{ name: 'sb-abc123-auth-token', value: 'base64-!!!' }], NOW)).toBeNull();
    expect(accessTokenFromCookies([{ name: 'sb-abc123-auth-token', value: 'base64-' + b64url(session({ access_token: 'x y' })) }], NOW)).toBeNull();
  });
});
