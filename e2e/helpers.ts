import type { Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/** Reads NEXT_PUBLIC_SUPABASE_URL from .env.local (the same file the site uses). */
function supabaseRef(): { url: string; ref: string } {
  const env = readFileSync('.env.local', 'utf8');
  const url = /^NEXT_PUBLIC_SUPABASE_URL=(.+)$/m.exec(env)?.[1].trim() ?? 'https://example.supabase.co';
  return { url, ref: new URL(url).hostname.split('.')[0] };
}

/**
 * Makes the page believe it is signed in: puts a session cookie where the Supabase client looks for it
 * and answers its requests with fakes. `profile` null = the profiles table has no row for this user.
 * Returns the bodies of the PATCH requests the page sent to the profiles table.
 */
export async function fakeSignIn(page: Page, profile: Record<string, unknown> | null) {
  const { url, ref } = supabaseRef();
  const user = {
    id: 'u1',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'student@example.com',
    created_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
  };
  const session = {
    access_token: 'fake.access.token',
    refresh_token: 'fake-refresh',
    token_type: 'bearer',
    expires_in: 36000,
    expires_at: Math.floor(Date.now() / 1000) + 36000,
    user,
  };
  const value = 'base64-' + Buffer.from(JSON.stringify(session)).toString('base64url');
  await page.context().addCookies([
    { name: `sb-${ref}-auth-token`, value, url: 'http://localhost:3000' },
  ]);

  const patches: unknown[] = [];
  const json = (body: unknown, status = 200) => ({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });

  await page.route(`${url}/auth/v1/user**`, (route) => route.fulfill(json(user)));
  await page.route(`${url}/rest/v1/profiles**`, (route) => {
    const method = route.request().method();
    if (method === 'PATCH') {
      patches.push(route.request().postDataJSON());
      return route.fulfill(json(profile ? [{ id: 'u1' }] : []));
    }
    // GET with maybeSingle(): one object, or null
    return route.fulfill(profile ? json(profile) : { status: 200, contentType: 'application/json', body: 'null' });
  });
  await page.route(`${url}/rest/v1/user_documents**`, (route) => {
    const method = route.request().method();
    if (method === 'GET') return route.fulfill(json([]));
    return route.fulfill({ status: 204, body: '' });
  });

  return { patches };
}
