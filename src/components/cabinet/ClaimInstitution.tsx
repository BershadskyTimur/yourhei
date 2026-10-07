'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { inputClass, primaryButton } from '@/components/forms/ui';
import { Link } from '@/i18n/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';

type Status = 'pending' | 'approved' | 'rejected';
type State = { kind: 'loading' } | { kind: 'guest' } | { kind: 'ready'; userId: string; status: Status | null };

/** "Do you work here?": a request to manage this institution's card; the team checks it before access is given. */
export function ClaimInstitution({ institutionId }: { institutionId: string | null }) {
  const t = useTranslations('Cabinet.claim');
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    (async () => {
      if (!supabase || !institutionId) {
        setState({ kind: 'guest' });
        return;
      }
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        setState({ kind: 'guest' });
        return;
      }
      const mine = await supabase.from('institution_reps').select('status').eq('institution_id', institutionId).eq('user_id', data.user.id).maybeSingle();
      const status = (mine.data as { status?: string } | null)?.status;
      setState({ kind: 'ready', userId: data.user.id, status: status === 'pending' || status === 'approved' || status === 'rejected' ? status : null });
    })();
  }, [institutionId]);

  if (!institutionId || state.kind === 'loading') return null;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind !== 'ready' || busy) return;
    const supabase = getSupabaseBrowser();
    if (!supabase || !institutionId) return;
    setBusy(true);
    setError(false);
    const { error: err } = await supabase.from('institution_reps').insert({ user_id: state.userId, institution_id: institutionId, position: position.trim() || null, message: message.trim() || null });
    setBusy(false);
    if (err) return setError(true);
    setState({ ...state, status: 'pending' });
  }

  return (
    <section className="mt-10 rounded-lg border border-dashed border-line-strong p-5" aria-labelledby="claim-title">
      <h2 id="claim-title" className="text-lg font-semibold text-text">{t('title')}</h2>
      <p className="mt-1 text-sm text-muted">{t('text')}</p>
      {state.kind === 'guest' ? (
        <p className="mt-3 text-sm">
          <Link href="/login" className="font-semibold text-accent-text underline underline-offset-4">{t('login')}</Link>
        </p>
      ) : state.status === 'approved' ? (
        <p className="mt-3 text-sm font-medium">
          <Link href="/cabinet" className="text-accent-text underline underline-offset-4">{t('openCabinet')}</Link>
        </p>
      ) : state.status === 'pending' ? (
        <p className="mt-3 text-sm font-medium">{t('pending')}</p>
      ) : state.status === 'rejected' ? (
        <p className="mt-3 text-sm font-medium">{t('rejected')}</p>
      ) : !open ? (
        <button type="button" onClick={() => setOpen(true)} className="mt-3 inline-flex h-10 items-center rounded-lg border border-line-strong px-4 text-sm font-medium hover:bg-surface-strong">
          {t('ask')}
        </button>
      ) : (
        <form onSubmit={send} className="mt-4 space-y-3">
          <label className="block text-sm font-semibold text-text">
            {t('position')}
            <input value={position} onChange={(e) => setPosition(e.target.value)} maxLength={120} className={`${inputClass} mt-1 font-normal`} />
          </label>
          <label className="block text-sm font-semibold text-text">
            {t('message')}
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={1000} rows={3} className="mt-1 w-full rounded-xl border border-line-strong bg-bg p-3 font-normal text-text" />
            <span className="text-xs font-normal text-muted">{t('messageHint')}</span>
          </label>
          {error && <p role="alert" className="text-sm font-medium text-danger">{t('failed')}</p>}
          <button type="submit" disabled={busy} className={primaryButton}>{t('send')}</button>
        </form>
      )}
    </section>
  );
}
