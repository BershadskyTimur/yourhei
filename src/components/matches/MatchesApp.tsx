'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { TypeDot } from '@/components/TypeDot';
import { primaryButton, secondaryButton } from '@/components/forms/ui';
import { Link, useRouter } from '@/i18n/navigation';
import { pickLocalized } from '@/lib/institutions/localized';
import { buildMatchInput } from '@/lib/matching/input';
import { matchPrograms } from '@/lib/matching/engine';
import { loadMatchData } from '@/lib/matching/load';
import type { ComponentId, CountryFacts, Group, MatchProgram, MatchResult, Matches, Note, Rates } from '@/lib/matching/types';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { listAttempts, type Attempt } from '@/lib/survey/store';

type State =
  | { kind: 'loading' }
  | { kind: 'failed' }
  | { kind: 'no-survey' }
  | { kind: 'ready'; attempt: Attempt; programs: MatchProgram[]; countries: Record<string, CountryFacts>; rates: Rates; ratesSource: string; profile: { residence: string | null; citizenships: string[]; countries: string[]; types: string[] } };

const GROUPS: Group[] = ['safe', 'suitable', 'ambitious'];

export function MatchesApp() {
  const t = useTranslations('Matches');
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: 'loading' });

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
          router.replace('/login?next=%2Fmatches');
          return;
        }
        const [attempts, profileRow, data2, ratesRes] = await Promise.all([
          listAttempts(supabase),
          supabase.from('profiles').select('residence_country, citizenships, target_countries, target_types').eq('id', data.user.id).maybeSingle(),
          loadMatchData(supabase),
          fetch('/api/rates').then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ]);
        const attempt = attempts.find((a) => a.status === 'completed'); // newest first
        if (!attempt) {
          setState({ kind: 'no-survey' });
          return;
        }
        const p = (profileRow.data ?? {}) as Record<string, unknown>;
        setState({
          kind: 'ready',
          attempt,
          programs: data2.programs,
          countries: data2.countries,
          rates: (ratesRes?.rates as Rates) ?? { USD: 1 },
          ratesSource: ratesRes?.source ?? 'none',
          profile: {
            residence: (p.residence_country as string) ?? null,
            citizenships: (p.citizenships as string[]) ?? [],
            countries: (p.target_countries as string[]) ?? [],
            types: (p.target_types as string[]) ?? [],
          },
        });
      } catch (error) {
        console.error('[matches] could not load', error);
        setState({ kind: 'failed' });
      }
    })();
  }, [router]);

  if (state.kind === 'loading') return <p className="text-muted">{t('loading')}</p>;
  if (state.kind === 'failed') {
    return <p role="alert" className="rounded-xl border border-danger p-4 font-medium text-danger">{t('failed')}</p>;
  }
  if (state.kind === 'no-survey') {
    return (
      <section className="rounded-2xl border border-line-strong bg-accent-soft p-6">
        <h2 className="text-xl font-semibold text-text">{t('noSurvey.title')}</h2>
        <p className="mt-2">{t('noSurvey.text')}</p>
        <Link href="/survey" className={`${primaryButton} mt-4`}>{t('noSurvey.cta')}</Link>
      </section>
    );
  }
  return <Results {...state} />;
}

function Results({ attempt, programs, countries, rates, ratesSource, profile }: Extract<State, { kind: 'ready' }>) {
  const t = useTranslations('Matches');
  const tCmp = useTranslations('Compare');
  const locale = useLocale();
  const [compare, setCompare] = useState<string[]>([]);
  const toggleCompare = (id: string) => setCompare((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= 3 ? cur : [...cur, id]));

  const matches: Matches = useMemo(
    () => matchPrograms(programs, buildMatchInput(attempt.answers, profile), { countries, rates }),
    [attempt, programs, countries, rates, profile],
  );
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(attempt.completed_at ?? attempt.updated_at));
  const total = matches.safe.length + matches.suitable.length + matches.ambitious.length;

  return (
    <div className="space-y-10">
      <p className="text-lg">{t('basedOn', { date })}</p>

      {programs.length === 0 ? (
        <section className="rounded-2xl border border-line-strong bg-accent-soft p-6">
          <h2 className="text-xl font-semibold text-text">{t('noData.title')}</h2>
          <p className="mt-2">{t('noData.text')}</p>
        </section>
      ) : (
        <p className="text-muted">{t('summary', { checked: matches.checked, passed: matches.passed })}</p>
      )}

      {programs.length > 0 && total === 0 && (
        <section className="rounded-2xl border border-line bg-surface p-6">
          <h2 className="text-xl font-semibold text-text">{t('nothing.title')}</h2>
          <p className="mt-2">{t('nothing.text')}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/profile" className={secondaryButton}>{t('nothing.profile')}</Link>
            <Link href="/survey" className={secondaryButton}>{t('nothing.survey')}</Link>
          </div>
        </section>
      )}

      {GROUPS.map((g) =>
        matches[g].length === 0 ? null : (
          <section key={g} aria-labelledby={`group-${g}`}>
            <h2 id={`group-${g}`} className="text-2xl font-semibold text-text">{t(`groups.${g}.title`)}</h2>
            <p className="mt-1 text-muted">{t(`groups.${g}.text`)}</p>
            <ul className="mt-4 space-y-4">
              {matches[g].map((r) => (
                <li key={r.program.id}><ResultCard result={r} selected={compare.includes(r.program.id)} full={compare.length >= 3} onToggle={() => toggleCompare(r.program.id)} /></li>
              ))}
            </ul>
          </section>
        ),
      )}

      <div className="flex flex-wrap gap-3 border-t border-line pt-6">
        <Link href="/survey" className={secondaryButton}>{t('retake')}</Link>
        <Link href="/profile" className={secondaryButton}>{t('editProfile')}</Link>
      </div>
      {compare.length > 0 && (
        <div className="sticky bottom-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line-strong bg-bg p-3" role="region" aria-label={tCmp('title')}>
          <span className="font-medium">{tCmp('bar', { count: compare.length })}</span>
          <span className="flex gap-2">
            <button type="button" onClick={() => setCompare([])} className={secondaryButton}>{tCmp('clear')}</button>
            {compare.length >= 2 ? (
              <Link href={{ pathname: '/compare', query: { ids: compare.join(',') } }} className={primaryButton}>{tCmp('open')}</Link>
            ) : (
              <span className="self-center text-sm text-muted">{tCmp('needTwo')}</span>
            )}
          </span>
        </div>
      )}
      <p className="text-xs text-muted">
        {ratesSource === 'live' ? t('credits.live') : t('credits.fallback')}{' '}
        <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="underline">ExchangeRate-API</a>
      </p>
    </div>
  );
}

function ResultCard({ result, selected, full, onToggle }: { result: MatchResult; selected: boolean; full: boolean; onToggle: () => void }) {
  const t = useTranslations('Matches');
  const tCmp = useTranslations('Compare');
  const locale = useLocale();
  const { program, score, why, gaps, missing, tuitionShown } = result;
  const inst = program.institution;
  const name = pickLocalized(program.names, locale).text;
  const instName = pickLocalized(inst.names, locale).text;
  const city = pickLocalized(inst.city, locale).text;
  const country = new Intl.DisplayNames([locale], { type: 'region' }).of(inst.country) ?? inst.country;
  const money = (amount: number, currency: string) =>
    new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  const langNames = (() => {
    try {
      const names = new Intl.DisplayNames([locale], { type: 'language' });
      return program.languages.map((l) => names.of(l) ?? l).join(', ');
    } catch {
      return program.languages.join(', ');
    }
  })();

  const note = (n: Note) => t(`notes.${n.key}` as never, n.params as never);

  return (
    <article className="rounded-2xl border border-line bg-surface p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full bg-accent text-on-accent" aria-label={t('card.score', { score: Math.round(score) })}>
          <span className="text-xl font-bold leading-none">{Math.round(score)}</span>
          <span className="text-[10px] uppercase">/100</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold leading-snug text-text">{name || instName}</h3>
          <p className="mt-0.5 flex items-center gap-2 text-text">
            <TypeDot type={inst.type} size={20} />
            <Link href={`/institutions/${inst.country.toLowerCase()}/${inst.slug}`} className="font-medium underline-offset-4 hover:underline">
              {instName}
            </Link>
          </p>
          <p className="text-sm text-muted">{[city, country].filter(Boolean).join(', ')}</p>
        </div>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        {langNames && (<div><dt className="inline text-muted">{t('card.languages')}: </dt><dd className="inline">{langNames}</dd></div>)}
        {program.durationYears !== null && (<div><dt className="inline text-muted">{t('card.duration')}: </dt><dd className="inline">{t('card.years', { count: program.durationYears })}</dd></div>)}
        <div>
          <dt className="inline text-muted">{t('card.tuition')}: </dt>
          <dd className="inline">
            {tuitionShown ? (tuitionShown.amount === 0 ? t('card.free') : `≈ ${money(tuitionShown.amount, tuitionShown.currency)} / ${t('card.perYear')}`) : t('card.tuitionUnknown')}
          </dd>
        </div>
      </dl>

      {why.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-brand">{t('card.why')}</h4>
          <ul className="mt-1 space-y-1 text-sm">
            {why.map((n, i) => (<li key={i} className="flex gap-2"><span aria-hidden="true">✓</span><span>{note(n)}</span></li>))}
          </ul>
        </div>
      )}

      {gaps.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-semibold text-brand">{t('card.gaps')}</h4>
          <ul className="mt-1 space-y-1 text-sm">
            {gaps.map((n, i) => (<li key={i} className="flex gap-2"><span aria-hidden="true">!</span><span>{note(n)}</span></li>))}
          </ul>
        </div>
      )}

      {missing.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          {t('card.noData')}: {missing.map((id: ComponentId) => t(`components.${id}`)).join(', ')}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {program.applicationUrl && (
          <a href={program.applicationUrl} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} !h-10`}>
            {t('card.apply')}
          </a>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={selected}
          disabled={!selected && full}
          title={!selected && full ? tCmp('max') : undefined}
          className={`${secondaryButton} !h-10 ${selected ? 'border-accent bg-accent-soft' : ''}`}
        >
          {selected ? tCmp('remove') : tCmp('add')}
        </button>
      </div>
    </article>
  );
}
