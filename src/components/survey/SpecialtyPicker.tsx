'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { normalizeSearch } from '@/lib/institutions/filter';
import { ISCED, iscedEntry, iscedLevel, iscedPath, type IscedEntry } from '@/lib/survey/references';
import { inputClass, secondaryButton } from '../forms/ui';

const pick = (e: IscedEntry, locale: string): string => (e as unknown as Record<string, string>)[locale] ?? e.en;

/**
 * Choose up to `max` specialties from the ISCED-F 2013 tree (broad field > narrow field > detailed
 * specialty), or search by name. The order of the chosen ones is their priority.
 */
export function SpecialtyPicker({
  value,
  onChange,
  max,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  max: number;
}) {
  const t = useTranslations('Survey.ui');
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<Set<string>>(new Set());

  const children = useMemo(() => {
    const map = new Map<string, IscedEntry[]>();
    for (const e of ISCED) {
      if (e.c.length === 2) continue;
      const parent = e.c.slice(0, -1);
      map.set(parent, [...(map.get(parent) ?? []), e]);
    }
    return map;
  }, []);
  const broad = ISCED.filter((e) => e.c.length === 2);

  const q = normalizeSearch(query);
  const matches = q
    ? ISCED.filter((e) => normalizeSearch(pick(e, locale) + ' ' + e.en).includes(q)).slice(0, 14)
    : [];

  const full = value.length >= max;
  const add = (code: string) => !value.includes(code) && !full && onChange([...value, code]);
  const remove = (code: string) => onChange(value.filter((c) => c !== code));
  const move = (index: number, delta: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next);
  };
  const toggle = (code: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const addButton = (code: string) => (
    <button
      type="button"
      disabled={value.includes(code) || full}
      onClick={() => add(code)}
      className="shrink-0 rounded-full border border-line-strong px-3 py-1 text-sm font-medium text-text hover:bg-surface-strong disabled:opacity-40"
    >
      {value.includes(code) ? '✓' : t('add')}
    </button>
  );

  const renderNode = (start: IscedEntry, depth: number) => {
    // The ISCED-F tree repeats a name when a level has one child ("ICT" > "ICT"): skip such repeats,
    // so the person can go down to the real specialties and the code added is the deepest one.
    let node = start;
    let kids = children.get(node.c) ?? [];
    while (kids.length === 1 && kids[0].en === node.en) {
      node = kids[0];
      kids = children.get(node.c) ?? [];
    }
    const expandable = kids.length > 0;
    const isOpen = open.has(node.c);
    return (
      <li key={start.c}>
        <div className="flex items-center gap-2 py-1" style={{ paddingInlineStart: `${depth * 1.25}rem` }}>
          {expandable ? (
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggle(node.c)}
              className="flex min-h-9 flex-1 items-center gap-2 text-start font-medium text-text"
            >
              <span aria-hidden="true" className="inline-block w-4">{isOpen ? '▾' : '▸'}</span>
              {pick(node, locale)}
            </button>
          ) : (
            <span className="flex-1 ps-6 text-text">{pick(node, locale)}</span>
          )}
          {addButton(node.c)}
        </div>
        {expandable && isOpen && <ul>{kids.map((k) => renderNode(k, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">{t('counter', { chosen: value.length, count: max })}</p>

      {value.length > 0 && (
        <ol className="space-y-2">
          {value.map((code, i) => {
            const entry = iscedEntry(code);
            const path = iscedPath(code)
              .slice(0, -1)
              .map((c) => iscedEntry(c))
              .filter((x): x is IscedEntry => Boolean(x))
              .map((x) => pick(x, locale))
              .join(' › ');
            return (
              <li key={code} className="flex items-center gap-2 rounded-xl border border-line-strong bg-accent-soft p-3">
                <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-text">{entry ? pick(entry, locale) : code}</span>
                  {path && iscedLevel(code) !== 'broad' && <span className="block text-xs text-muted">{path}</span>}
                </span>
                <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={t('moveUp')} className="h-9 w-9 rounded-full border border-line-strong text-text disabled:opacity-30">↑</button>
                <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label={t('moveDown')} className="h-9 w-9 rounded-full border border-line-strong text-text disabled:opacity-30">↓</button>
                <button type="button" onClick={() => remove(code)} aria-label={t('remove')} className={`${secondaryButton} !h-9 !px-3`}>
                  ✕
                </button>
              </li>
            );
          })}
        </ol>
      )}

      <div>
        <label htmlFor="specialty-search" className="sr-only">{t('search')}</label>
        <input
          id="specialty-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search')}
          autoComplete="off"
          className={inputClass}
        />
      </div>

      {q ? (
        matches.length === 0 ? (
          <p className="text-muted">{t('noMatches')}</p>
        ) : (
          <ul className="divide-y divide-line rounded-xl border border-line">
            {matches.map((e) => (
              <li key={e.c} className="flex items-center gap-2 p-2">
                <span className="min-w-0 flex-1">
                  <span className="block text-text">{pick(e, locale)}</span>
                  <span className="block text-xs text-muted">
                    {iscedPath(e.c)
                      .slice(0, -1)
                      .map((c) => iscedEntry(c))
                      .filter((x): x is IscedEntry => Boolean(x))
                      .map((x) => pick(x, locale))
                      .join(' › ')}
                  </span>
                </span>
                {addButton(e.c)}
              </li>
            ))}
          </ul>
        )
      ) : (
        <ul className="rounded-xl border border-line p-2">{broad.map((e) => renderNode(e, 0))}</ul>
      )}
    </div>
  );
}
