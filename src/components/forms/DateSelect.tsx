'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { parseIsoDate } from '@/lib/age';
import { inputClass } from './ui';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A date as three drop-downs (day, month, year) instead of <input type="date">: the native control is unreliable on
 * many Android phones, in in-app browsers and in some Samsung / Xiaomi keyboards, and for a birth date it forces a
 * long scroll from today back to the birth year. Reports an ISO "YYYY-MM-DD" string, or "" while a part is missing.
 */
export function DateSelect({
  id,
  value,
  onChange,
  yearFrom,
  yearTo,
  descending = true,
  autoComplete,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (iso: string) => void;
  yearFrom: number;
  yearTo: number;
  /** Newest year first (birth dates); false for future dates such as an expected graduation. */
  descending?: boolean;
  /** Pass "bday" to let the browser fill the three parts from the saved birthday. */
  autoComplete?: 'bday';
  describedBy?: string;
}) {
  const t = useTranslations('Register.about');
  const initial = parseIsoDate(value);
  const [typed, setTyped] = useState({ d: initial?.d ?? 0, m: initial?.m ?? 0, y: initial?.y ?? 0 });
  const isoOf = (p: typeof typed) => (p.d && p.m && p.y ? `${p.y}-${pad(p.m)}-${pad(p.d)}` : '');
  // a value set from outside (a saved profile loaded after the first render) wins over what was typed
  const parts = initial && value !== isoOf(typed) ? { d: initial.d, m: initial.m, y: initial.y } : typed;

  function change(next: Partial<typeof typed>) {
    const p = { ...parts, ...next };
    setTyped(p);
    // a day that does not exist in the chosen month (31 February) is not passed on
    const iso = isoOf(p);
    onChange(iso && parseIsoDate(iso) ? iso : '');
  }

  const years: number[] = [];
  for (let y = yearFrom; y <= yearTo; y++) years.push(y);
  if (descending) years.reverse();

  const select = (key: 'd' | 'm' | 'y', label: string, auto: string | undefined, options: number[], fieldId?: string) => (
    <select
      id={fieldId}
      aria-label={label}
      aria-describedby={describedBy}
      autoComplete={auto}
      value={parts[key] || ''}
      onChange={(e) => change({ [key]: Number(e.target.value) })}
      className={inputClass}
    >
      <option value="">{label}</option>
      {options.map((n) => (
        <option key={n} value={n}>
          {key === 'y' ? n : pad(n)}
        </option>
      ))}
    </select>
  );

  return (
    <div className="grid grid-cols-[1fr_1fr_1.4fr] gap-2">
      {select('d', t('day'), autoComplete && 'bday-day', Array.from({ length: 31 }, (_, i) => i + 1), id)}
      {select('m', t('month'), autoComplete && 'bday-month', Array.from({ length: 12 }, (_, i) => i + 1))}
      {select('y', t('year'), autoComplete && 'bday-year', years)}
    </div>
  );
}
