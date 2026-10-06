'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import {
  isComplete,
  isDone,
  nextQuestion,
  progress,
  pruneAnswers,
  skipAllOptional,
  validateAnswer,
  visibleQuestions,
  type Answers,
} from '@/lib/survey/engine';
import {
  abandonAttempt,
  completeAttempt,
  listAttempts,
  saveAnswers,
  startAttempt,
  type Attempt,
} from '@/lib/survey/store';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { primaryButton, secondaryButton } from '../forms/ui';
import { QuestionView } from './QuestionView';

type View =
  | { kind: 'loading' }
  | { kind: 'failed' }
  | { kind: 'hub'; attempts: Attempt[] }
  | { kind: 'run'; attempt: Attempt }
  | { kind: 'done' };

const isEmptyValue = (v: unknown): boolean =>
  v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);

export function SurveyApp() {
  const t = useTranslations('Survey');
  const router = useRouter();
  const [view, setView] = useState<View>({ kind: 'loading' });
  const [userId, setUserId] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const load = () => setReloadKey((k) => k + 1);

  // (Re)loads the person's attempts; the state is set after the network answer.
  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      router.replace('/login');
      return;
    }
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (!data.user) {
          router.replace('/login?next=%2Fsurvey');
          return;
        }
        setUserId(data.user.id);
        setView({ kind: 'hub', attempts: await listAttempts(supabase) });
      } catch (error) {
        console.error('[survey] could not load', error);
        setView({ kind: 'failed' });
      }
    })();
  }, [reloadKey, router]);

  const start = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !userId) return;
    try {
      setView({ kind: 'run', attempt: await startAttempt(supabase, userId) });
    } catch (error) {
      console.error('[survey] could not start', error);
      setView({ kind: 'failed' });
    }
  };

  if (view.kind === 'loading') return <p className="text-muted">{t('ui.loading')}</p>;
  if (view.kind === 'failed') {
    return (
      <p role="alert" className="rounded-xl border border-danger p-4 font-medium text-danger">
        {t('ui.loadFailed')}
      </p>
    );
  }
  if (view.kind === 'run') {
    return <Runner attempt={view.attempt} onDone={() => setView({ kind: 'done' })} onExit={load} />;
  }
  if (view.kind === 'done') return <Done onAgain={start} />;
  return <Hub attempts={view.attempts} onStart={start} onChanged={load} />;
}

// ------------------------------------------------------------------ the start page
function Hub({ attempts, onStart, onChanged }: { attempts: Attempt[]; onStart: () => void; onChanged: () => void }) {
  const t = useTranslations('Survey');
  const locale = useLocale();
  const open = attempts.find((a) => a.status === 'in_progress');
  const finished = attempts.filter((a) => a.status === 'completed');
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' });
  const [continuing, setContinuing] = useState<Attempt | null>(null);

  if (continuing) return <Runner attempt={continuing} onDone={onChanged} onExit={onChanged} />;

  const discard = async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !open) return;
    await abandonAttempt(supabase, open.id);
    onChanged();
  };

  return (
    <div className="space-y-8">
      <p className="text-lg">{t('intro')}</p>

      <section className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        {open ? (
          <>
            <p className="font-medium">{t('hub.startedOn', { date: date.format(new Date(open.started_at)) })}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => setContinuing(open)} className={primaryButton}>
                {t('hub.continue')}
              </button>
              <button type="button" onClick={discard} className={secondaryButton}>
                {t('hub.discard')}
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={onStart} className={primaryButton}>
            {finished.length > 0 ? t('hub.again') : t('hub.start')}
          </button>
        )}
        <p className="mt-4 text-sm text-muted">{t('hub.profileHint')}</p>
      </section>

      {finished.length > 0 && (
        <section aria-labelledby="past-title">
          <h2 id="past-title" className="text-xl font-semibold text-text">{t('hub.past')}</h2>
          <p className="mt-1 text-sm text-muted">{t('hub.noteRetake')}</p>
          <ul className="mt-4 space-y-2">
            {finished.map((a) => (
              <li key={a.id} className="rounded-xl border border-line bg-surface px-4 py-3">
                {t('hub.pastItem', { date: date.format(new Date(a.completed_at ?? a.updated_at)) })}
                {typeof a.answers.level === 'string' && (
                  <span className="text-muted"> · {t(`q.level.options.${a.answers.level}` as never)}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ the end screen
function Done({ onAgain }: { onAgain: () => void }) {
  const t = useTranslations('Survey');
  return (
    <section aria-labelledby="done-title" className="rounded-2xl border border-line-strong bg-accent-soft p-6">
      <h2 id="done-title" className="text-2xl font-semibold text-text">{t('done.title')}</h2>
      <p className="mt-3 text-lg">{t('done.text')}</p>
      <p className="mt-2 text-sm text-muted">{t('hub.noteRetake')}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/matches" className={primaryButton}>{t('done.toMatches')}</Link>
        <Link href="/profile" className={secondaryButton}>{t('done.toProfile')}</Link>
        <button type="button" onClick={onAgain} className={secondaryButton}>{t('hub.again')}</button>
      </div>
    </section>
  );
}

// ------------------------------------------------------------------ asking the questions
function Runner({ attempt, onDone, onExit }: { attempt: Attempt; onDone: () => void; onExit: () => void }) {
  const t = useTranslations('Survey');
  const tUi = useTranslations('Survey.ui');
  const [answers, setAnswers] = useState<Answers>(attempt.answers ?? {});
  const [qid, setQid] = useState<string>(() => nextQuestion(attempt.answers ?? {})?.id ?? visibleQuestions({}).at(0)!.id);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [saveError, setSaveError] = useState(false);
  const [busy, setBusy] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const shown = visibleQuestions(answers);
  const index = Math.max(0, shown.findIndex((q) => q.id === qid));
  const q = shown[index];
  const stats = progress(answers);
  const percent = Math.round((stats.done / Math.max(1, stats.total)) * 100);
  const value = answers[q.id];

  const go = (id: string) => {
    setQid(id);
    setErrorCode(null);
    requestAnimationFrame(() => titleRef.current?.focus());
  };

  /** Saves, then moves on (or finishes when nothing is left). */
  const commit = async (next: Answers, mode: 'step' | 'forward' = 'step') => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    setSaveError(false);
    try {
      const after = visibleQuestions(next);
      // 'step': the next question in order that is not done yet (answered or skipped ones are passed over);
      // 'forward' (skip all): straight to the first one still open.
      const at = after.findIndex((x) => x.id === q.id);
      const following = mode === 'step' ? (after.slice(at + 1).find((x) => !isDone(x, next)) ?? null) : null;
      const pending = nextQuestion(next);

      if (!following && !pending) {
        // Everything required is answered and we are past the last question: freeze the attempt.
        if (!isComplete(next)) return;
        const ok = await completeAttempt(supabase, attempt.id, pruneAnswers(next));
        if (!ok) throw new Error('attempt is frozen');
        onDone();
        return;
      }
      if (!(await saveAnswers(supabase, attempt.id, next))) throw new Error('attempt is frozen');
      setAnswers(next);
      go((following ?? pending!).id);
    } catch (error) {
      console.error('[survey] save failed', error);
      setSaveError(true);
    } finally {
      setBusy(false);
    }
  };

  const withoutSkip = (a: Answers): Answers => ({ ...a, _skipped: (a._skipped ?? []).filter((id) => id !== q.id) });

  const onNext = async () => {
    if (!q.required && isEmptyValue(value)) return skip(); // nothing entered: same as skipping
    const error = validateAnswer(q, value, answers);
    if (error) return setErrorCode(error);
    await commit(withoutSkip(answers));
  };

  const skip = () => {
    const rest = { ...answers };
    delete rest[q.id];
    return commit({ ...rest, _skipped: [...new Set([...(answers._skipped ?? []), q.id])] });
  };

  const skipAll = () => commit(skipAllOptional({ ...answers, [q.id]: value }), 'forward');

  // "Finish" when no later question is open and nothing else required is missing.
  const isLast =
    shown.slice(index + 1).every((x) => isDone(x, answers)) &&
    shown.every((x) => x.id === q.id || !x.required || isDone(x, answers));

  return (
    <div>
      <div className="mb-6">
        <div
          role="progressbar"
          aria-label={tUi('progressLabel')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={tUi('questionOf', { current: index + 1, total: stats.total })}
          className="h-2 w-full overflow-hidden rounded-full bg-surface-strong"
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 flex flex-wrap justify-between gap-2 text-sm font-medium text-muted">
          <span>{tUi('questionOf', { current: index + 1, total: stats.total })}</span>
          <span>{tUi('requiredLeft', { count: stats.requiredLeft })}</span>
        </p>
      </div>

      <h2 id="question-title" ref={titleRef} tabIndex={-1} className="text-2xl font-semibold text-text outline-none">
        {t(`q.${q.id}.title` as never)}
      </h2>
      {!q.required && <p className="mt-1 text-sm font-medium text-muted">{tUi('optional')}</p>}
      {t.has(`q.${q.id}.hint` as never) && <p className="mt-2 text-muted">{t(`q.${q.id}.hint` as never)}</p>}

      <div className="mt-6">
        <QuestionView
          key={q.id}
          q={q}
          value={value}
          answers={answers}
          onChange={(v) => {
            setAnswers((a) => ({ ...a, [q.id]: v }));
            setErrorCode(null);
          }}
        />
      </div>

      {errorCode && (
        <p role="alert" className="mt-4 font-medium text-danger">
          {t(`errors.${errorCode}` as never)}
        </p>
      )}
      {saveError && (
        <p role="alert" className="mt-4 font-medium text-danger">
          {tUi('saveFailed')}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {index > 0 && (
          <button type="button" disabled={busy} onClick={() => go(shown[index - 1].id)} className={secondaryButton}>
            {tUi('back')}
          </button>
        )}
        <button type="button" disabled={busy} onClick={onNext} className={primaryButton}>
          {busy ? tUi('saving') : isLast ? tUi('finish') : tUi('next')}
        </button>
        {!q.required && (
          <button type="button" disabled={busy} onClick={skip} className={secondaryButton}>
            {tUi('skip')}
          </button>
        )}
      </div>

      {!q.required && (
        <p className="mt-4">
          <button type="button" disabled={busy} onClick={skipAll} className="text-sm font-medium text-accent-text underline underline-offset-4">
            {tUi('skipAll')}
          </button>
        </p>
      )}

      <p className="mt-8">
        <button type="button" onClick={onExit} className="text-sm text-muted underline underline-offset-4">
          {tUi('saveAndExit')}
        </button>
      </p>
    </div>
  );
}
