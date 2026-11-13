// Finds the sign-in token of the visitor in the cookies the Supabase library keeps (sb-<project>-auth-token, sometimes
// cut into .0, .1 … pieces and written as "base64-…"). api/track passes it on to the database, and the database itself
// checks it and decides whose visit it is. Nothing is refreshed or changed here. Pure function.

interface Cookie {
  name: string;
  value: string;
}

function decode(value: string): string | null {
  try {
    if (!value.startsWith('base64-')) return decodeURIComponent(value);
    const b64 = value.slice(7).replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  } catch {
    return null;
  }
}

/** The access token of a signed-in visitor, or null (no sign-in, a broken cookie, or a token that has run out). */
export function accessTokenFromCookies(cookies: Cookie[], nowSeconds: number): string | null {
  const parts = new Map<number, string>();
  for (const c of cookies) {
    const m = c.name.match(/^sb-[a-z0-9]+-auth-token(?:\.(\d))?$/);
    if (m) parts.set(m[1] ? Number(m[1]) : 0, c.value);
  }
  if (parts.size === 0) return null;
  const joined = [...parts.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v).join('');
  const text = decode(joined);
  if (!text) return null;
  try {
    const session = JSON.parse(text) as { access_token?: unknown; expires_at?: unknown };
    const token = session.access_token;
    if (typeof token !== 'string' || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token) || token.length > 4000) return null;
    if (typeof session.expires_at !== 'number' || session.expires_at <= nowSeconds + 5) return null;
    return token;
  } catch {
    return null;
  }
}
