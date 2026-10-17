'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { AUTH_EVENT } from '@/lib/supabase/auth-event';

// The login is kept in a cookie named sb-<project>-auth-token (possibly in chunks .0, .1 ...). Reading the cookie is
// enough to know who sees which buttons, so the whole Supabase library (about 60 KB) is loaded only for people who are
// signed in, or on pages that need the database anyway.
function hasSession(): boolean {
  return document.cookie.split('; ').some((c) => /^sb-.+-auth-token(\.\d+)?=/.test(c));
}
function subscribe(callback: () => void) {
  window.addEventListener(AUTH_EVENT, callback);
  return () => window.removeEventListener(AUTH_EVENT, callback);
}

/**
 * Header button: "Log in" for guests, "Profile" + "Log out" for signed-in people.
 * It reads the session in the browser, so the pages themselves stay static and fast.
 */
export function AuthButton() {
  const t = useTranslations('Header');
  const router = useRouter();
  const signedIn = useSyncExternalStore(subscribe, hasSession, () => false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    // Only used to show the "Admin" link; the admin pages are protected by the database itself.
    (async () => {
      const { getSupabaseBrowser } = await import('@/lib/supabase/client');
      const supabase = getSupabaseBrowser();
      if (!supabase) return;
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user.id;
      if (!userId) return;
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      if (!cancelled) setIsAdmin(data?.role === 'admin');
    })();
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:opacity-90"
      >
        {t('login')}
      </Link>
    );
  }

  return (
    <>
      {isAdmin && (
        <Link
          href="/admin"
          className="inline-flex h-10 items-center rounded-lg border border-line-strong px-4 text-sm font-medium text-text hover:bg-surface-strong"
        >
          Admin
        </Link>
      )}
      <Link
        href="/favorites"
        className="inline-flex h-10 items-center rounded-lg border border-line-strong px-4 text-sm font-medium text-text hover:bg-surface-strong"
      >
        {t('favorites')}
      </Link>
      <Link
        href="/matches"
        className="inline-flex h-10 items-center rounded-lg border border-line-strong px-4 text-sm font-medium text-text hover:bg-surface-strong"
      >
        {t('matches')}
      </Link>
      <Link
        href="/profile"
        className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:opacity-90"
      >
        {t('profile')}
      </Link>
      <button
        type="button"
        onClick={async () => {
          const { getSupabaseBrowser } = await import('@/lib/supabase/client');
          await getSupabaseBrowser()?.auth.signOut();
          setIsAdmin(false);
          router.replace('/');
        }}
        className="inline-flex h-10 items-center rounded-lg border border-line-strong px-4 text-sm font-medium text-text hover:bg-surface-strong"
      >
        {t('logout')}
      </button>
    </>
  );
}
