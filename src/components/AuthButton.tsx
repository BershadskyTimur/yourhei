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

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSignedIn(Boolean(data.session)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session)));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!signedIn) {
    return (
      <Link
        href="/login"
        className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-semibold text-on-accent hover:opacity-90"
      >
        {t('login')}
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/matches"
        className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-text hover:bg-surface-strong"
      >
        {t('matches')}
      </Link>
      <Link
        href="/profile"
        className="inline-flex h-10 items-center rounded-full bg-accent px-4 text-sm font-semibold text-on-accent hover:opacity-90"
      >
        {t('profile')}
      </Link>
      <button
        type="button"
        onClick={async () => {
          await getSupabaseBrowser()?.auth.signOut();
          router.replace('/');
        }}
        className="inline-flex h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-text hover:bg-surface-strong"
      >
        {t('logout')}
      </button>
    </>
  );
}
