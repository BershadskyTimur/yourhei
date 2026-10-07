'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { inputClass, primaryButton } from '@/components/forms/ui';
import { Link, usePathname } from '@/i18n/navigation';
import { getSupabaseBrowser } from '@/lib/supabase/client';

const RELATIONS = ['student', 'graduate', 'applicant'] as const;
const MIN = 20;
const MAX = 2000;

type Mine = { status: 'pending' | 'published' | 'rejected' } | null;
type State = { kind: 'loading' } | { kind: 'guest' } | { kind: 'ready'; userId: string; mine: Mine };

/** Write a review: only for signed-in people, one per institution, published after a check by the team. */
export function ReviewForm({ institutionId }: { institutionId: string | null }) {
  const t = useTranslations('Reviews');
  const locale = useLocale();
  const pathname = usePathname();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [rating, setRating] = useState(0);
  const [relation, setRelation] = useState<(typeof RELATIONS)[number]>('student');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const mine = await supabase.from('reviews').select('status').eq('institution_id', institutionId).eq('user_id', data.user.id).maybeSingle();
      const status = (mine.data as { status?: string } | null)?.status;
      setState({ kind: 'ready', userId: data.user.id, mine: status === 'pending' || status === 'published' || status === 'rejected' ? { status } : null });
    })();
  }, [institutionId]);

  if (!institutionId || state.kind === 'loading') return null;
  if (state.kind === 'guest') {
    return (
      <p className="mt-4 text-sm">
        <Link href={`/login?next=${encodeURIComponent(pathname)}`} className="font-semibold text-accent-text underline underline-offset-4">{t('loginToWrite')}</Link>
      </p>
    );
  }
  if (state.mine && state.mine.status !== 'rejected') {
    return <p className="mt-4 rounded-lg border border-line bg-bg px-4 py-3 text-sm">{t(`mine.${state.mine.status}`)}</p>;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind !== 'ready') return;
    const text = body.trim();
    if (rating < 1) return setError('rating');
    if (text.length < MIN) return setError('short');
    if (text.length > MAX) return setError('long');
    const supabase = getSupabaseBrowser();
    if (!supabase || !institutionId) return;
    setBusy(true);
    setError(null);
    const row = { institution_id: institutionId, user_id: state.userId, rating, relation, body: text, language: locale };
    // a rejected review is replaced by the new text
    const { error: e1 } = state.mine ? await supabase.from('reviews').update({ rating, relation, body: text, language: locale, status: 'pending' }).eq('institution_id', institutionId).eq('user_id', state.userId) : await supabase.from('reviews').insert(row);
    setBusy(false);
    if (e1) return setError('failed');
    setState({ ...state, mine: { status: 'pending' } });
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4 rounded-lg border border-line bg-surface p-5" noValidate>
      <h3 className="text-lg font-semibold text-text">{t('formTitle')}</h3>
      {state.mine?.status === 'rejected' && <p className="text-sm text-danger">{t('mine.rejected')}</p>}
      <fieldset>
        <legend className="text-sm font-semibold text-text">{t('rating')}</legend>
        <div className="mt-1 flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-pressed={rating === n} aria-label={t('stars', { count: n })} onClick={() => setRating(n)} className={`size-11 rounded-lg border text-xl ${rating >= n ? 'border-line-strong bg-accent-soft text-accent-text' : 'border-line bg-bg text-muted'}`}>
              ★
            </button>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-semibold text-text">
        {t('relation')}
        <select value={relation} onChange={(e) => setRelation(e.target.value as (typeof RELATIONS)[number])} className={`${inputClass} mt-1 font-normal`}>
          {RELATIONS.map((r) => (
            <option key={r} value={r}>{t(`relations.${r}`)}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold text-text">
        {t('body')}
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} maxLength={MAX} className="mt-1 w-full rounded-xl border border-line-strong bg-bg p-3 font-normal text-text" />
        <span className="text-xs font-normal text-muted">{t('counter', { count: body.trim().length, min: MIN, max: MAX })}</span>
      </label>
      <p className="text-sm text-muted">{t('rules')}</p>
      {error && <p role="alert" className="text-sm font-medium text-danger">{t(`errors.${error}` as 'errors.failed')}</p>}
      <button type="submit" disabled={busy} className={primaryButton}>{t('send')}</button>
    </form>
  );
}
