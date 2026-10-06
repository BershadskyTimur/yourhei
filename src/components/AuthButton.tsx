'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';

/**
 * Header button: "Log in" for guests, "Profile" + "Log out" for signed-in people.
 * It reads the session in the browser, so the pages themselves stay static and fast.
 */
export function AuthButton() {
  const t = useTranslations('Header');
  const router = useRouter();
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    // Only used to show the "Admin" link; the admin pages are protected by the database itself.
    const checkAdmin = async (userId: string | undefined) => {
      if (!userId) return setIsAdmin(false);
      const { data } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
      setIsAdmin(data?.role === 'admin');
    };
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session));
      void checkAdmin(data.session?.user.id);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      void checkAdmin(session?.user.id);
    });
    return () => data.subscription.unsubscribe();
  }, []);

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
          await getSupabaseBrowser()?.auth.signOut();
          router.replace('/');
        }}
        className="inline-flex h-10 items-center rounded-lg border border-line-strong px-4 text-sm font-medium text-text hover:bg-surface-strong"
      >
        {t('logout')}
      </button>
    </>
  );
}
