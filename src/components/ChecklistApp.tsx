'use client';

import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';

const KEY = 'yourhei-checklist';
const CHANGED = 'yourhei-checklist-changed';
// the ticks of this visit when the browser does not allow storage (private window)
let memory = '[]';

function read(): string {
  try {
    return window.localStorage.getItem(KEY) ?? memory;
  } catch {
    return memory;
  }
}
function subscribe(callback: () => void) {
  window.addEventListener(CHANGED, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGED, callback);
    window.removeEventListener('storage', callback);
  };
}
function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** The list of documents with a tick for each. What is ticked is kept in this browser only (nothing is sent anywhere). */
export function ChecklistApp({ items }: { items: { id: string; label: string }[] }) {
  const t = useTranslations('Checklist');
  const done = parse(useSyncExternalStore(subscribe, read, () => '[]'));

  function save(next: string[]) {
    memory = JSON.stringify(next);
    try {
      window.localStorage.setItem(KEY, memory);
    } catch {
      /* the ticks stay for this visit only */
    }
    window.dispatchEvent(new Event(CHANGED));
  }

  const ready = items.filter((i) => done.includes(i.id)).length;
  const percent = Math.round((ready / items.length) * 100);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-base font-semibold text-text" aria-live="polite">{t('progress', { done: ready, total: items.length })}</p>
        {ready > 0 && (
          <button type="button" onClick={() => save([])} className="min-h-11 rounded-lg border border-line-strong px-4 text-sm font-medium hover:bg-surface-strong">
            {t('reset')}
          </button>
        )}
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={t('progress', { done: ready, total: items.length })}>
        <div className="h-full bg-accent transition-[width] motion-reduce:transition-none" style={{ width: `${percent}%` }} />
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((i) => {
          const checked = done.includes(i.id);
          return (
            <li key={i.id}>
              <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 text-base hover:bg-surface-strong">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => save(checked ? done.filter((x) => x !== i.id) : [...done, i.id])}
                  className="h-5 w-5 shrink-0 accent-accent"
                />
                <span className={checked ? 'text-muted line-through' : 'text-text'}>{i.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
