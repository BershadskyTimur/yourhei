'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo, type ReactNode } from 'react';
import { EDUCATION_LEVELS, PRIORITIES_COUNT, PRIORITY_OPTIONS, type Question } from '@/lib/survey/config';
import { intakeOptions, type Answers } from '@/lib/survey/engine';
import {
  CERTIFICATES,
  COMMON_LANGUAGES,
  CURRENCIES,
  EXAMS,
  GRADING_SYSTEMS,
  LANGUAGE_CODES,
  OLYMPIAD_LEVELS,
  SCHOOL_PROFILES,
  SELF_LEVELS,
  SUBJECTS,
  iscedEntry,
  labelFor,
} from '@/lib/survey/references';
import { RIASEC_STATEMENTS, isRiasecComplete, riasecScores, riasecSuggestions } from '@/lib/survey/riasec';
import { Chip, inputClass, secondaryButton } from '../forms/ui';
import { SpecialtyPicker } from './SpecialtyPicker';

type V = unknown;
interface Props {
  q: Question;
  value: V;
  answers: Answers;
  onChange: (value: V) => void;
}

const asRecord = (v: V): Record<string, unknown> => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {});
const asArray = <T,>(v: V): T[] => (Array.isArray(v) ? (v as T[]) : []);
const numberOrNull = (s: string): number | null => (s.trim() === '' || Number.isNaN(Number(s)) ? null : Number(s));
const textOf = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

function useLanguageList() {
  const locale = useLocale();
  return useMemo(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale], { type: 'language' });
    } catch {
      names = null;
    }
    const collator = new Intl.Collator(locale);
    const label = (code: string) => {
      try {
        return names?.of(code) ?? code;
      } catch {
        return code;
      }
    };
    const all = LANGUAGE_CODES.map((code) => ({ code, name: label(code) }));
    const common = COMMON_LANGUAGES.map((c) => all.find((x) => x.code === c)!).filter(Boolean);
    const rest = all.filter((x) => !COMMON_LANGUAGES.includes(x.code)).sort((a, b) => collator.compare(a.name, b.name));
    return { list: [...common, ...rest], label };
  }, [locale]);
}

function LanguageSelect({ id, value, onChange, exclude = [] }: { id: string; value: string; onChange: (code: string) => void; exclude?: string[] }) {
  const t = useTranslations('Survey.ui');
  const { list } = useLanguageList();
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
      <option value="">{t('choose')}</option>
      {list
        .filter((l) => l.code === value || !exclude.includes(l.code))
        .map((l) => (
          <option key={l.code} value={l.code}>
            {l.name}
          </option>
        ))}
    </select>
  );
}

function SmallLabel({ htmlFor, children }: { htmlFor: string; children: ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-text">
      {children}
    </label>
  );
}

/** A list of rows the person can add to and remove from. */
function Rows<T>({
  rows,
  onChange,
  max,
  blank,
  addLabel,
  render,
}: {
  rows: T[];
  onChange: (next: T[]) => void;
  max: number;
  blank: () => T;
  addLabel: string;
  render: (row: T, update: (patch: Partial<T>) => void, index: number) => ReactNode;
}) {
  const t = useTranslations('Survey.ui');
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="rounded-2xl border border-line bg-surface p-4">
          <div className="grid gap-3 sm:grid-cols-2">{render(row, (patch) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r))), i)}</div>
          <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))} className="mt-3 text-sm font-medium text-accent-text underline underline-offset-4">
            {t('remove')}
          </button>
        </div>
      ))}
      {rows.length < max && (
        <button type="button" onClick={() => onChange([...rows, blank()])} className={secondaryButton}>
          + {addLabel}
        </button>
      )}
    </div>
  );
}

/** Draws the input for one question according to its type. */
export function QuestionView({ q, value, answers, onChange }: Props) {
  const t = useTranslations('Survey');
  const tUi = useTranslations('Survey.ui');
  const locale = useLocale();
  const { label: languageName } = useLanguageList();

  const optionLabel = (v: string): string =>
    q.id === 'school_profile'
      ? labelFor(SCHOOL_PROFILES.find((p) => p.id === v)!.label, locale)
      : t(`q.${q.id}.options.${v}` as never);

  switch (q.type) {
    case 'single':
      return (
        <div role="radiogroup" aria-labelledby="question-title" className="grid gap-2 sm:grid-cols-2">
          {q.options!.map((o) => (
            <label key={o} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 ${value === o ? 'border-accent bg-accent-soft' : 'border-line-strong bg-bg'}`}>
              <input type="radio" name={q.id} checked={value === o} onChange={() => onChange(o)} className="h-5 w-5 accent-accent" />
              <span>{optionLabel(o)}</span>
            </label>
          ))}
        </div>
      );

    case 'multi': {
      const chosen = asArray<string>(value);
      return (
        <div className="flex flex-wrap gap-2">
          {q.options!.map((o) => (
            <Chip key={o} pressed={chosen.includes(o)} onClick={() => onChange(chosen.includes(o) ? chosen.filter((c) => c !== o) : [...chosen, o])}>
              {optionLabel(o)}
            </Chip>
          ))}
        </div>
      );
    }

    case 'number':
      return (
        <div className="max-w-xs">
          <label htmlFor="q-number" className="sr-only">{t(`q.${q.id}.title` as never)}</label>
          <input
            id="q-number"
            type="number"
            inputMode="numeric"
            min={q.min}
            max={q.max}
            value={textOf(value)}
            onChange={(e) => onChange(numberOrNull(e.target.value))}
            className={inputClass}
          />
          <p className="mt-1 text-sm text-muted">{tUi('range', { min: q.min ?? 0, max: q.max ?? 0 })}</p>
        </div>
      );

    case 'text':
      return (
        <div>
          <label htmlFor="q-text" className="sr-only">{t(`q.${q.id}.title` as never)}</label>
          <textarea id="q-text" rows={3} maxLength={500} value={textOf(value)} onChange={(e) => onChange(e.target.value)} className={`${inputClass} !h-auto py-2`} />
        </div>
      );

    case 'intake': {
      const fmt = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
      return (
        <div role="radiogroup" aria-labelledby="question-title" className="grid gap-2 sm:grid-cols-2">
          {intakeOptions().map((o) => {
            const [y, m] = o.split('-').map(Number);
            return (
              <label key={o} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 ${value === o ? 'border-accent bg-accent-soft' : 'border-line-strong bg-bg'}`}>
                <input type="radio" name={q.id} checked={value === o} onChange={() => onChange(o)} className="h-5 w-5 accent-accent" />
                <span>{fmt.format(new Date(y, m - 1, 1))}</span>
              </label>
            );
          })}
        </div>
      );
    }

    case 'specialty':
      return <SpecialtyPicker value={asArray<string>(value)} onChange={onChange} max={q.max ?? 1} />;

    case 'education': {
      const v = asRecord(value);
      return (
        <div className="grid max-w-xl gap-4 sm:grid-cols-2">
          <div>
            <SmallLabel htmlFor="edu-level">{t('education.level')}</SmallLabel>
            <select id="edu-level" value={textOf(v.level)} onChange={(e) => onChange({ ...v, level: e.target.value })} className={inputClass}>
              <option value="">{tUi('choose')}</option>
              {EDUCATION_LEVELS.map((l) => (
                <option key={l} value={l}>{t(`education.levels.${l}` as never)}</option>
              ))}
            </select>
          </div>
          <div>
            <SmallLabel htmlFor="edu-year">{t('education.year')}</SmallLabel>
            <input id="edu-year" type="number" inputMode="numeric" value={textOf(v.year)} onChange={(e) => onChange({ ...v, year: numberOrNull(e.target.value) })} className={inputClass} />
          </div>
        </div>
      );
    }

    case 'grade': {
      const v = asRecord(value);
      const system = GRADING_SYSTEMS.find((s) => s.id === v.system);
      const none = v.none === true;
      return (
        <div className="max-w-xl space-y-4">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={none} onChange={(e) => onChange(e.target.checked ? { none: true } : {})} className="h-5 w-5 accent-accent" />
            {t('grade.none')}
          </label>
          {!none && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <SmallLabel htmlFor="grade-system">{t('grade.system')}</SmallLabel>
                <select id="grade-system" value={textOf(v.system)} onChange={(e) => onChange({ system: e.target.value, value: v.value ?? null })} className={inputClass}>
                  <option value="">{tUi('choose')}</option>
                  {GRADING_SYSTEMS.map((s) => (
                    <option key={s.id} value={s.id}>{labelFor(s.label, locale)}</option>
                  ))}
                </select>
              </div>
              <div>
                <SmallLabel htmlFor="grade-value">{t('grade.value')}</SmallLabel>
                <input
                  id="grade-value"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  value={textOf(v.value)}
                  onChange={(e) => onChange({ ...v, value: numberOrNull(e.target.value) })}
                  className={inputClass}
                />
                {system && <p className="mt-1 text-sm text-muted">{t('grade.range', { min: system.min, max: system.max })}</p>}
              </div>
            </div>
          )}
          <p className="text-sm text-muted">{tUi('approximate')}</p>
        </div>
      );
    }

    case 'subjects':
      return (
        <Rows
          rows={asArray<{ subject: string; grade: number | null }>(value)}
          onChange={onChange}
          max={q.max ?? 5}
          blank={() => ({ subject: '', grade: null })}
          addLabel={tUi('add')}
          render={(row, update, i) => (
            <>
              <div>
                <SmallLabel htmlFor={`subj-${i}`}>{t('subjects.subject')}</SmallLabel>
                <select id={`subj-${i}`} value={row.subject} onChange={(e) => update({ subject: e.target.value })} className={inputClass}>
                  <option value="">{tUi('choose')}</option>
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>{labelFor(s.label, locale)}</option>
                  ))}
                </select>
              </div>
              <div>
                <SmallLabel htmlFor={`subj-g-${i}`}>{t('subjects.grade')}</SmallLabel>
                <input id={`subj-g-${i}`} type="number" inputMode="decimal" step="any" value={textOf(row.grade)} onChange={(e) => update({ grade: numberOrNull(e.target.value) })} className={inputClass} />
              </div>
            </>
          )}
        />
      );

    case 'exams':
      return (
        <Rows
          rows={asArray<{ exam: string; score: number | null }>(value)}
          onChange={onChange}
          max={q.max ?? 6}
          blank={() => ({ exam: '', score: null })}
          addLabel={tUi('add')}
          render={(row, update, i) => {
            const exam = EXAMS.find((e) => e.id === row.exam);
            return (
              <>
                <div>
                  <SmallLabel htmlFor={`exam-${i}`}>{t('exams.exam')}</SmallLabel>
                  <select id={`exam-${i}`} value={row.exam} onChange={(e) => update({ exam: e.target.value })} className={inputClass}>
                    <option value="">{tUi('choose')}</option>
                    {EXAMS.map((e) => (
                      <option key={e.id} value={e.id}>{labelFor(e.label, locale)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <SmallLabel htmlFor={`exam-s-${i}`}>{t('exams.score')}</SmallLabel>
                  <input id={`exam-s-${i}`} type="number" inputMode="decimal" step="any" value={textOf(row.score)} onChange={(e) => update({ score: numberOrNull(e.target.value) })} className={inputClass} />
                  {exam && <p className="mt-1 text-sm text-muted">{t('exams.range', { min: exam.min, max: exam.max })}</p>}
                </div>
              </>
            );
          }}
        />
      );

    case 'languages': {
      type Row = { lang: string; level: string; cert?: { id: string; value: string | number | null } | null };
      const rows = asArray<Row>(value);
      return (
        <Rows<Row>
          rows={rows}
          onChange={onChange}
          max={q.max ?? 8}
          blank={() => ({ lang: '', level: '' })}
          addLabel={t('languages.addLanguage')}
          render={(row, update, i) => {
            const cert = row.cert ? CERTIFICATES.find((c) => c.id === row.cert!.id) : undefined;
            return (
              <>
                <div>
                  <SmallLabel htmlFor={`lang-${i}`}>{t('languages.language')}</SmallLabel>
                  <LanguageSelect id={`lang-${i}`} value={row.lang} onChange={(lang) => update({ lang })} exclude={rows.map((r) => r.lang)} />
                </div>
                <div>
                  <SmallLabel htmlFor={`lang-l-${i}`}>{t('languages.level')}</SmallLabel>
                  <select id={`lang-l-${i}`} value={row.level} onChange={(e) => update({ level: e.target.value })} className={inputClass}>
                    <option value="">{tUi('choose')}</option>
                    {SELF_LEVELS.map((l) => (
                      <option key={l} value={l}>{t(`selfLevels.${l}` as never)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <SmallLabel htmlFor={`lang-c-${i}`}>{t('languages.certificate')}</SmallLabel>
                  <select
                    id={`lang-c-${i}`}
                    value={row.cert?.id ?? ''}
                    onChange={(e) => update({ cert: e.target.value ? { id: e.target.value, value: null } : null })}
                    className={inputClass}
                  >
                    <option value="">{t('languages.none')}</option>
                    {CERTIFICATES.map((c) => (
                      <option key={c.id} value={c.id}>{labelFor(c.label, locale)}</option>
                    ))}
                  </select>
                </div>
                {cert && row.cert && (
                  <div>
                    <SmallLabel htmlFor={`lang-cv-${i}`}>{t('languages.certValue')}</SmallLabel>
                    {cert.levels ? (
                      <select id={`lang-cv-${i}`} value={textOf(row.cert.value)} onChange={(e) => update({ cert: { id: cert.id, value: e.target.value } })} className={inputClass}>
                        <option value="">{tUi('choose')}</option>
                        {cert.levels.map(([lv]) => (
                          <option key={lv} value={lv}>{lv}</option>
                        ))}
                      </select>
                    ) : (
                      <input id={`lang-cv-${i}`} type="number" inputMode="decimal" step="any" value={textOf(row.cert.value)} onChange={(e) => update({ cert: { id: cert.id, value: numberOrNull(e.target.value) } })} className={inputClass} />
                    )}
                  </div>
                )}
              </>
            );
          }}
        />
      );
    }

    case 'studyLanguages': {
      const v = asRecord(value);
      const langs = asArray<string>(v.languages);
      return (
        <div className="space-y-5">
          <div>
            <p className="mb-2 font-semibold">{t('studyLanguages.languages')}</p>
            {langs.length > 0 && (
              <ul className="mb-3 flex flex-wrap gap-2">
                {langs.map((code) => (
                  <li key={code}>
                    <button type="button" onClick={() => onChange({ ...v, languages: langs.filter((c) => c !== code) })} aria-label={`${tUi('remove')}: ${languageName(code)}`} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line-strong bg-accent-soft px-3 text-sm">
                      {languageName(code)} <span aria-hidden="true">✕</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <label htmlFor="study-lang-add" className="sr-only">{tUi('add')}</label>
            <LanguageSelect id="study-lang-add" value="" exclude={langs} onChange={(code) => code && onChange({ ...v, languages: [...langs, code] })} />
          </div>
          <div role="radiogroup" aria-label={t('studyLanguages.prepYear')}>
            <p className="mb-2 font-semibold">{t('studyLanguages.prepYear')}</p>
            <div className="flex gap-6">
              {[true, false].map((b) => (
                <label key={String(b)} className="inline-flex min-h-10 items-center gap-2">
                  <input type="radio" name="prep" checked={v.prepYear === b} onChange={() => onChange({ ...v, languages: langs, prepYear: b })} className="h-5 w-5 accent-accent" />
                  {b ? t('studyLanguages.yes') : t('studyLanguages.no')}
                </label>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'budget': {
      const v = asRecord(value);
      const needsTuition = answers.funding !== 'free';
      const set = (patch: Record<string, unknown>) => onChange({ currency: 'EUR', tuition: null, living: null, ...v, ...patch });
      return (
        <div className="grid max-w-xl gap-4 sm:grid-cols-3">
          <div>
            <SmallLabel htmlFor="budget-currency">{t('budget.currency')}</SmallLabel>
            <select id="budget-currency" value={textOf(v.currency)} onChange={(e) => set({ currency: e.target.value })} className={inputClass}>
              <option value="">{tUi('choose')}</option>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {needsTuition && (
            <div>
              <SmallLabel htmlFor="budget-tuition">{t('budget.tuition')}</SmallLabel>
              <input id="budget-tuition" type="number" inputMode="decimal" min={0} value={textOf(v.tuition)} onChange={(e) => set({ tuition: numberOrNull(e.target.value) })} className={inputClass} />
            </div>
          )}
          <div>
            <SmallLabel htmlFor="budget-living">{t('budget.living')}</SmallLabel>
            <input id="budget-living" type="number" inputMode="decimal" min={0} value={textOf(v.living)} onChange={(e) => set({ living: numberOrNull(e.target.value) })} className={inputClass} />
          </div>
        </div>
      );
    }

    case 'olympiads':
      return (
        <Rows
          rows={asArray<{ subject: string; level: string; place: number | null }>(value)}
          onChange={onChange}
          max={q.max ?? 5}
          blank={() => ({ subject: '', level: '', place: null })}
          addLabel={tUi('add')}
          render={(row, update, i) => (
            <>
              <div>
                <SmallLabel htmlFor={`ol-s-${i}`}>{t('olympiads.subject')}</SmallLabel>
                <select id={`ol-s-${i}`} value={row.subject} onChange={(e) => update({ subject: e.target.value })} className={inputClass}>
                  <option value="">{tUi('choose')}</option>
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>{labelFor(s.label, locale)}</option>
                  ))}
                </select>
              </div>
              <div>
                <SmallLabel htmlFor={`ol-l-${i}`}>{t('olympiads.level')}</SmallLabel>
                <select id={`ol-l-${i}`} value={row.level} onChange={(e) => update({ level: e.target.value })} className={inputClass}>
                  <option value="">{tUi('choose')}</option>
                  {OLYMPIAD_LEVELS.map((l) => (
                    <option key={l} value={l}>{t(`olympiadLevels.${l}` as never)}</option>
                  ))}
                </select>
              </div>
              <div>
                <SmallLabel htmlFor={`ol-p-${i}`}>{t('olympiads.place')}</SmallLabel>
                <input id={`ol-p-${i}`} type="number" inputMode="numeric" min={1} value={textOf(row.place)} onChange={(e) => update({ place: numberOrNull(e.target.value) })} className={inputClass} />
              </div>
            </>
          )}
        />
      );

    case 'riasec': {
      const v = asRecord(value);
      const given = asArray<number | null>(v.answers);
      const answersList = RIASEC_STATEMENTS.map((_, i) => (typeof given[i] === 'number' ? (given[i] as number) : null));
      const complete = isRiasecComplete(answersList);
      const suggestions = complete ? riasecSuggestions(riasecScores(answersList)) : [];
      const accepted = asArray<string>(v.accepted);
      const setAnswer = (i: number, n: number) => {
        const next = answersList.map((a, j) => (j === i ? n : a));
        if (!isRiasecComplete(next)) return onChange({ answers: next, accepted: [] });
        // When the last statement is answered, all suggestions are accepted at first;
        // later changes keep the choices that are still suggested.
        const suggested = riasecSuggestions(riasecScores(next));
        const kept = accepted.filter((c) => suggested.includes(c));
        onChange({ answers: next, accepted: complete && kept.length > 0 ? kept : suggested });
      };
      return (
        <div className="space-y-6">
          <p className="text-muted">{t('riasec.intro')}</p>
          <ol className="space-y-4">
            {RIASEC_STATEMENTS.map((_, i) => (
              <li key={i} className="rounded-2xl border border-line bg-surface p-4">
                <p id={`riasec-${i}`} className="font-medium">{i + 1}. {t(`riasec.items.${i}` as never)}</p>
                <div role="radiogroup" aria-labelledby={`riasec-${i}`} className="mt-3 flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label key={n} className={`flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full border px-3 text-sm ${answersList[i] === n ? 'border-accent bg-accent text-on-accent' : 'border-line-strong bg-bg'}`}>
                      <input type="radio" name={`riasec-${i}`} value={n} checked={answersList[i] === n} onChange={() => setAnswer(i, n)} className="sr-only" />
                      <span aria-hidden="true">{n}</span>
                      <span className="sr-only">{n} — {t(`riasec.scale.${n}` as never)}</span>
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted">1 — {t('riasec.scale.1')} · 5 — {t('riasec.scale.5')}</p>
          {complete ? (
            <div>
              <h3 className="text-lg font-semibold text-text">{t('riasec.suggestions')}</h3>
              <p className="mb-2 text-sm text-muted">{t('riasec.suggestionsHint')}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((code) => (
                  <Chip key={code} pressed={accepted.includes(code)} onClick={() => onChange({ answers: answersList, accepted: accepted.includes(code) ? accepted.filter((c) => c !== code) : [...accepted, code] })}>
                    {(iscedEntry(code) as unknown as Record<string, string>)?.[locale] ?? iscedEntry(code)?.en ?? code}
                  </Chip>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">{t('riasec.answerAll')}</p>
          )}
        </div>
      );
    }

    case 'priorities': {
      const chosen = asArray<string>(value);
      const full = chosen.length >= PRIORITIES_COUNT;
      return (
        <div>
          <p className="mb-3 text-sm text-muted">{tUi('counter', { chosen: chosen.length, count: PRIORITIES_COUNT })}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PRIORITY_OPTIONS.map((o) => {
              const on = chosen.includes(o);
              return (
                <button
                  key={o}
                  type="button"
                  aria-pressed={on}
                  disabled={!on && full}
                  onClick={() => onChange(on ? chosen.filter((c) => c !== o) : [...chosen, o])}
                  className={`flex min-h-12 items-center gap-3 rounded-xl border p-3 text-start disabled:opacity-50 ${on ? 'border-accent bg-accent-soft' : 'border-line-strong bg-bg'}`}
                >
                  <span aria-hidden="true" className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${on ? 'bg-accent text-on-accent' : 'border border-line-strong'}`}>
                    {on ? chosen.indexOf(o) + 1 : ''}
                  </span>
                  {t(`priorities.${o}` as never)}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
  }
}
