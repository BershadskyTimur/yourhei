'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { COUNTRIES } from '@/lib/countries';
import { AUTH_EVENT } from '@/lib/supabase/auth-event';
import { eligibilityFor, filterScholarships } from '@/lib/scholarships/eligibility';
import { fetchMyCitizenships } from '@/lib/supabase/my-citizenships';
import { TrackedLink } from './TrackedLink';
import { inputClass } from './forms/ui';

export interface ScholarshipView {
  id: string;
  country: string | null;
  countryLabel: string;
  name: string;
  funder: string;
  meta: string;
  eligibility: string;
  url: string | null;
  levels: string[];
  /** citizens of these countries may apply (as the official page says); null = not listed here */
  eligibleCountries: string[] | null;
}

function hasSession(): boolean {
  return document.cookie.split('; ').some((c) => /^sb-.+-auth-token(\.\d+)?=/.test(c));
}
function subscribe(callback: () => void) {
  window.addEventListener(AUTH_EVENT, callback);
  return () => window.removeEventListener(AUTH_EVENT, callback);
}

/** The list of government and international scholarships, with filters by level and by the visitor's citizenship. */
export function ScholarshipBrowser({ items, levelLabels }: { items: ScholarshipView[]; levelLabels: Record<string, string> }) {
  const t = useTranslations('Scholarships');
  const locale = useLocale();
  const signedIn = useSyncExternalStore(subscribe, hasSession, () => false);
  const [citizenship, setCitizenship] = useState('');
  const [level, setLevel] = useState('');
  const [hideClosed, setHideClosed] = useState(true);

  // A signed-in person's citizenship from the profile is preselected (once, unless they chose another one already).
  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    fetchMyCitizenships().then((list) => {
      if (!cancelled && list[0]) setCitizenship((current) => current || list[0]);
    });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  // The country names come from the browser's own language data, which differs a little from the server's: the list of
  // countries is built after the page is shown (false on the server and during the first client render, then true).
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const countryOptions = useMemo(() => {
    if (!hydrated) return [];
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale], { type: 'region' });
    } catch {
      names = null;
    }
    const collator = new Intl.Collator(locale);
    return COUNTRIES.map((c) => ({ code: c.code, name: names?.of(c.code) ?? c.code })).sort((a, b) => collator.compare(a.name, b.name));
  }, [locale, hydrated]);

  const status = (s: ScholarshipView) => eligibilityFor(citizenship, s.eligibleCountries);
  const sorted = filterScholarships(items, { citizenship, level, hideClosed });
  const levels = [...new Set(items.flatMap((s) => s.levels))].filter((l) => levelLabels[l]);

  return (
    <div>
      <div className="mt-6 grid gap-4 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2">
        <div>
          <label htmlFor="sch-citizenship" className="mb-1 block text-sm font-medium">{t('citizenshipLabel')}</label>
          <select id="sch-citizenship" value={citizenship} onChange={(e) => setCitizenship(e.target.value)} className={inputClass}>
            <option value="">{t('citizenshipAny')}</option>
            {countryOptions.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sch-level" className="mb-1 block text-sm font-medium">{t('levelLabel')}</label>
          <select id="sch-level" value={level} onChange={(e) => setLevel(e.target.value)} className={inputClass}>
            <option value="">{t('levelAny')}</option>
            {levels.map((l) => (
              <option key={l} value={l}>{levelLabels[l]}</option>
            ))}
          </select>
        </div>
        {citizenship && (
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm sm:col-span-2">
            <input type="checkbox" checked={hideClosed} onChange={(e) => setHideClosed(e.target.checked)} className="h-5 w-5 accent-accent" />
            {t('hideClosed')}
          </label>
        )}
      </div>

      {sorted.length === 0 ? (
        <p className="mt-4 rounded-lg border border-line bg-surface p-5">{t('noMatch')}</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {sorted.map((s) => {
            const st = status(s);
            return (
              <li key={s.id} className="rounded-lg border border-line bg-surface p-5">
                <p className="text-sm font-medium uppercase tracking-wide text-muted">{s.countryLabel}</p>
                <h3 className="mt-1 text-lg font-semibold text-text">{s.name}</h3>
                {s.funder && <p className="text-sm text-muted">{s.funder}</p>}
                {s.meta && <p className="mt-2 text-sm font-medium">{s.meta}</p>}
                {st && (
                  <p
                    data-eligibility={st}
                    className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${st === 'yes' ? 'border-accent bg-accent-soft text-text' : st === 'no' ? 'border-line-strong text-muted' : 'border-line text-muted'}`}
                  >
                    {st === 'yes' ? t('eligibleYes') : st === 'no' ? t('eligibleNo') : t('eligibleCheck')}
                  </p>
                )}
                {s.eligibility && <p className="mt-2 text-sm">{s.eligibility}</p>}
                {s.url && (
                  <TrackedLink href={s.url} meta={{ kind: 'scholarship', ...(s.country ? { country: s.country } : {}) }} className="mt-3 inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:opacity-90">
                    {t('official')}
                  </TrackedLink>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
