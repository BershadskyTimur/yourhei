'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';
import { secondaryButton } from './forms/ui';

/** "Continue with Google". Shown only when NEXT_PUBLIC_GOOGLE_AUTH=true (Google is switched on in Supabase). */
export function GoogleButton({ next }: { next: string }) {
  const t = useTranslations('Login');
  const locale = useLocale();
  const [error, setError] = useState(false);
  if (process.env.NEXT_PUBLIC_GOOGLE_AUTH !== 'true' || !isSupabaseConfigured()) return null;

  async function start() {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setError(false);
    const target = encodeURIComponent(`/${locale}${next}`);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${target}&consent=1` },
    });
    if (err) setError(true);
  }

  return (
    <div className="mb-6">
      <button type="button" onClick={start} className={`${secondaryButton} w-full gap-3`}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.8V6.5H1.4a12 12 0 0 0 0 11l4-3.1z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.5l4 3.1C6.3 6.9 8.9 4.8 12 4.8z" />
        </svg>
        {t('google')}
      </button>
      {error && <p role="alert" className="mt-2 text-sm font-medium text-danger">{t('errors.google')}</p>}
      <p className="mt-2 text-xs text-muted">
        {t.rich('googleNotice', {
          privacy: (c) => <Link href="/privacy" className="underline underline-offset-4">{c}</Link>,
          terms: (c) => <Link href="/terms" className="underline underline-offset-4">{c}</Link>,
        })}
      </p>
      <p className="mt-4 text-center text-sm text-muted">{t('or')}</p>
    </div>
  );
}
