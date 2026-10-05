'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useId, useMemo, useState } from 'react';
import { normalizeSearch } from '@/lib/institutions/filter';
import { sortedCountryNames } from '@/lib/countries';
import { inputClass } from './ui';

/** Pick several countries: type to search, press a result to add it, press a chip to remove it. */
export function CountryMultiSelect({
  value,
  onChange,
  inputId,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  inputId?: string;
}) {
  const t = useTranslations('Register.about');
  const locale = useLocale();
  const generated = useId();
  const id = inputId ?? generated;
  const [query, setQuery] = useState('');

  const all = useMemo(() => sortedCountryNames(locale), [locale]);
  const names = useMemo(() => new Map(all.map((c) => [c.code, c.name])), [all]);

  const q = normalizeSearch(query);
  const matches =
    q === ''
      ? []
      : all.filter((c) => !value.includes(c.code) && normalizeSearch(c.name).includes(q)).slice(0, 8);

  return (
    <div>
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {value.map((code) => (
            <li key={code}>
              <button
                type="button"
                onClick={() => onChange(value.filter((c) => c !== code))}
                aria-label={t('remove', { name: names.get(code) ?? code })}
                className="inline-flex min-h-9 items-center gap-2 rounded-full border border-line-strong bg-accent-soft px-3 text-sm text-text"
              >
                {names.get(code) ?? code}
                <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('countrySearch')}
        autoComplete="off"
        className={inputClass}
      />
      {query.trim() !== '' && (
        <ul className="mt-1 overflow-hidden rounded-xl border border-line-strong bg-bg">
          {matches.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">{t('noMatches')}</li>
          ) : (
            matches.map((c) => (
              <li key={c.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange([...value, c.code]);
                    setQuery('');
                  }}
                  className="block w-full px-3 py-2 text-start text-text hover:bg-surface-strong"
                >
                  {c.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
