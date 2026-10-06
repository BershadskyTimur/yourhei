'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';

type State = 'loading' | 'guest' | 'off' | 'on' | 'failed';

const base = 'inline-flex h-10 items-center gap-2 rounded-lg border border-line-strong px-4 text-sm font-medium text-text hover:bg-surface-strong disabled:opacity-60';

/** "Save" button of an institution card: adds / removes the institution from "My list". */
export function FavoriteButton({ institutionId }: { institutionId: string | null }) {
  const t = useTranslations('Institution');
  const [state, setState] = useState<State>('loading');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !institutionId) return;
    let live = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!live) return;
      if (!data.user) return setState('guest');
      setUserId(data.user.id);
      const { data: row, error } = await supabase.from('favorites').select('institution_id').eq('user_id', data.user.id).eq('institution_id', institutionId).maybeSingle();
      if (live) setState(error ? 'failed' : row ? 'on' : 'off');
    })();
    return () => {
      live = false;
    };
  }, [institutionId]);

  if (!institutionId || !getSupabaseBrowser()) return null;
  if (state === 'loading') return <span className={`${base} opacity-60`} aria-hidden="true">…</span>;
  if (state === 'guest') {
    return (
      <Link href="/login" className={base}>
        {t('favoriteLogin')}
      </Link>
    );
  }

  async function toggle() {
    const supabase = getSupabaseBrowser();
    if (!supabase || !userId || !institutionId) return;
    const wasOn = state === 'on';
    setState(wasOn ? 'off' : 'on');
    const { error } = wasOn
      ? await supabase.from('favorites').delete().eq('user_id', userId).eq('institution_id', institutionId)
      : await supabase.from('favorites').insert({ user_id: userId, institution_id: institutionId });
    if (error) setState(wasOn ? 'on' : 'off');
  }

  const on = state === 'on';
  return (
    <button type="button" onClick={toggle} aria-pressed={on} className={`${base} ${on ? 'border-accent bg-accent-soft' : ''}`}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 21s-7-4.6-9.3-9A5.4 5.4 0 0 1 12 6a5.4 5.4 0 0 1 9.3 6C19 16.4 12 21 12 21z" />
      </svg>
      {on ? t('favoriteRemove') : t('favoriteAdd')}
    </button>
  );
}
