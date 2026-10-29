'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import {
  firstOpenPage,
  pageAfter,
  pageErrors,
  progress,
  pruneAnswers,
  submitPage,
  visiblePages,
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
  const [finishedNow, setFinishedNow] = useState(false);

  // Finishing an attempt that was continued shows the same end screen as a new one (it used to drop back to the list,
  // which looked as if the "Finish" button did nothing).
  if (finishedNow) return <Done onAgain={onStart} />;
  if (continuing) return <Runner attempt={continuing} onDone={() => setFinishedNow(true)} onExit={onChanged} />;

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
  const [pageId, setPageId] = useState<string>(() => firstOpenPage(attempt.answers ?? {}));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState(false);
  const [busy, setBusy] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // The questions of one topic share a screen; which ones are shown changes as the answers change (for example the level).
  const pages = visiblePages(answers);
  const index = Math.max(0, pages.findIndex((p) => p.id === pageId));
  const page = pages[index];
  const stats = progress(answers);
  const percent = Math.round(((index + 1) / Math.max(1, pages.length)) * 100);
  const isLast = index === pages.length - 1;

  const go = (id: string) => {
    setPageId(id);
    setErrors({});
  };

  // A new page starts at its title. The screen is as long as the old page was, so without this a phone stays at the
  // bottom ("Next" was pressed there) and shows the end of the new page. Not on the first screen (no jump on opening).
  const opened = useRef(false);
  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      return;
    }
    const title = titleRef.current;
    if (!title) return;
    title.focus({ preventScroll: true });
    // Android moves the page while the new one is drawn and the browser bar slides in or out, so the position is set
    // again a few times until the layout has settled.
    const toTitle = () => titleRef.current?.scrollIntoView({ block: 'start' });
    toTitle();
    const frame = requestAnimationFrame(toTitle);
    const timers = [120, 350, 700].map((ms) => window.setTimeout(toTitle, ms));
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
  }, [pageId]);

  /** Checks the page, saves, then moves on (or finishes when it was the last page and nothing is missing). */
  const onNext = async () => {
    const found = pageErrors(page, answers);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      document.getElementById(`q-${Object.keys(found)[0]}-title`)?.scrollIntoView({ block: 'start' });
      return;
    }
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const next = submitPage(page, answers);
    setBusy(true);
    setSaveError(false);
    try {
      const step = pageAfter(next, page.id);
      if (step.kind === 'finish') {
        const ok = await completeAttempt(supabase, attempt.id, pruneAnswers(next));
        if (!ok) throw new Error('attempt is frozen');
        onDone();
        return;
      }
      if (step.kind === 'stuck') throw new Error('nothing left to ask, but the survey is not complete');
      if (!(await saveAnswers(supabase, attempt.id, next))) throw new Error('attempt is frozen');
      setAnswers(next);
      go(step.id);
    } catch (error) {
      console.error('[survey] save failed', error);
      setSaveError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div
          role="progressbar"
          aria-label={tUi('progressLabel')}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={tUi('pageOf', { current: index + 1, total: pages.length })}
          className="h-2 w-full overflow-hidden rounded-full bg-surface-strong"
        >
          <div className="h-full rounded-full bg-accent" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 flex flex-wrap justify-between gap-2 text-sm font-medium text-muted">
          <span>{tUi('pageOf', { current: index + 1, total: pages.length })}</span>
          <span>{tUi('requiredLeft', { count: stats.requiredLeft })}</span>
        </p>
      </div>

      <h2 id="page-title" ref={titleRef} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold text-text outline-none">
        {t(`pages.${page.id}` as never)}
      </h2>

      <div className="mt-6 space-y-8">
        {page.questions.map((q) => {
          const titleId = `q-${q.id}-title`;
          return (
            <section key={q.id} aria-labelledby={titleId}>
              <h3 id={titleId} className="scroll-mt-24 text-lg font-semibold text-text">
                {t(`q.${q.id}.title` as never)}
              </h3>
              {!q.required && <p className="text-sm font-medium text-muted">{tUi('optional')}</p>}
              {t.has(`q.${q.id}.hint` as never) && <p className="mt-1 text-muted">{t(`q.${q.id}.hint` as never)}</p>}
              <div className="mt-3">
                <QuestionView
                  q={q}
                  value={answers[q.id]}
                  answers={answers}
                  titleId={titleId}
                  onChange={(v) => {
                    setAnswers((a) => ({ ...a, [q.id]: v }));
                    setErrors((e) => {
                      const { [q.id]: _gone, ...rest } = e;
                      void _gone;
                      return rest;
                    });
                  }}
                />
              </div>
              {errors[q.id] && (
                <p role="alert" className="mt-2 text-sm font-medium text-danger">
                  {t(`errors.${errors[q.id]}` as never)}
                </p>
              )}
            </section>
          );
        })}
      </div>

      {saveError && (
        <p role="alert" className="mt-4 font-medium text-danger">
          {tUi('saveFailed')}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {index > 0 && (
          <button type="button" disabled={busy} onClick={() => go(pages[index - 1].id)} className={secondaryButton}>
            {tUi('back')}
          </button>
        )}
        <button type="button" disabled={busy} onClick={onNext} className={primaryButton}>
          {busy ? tUi('saving') : isLast ? tUi('finish') : tUi('next')}
        </button>
      </div>

      <p className="mt-8">
        <button type="button" onClick={onExit} className="text-sm text-muted underline underline-offset-4">
          {tUi('saveAndExit')}
        </button>
      </p>
    </div>
  );
}
