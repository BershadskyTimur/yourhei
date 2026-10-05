import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';

/**
 * The page the links in e-mails lead to (confirm the address, reset the password).
 * It swaps the one-time code from the link for a login session, then sends the person on.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  // Only allow redirects inside this site, and only to "/<language>/...".
  const requested = searchParams.get('next') ?? '';
  const next =
    /^\/[a-z]{2}(\/|$)/.test(requested) && !requested.startsWith('//')
      ? requested
      : `/${routing.defaultLocale}`;
  const locale = next.split('/')[1];

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (code && url && key) {
    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (list) => list.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    });
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }

  // The link is expired, was used already, or was opened in another browser.
  return NextResponse.redirect(`${origin}/${locale}/login?notice=link`);
}
