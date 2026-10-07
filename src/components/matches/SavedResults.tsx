'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { secondaryButton } from '@/components/forms/ui';
import { Link } from '@/i18n/navigation';
import type { SnapshotItem } from '@/lib/matches/snapshot';
import { getSupabaseBrowser } from '@/lib/supabase/client';

interface Saved {
  id: string;
  token: string;
  shared: boolean;
  createdAt: string;
  count: number;
}
type Row = Record<string, unknown>;

/** "Save these results" and the list of saved results, each with a secret link that can be switched on and off. */
export function SavedResults({ items }: { items: SnapshotItem[] }) {
  const t = useTranslations('Matches.saved');
  const locale = useLocale();
  const [list, setList] = useState<Saved[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data, error: e } = await supabase.from('saved_matches').select('id, share_token, shared, created_at, items').order('created_at', { ascending: false }).limit(20);
    if (e) {
      setError(true);
      return;
    }
    setList(((data ?? []) as Row[]).map((r) => ({ id: String(r.id), token: String(r.share_token), shared: r.shared === true, createdAt: String(r.created_at), count: Array.isArray(r.items) ? r.items.length : 0 })));
  }, []);

  useEffect(() => {
    (async () => {
      await reload();
    })();
  }, [reload]);

  async function save() {
    const supabase = getSupabaseBrowser();
    if (!supabase || busy) return;
    setBusy(true);
    setError(false);
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      setBusy(false);
      return;
    }
    const { error: e } = await supabase.from('saved_matches').insert({ user_id: user.user.id, items });
    if (e) setError(true);
    await reload();
    setBusy(false);
  }

  async function setShared(s: Saved, shared: boolean) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { error: e } = await supabase.from('saved_matches').update({ shared }).eq('id', s.id);
    if (e) setError(true);
    else setList((cur) => (cur ?? []).map((x) => (x.id === s.id ? { ...x, shared } : x)));
  }

  async function remove(s: Saved) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { error: e } = await supabase.from('saved_matches').delete().eq('id', s.id);
    if (e) setError(true);
    else setList((cur) => (cur ?? []).filter((x) => x.id !== s.id));
  }

  const linkOf = (s: Saved) => `${window.location.origin}/${locale}/shared/${s.token}`;
  async function copy(s: Saved) {
    try {
      await navigator.clipboard.writeText(linkOf(s));
      setCopied(s.id);
    } catch {
      setCopied(null);
    }
  }

  if (items.length === 0 && (list === null || list.length === 0)) return null;
  return (
    <section className="rounded-lg border border-line bg-surface p-5" aria-labelledby="saved-title">
      <h2 id="saved-title" className="text-xl font-semibold text-text">{t('title')}</h2>
      <p className="mt-1 text-sm text-muted">{t('text')}</p>
      {items.length > 0 && (
        <button type="button" onClick={save} disabled={busy} className={`${secondaryButton} mt-3`}>
          {t('save')}
        </button>
      )}
      {error && <p role="alert" className="mt-3 text-sm font-medium text-danger">{t('failed')}</p>}
      {list && list.length > 0 && (
        <ul className="mt-4 space-y-3">
          {list.map((s) => (
            <li key={s.id} className="rounded-lg border border-line bg-bg p-3 text-sm">
              <p className="font-medium">
                {t('item', { date: new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(s.createdAt)), count: s.count })}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Link href={`/shared/${s.token}`} className="inline-flex h-9 items-center rounded-lg border border-line-strong px-3 hover:bg-surface-strong">{t('open')}</Link>
                <button type="button" onClick={() => setShared(s, !s.shared)} className="inline-flex h-9 items-center rounded-lg border border-line-strong px-3 hover:bg-surface-strong">
                  {s.shared ? t('stopSharing') : t('share')}
                </button>
                <button type="button" onClick={() => remove(s)} className="inline-flex h-9 items-center rounded-lg border border-line-strong px-3 hover:bg-surface-strong">{t('delete')}</button>
              </div>
              {s.shared && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input readOnly value={linkOf(s)} aria-label={t('linkLabel')} onFocus={(e) => e.currentTarget.select()} className="h-9 min-w-0 flex-1 rounded-lg border border-line-strong bg-surface px-2 text-xs" />
                  <button type="button" onClick={() => copy(s)} className="inline-flex h-9 items-center rounded-lg bg-accent px-3 font-medium text-on-accent hover:opacity-90">
                    {copied === s.id ? t('copied') : t('copy')}
                  </button>
                </div>
              )}
              {s.shared && <p className="mt-1 text-xs text-muted">{t('anyoneWithLink')}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
