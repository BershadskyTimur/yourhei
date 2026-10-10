'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { decodeInstitutions, type CompactInstitutions } from '@/lib/institutions/compact';
import { filterInstitutions } from '@/lib/institutions/filter';
import { pickLocalized } from '@/lib/institutions/localized';
import {
  INSTITUTION_TYPES,
  type InstitutionType,
  type MapInstitution,
} from '@/lib/institutions/types';
import { InstitutionMap, type FocusRequest } from './InstitutionMap';
import { TypeDot } from './TypeDot';

interface Props {
  /** Number of institutions of each type (counted on the server, so the filter buttons do not jump when the list arrives). */
  typeCounts: Record<InstitutionType, number>;
  /** The server could not read the institutions. */
  loadError: boolean;
}

const MAX_SUGGESTIONS = 6;

export function InstitutionExplorer({ typeCounts, loadError }: Props) {
  const t = useTranslations('Home.map');
  const tTypes = useTranslations('Types');
  const tCatalog = useTranslations('Catalog');
  const locale = useLocale();

  const [types, setTypes] = useState<ReadonlySet<InstitutionType>>(() => new Set(INSTITUTION_TYPES));
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<FocusRequest | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const focusCounter = useRef(0);

  // The list is not part of the page (it would weigh about 1 MB): it is loaded from a cached, compact answer.
  const [items, setItems] = useState<MapInstitution[] | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/institutions?locale=${locale}`, { signal: controller.signal });
        if (!res.ok) throw new Error(String(res.status));
        setItems(decodeInstitutions((await res.json()) as CompactInstitutions));
      } catch {
        if (!controller.signal.aborted) setFetchFailed(true);
      }
    })();
    return () => controller.abort();
  }, [locale]);
  const list = useMemo(() => items ?? [], [items]);
  const counts = typeCounts;
  const filtered = useMemo(() => filterInstitutions(list, { types, query }), [list, types, query]);
  // The card closes by itself when its institution is filtered out.
  const selected = filtered.find((i) => i.id === selectedId) ?? null;

  const countryName = useMemo(() => {
    const names = new Intl.DisplayNames([locale], { type: 'region' });
    return (code: string) => names.of(code) ?? code;
  }, [locale]);

  const toggleType = (type: InstitutionType) =>
    setTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });

  const place = (i: MapInstitution) => {
    const city = pickLocalized(i.city, locale).text;
    return [city, countryName(i.country)].filter(Boolean).join(', ');
  };

  const chooseSuggestion = (i: MapInstitution) => {
    setSelectedId(i.id);
    focusCounter.current += 1;
    setFocus({ lat: i.lat, lng: i.lng, nonce: focusCounter.current });
    setShowSuggestions(false);
  };

  const suggestions = query.trim() ? filtered.slice(0, MAX_SUGGESTIONS) : [];
  const selectedName = selected ? pickLocalized(selected.names, locale).text : '';
  const selectedOriginal = selected?.names.original ?? '';

  return (
    <section
      id="map"
      aria-labelledby="map-title"
      className="min-w-0"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setSelectedId(null);
          setShowSuggestions(false);
        }
      }}
    >
      <div className="mx-auto max-w-[1500px] px-4 pb-6 pt-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="map-title" className="text-3xl font-normal tracking-tight text-text sm:text-5xl">
            {t('heading')}
          </h2>

          <div
            className="relative w-full lg:max-w-sm"
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setShowSuggestions(false);
            }}
          >
            <label htmlFor="map-search" className="sr-only">
              {t('searchLabel')}
            </label>
            <input
              id="map-search"
              type="search"
              value={query}
              placeholder={t('searchPlaceholder')}
              autoComplete="off"
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="h-12 w-full rounded-none border-0 border-b border-line-strong bg-transparent px-1 text-lg text-text placeholder:text-muted"
            />
            {showSuggestions && query.trim() !== '' && (
              <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-line-strong bg-bg">
                {suggestions.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-muted">{t('noResults')}</li>
                ) : (
                  suggestions.map((i) => (
                    <li key={i.id}>
                      <button
                        type="button"
                        onClick={() => chooseSuggestion(i)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-start hover:bg-surface-strong"
                      >
                        <TypeDot type={i.type} size={24} />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-text">
                            {pickLocalized(i.names, locale).text}
                          </span>
                          <span className="block text-xs text-muted">{place(i)}</span>
                        </span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-6">
          <p id="legend-label" className="mb-2 text-sm text-muted">
            {t('legendLabel')}
          </p>
          {/* On phones the chips scroll sideways in one row so the map stays on the first screen. */}
          <ul
            aria-labelledby="legend-label"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
          >
            {INSTITUTION_TYPES.map((type) => {
              const on = types.has(type);
              return (
                <li key={type} className="shrink-0">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleType(type)}
                    className={`inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-1 text-sm ${
                      on
                        ? 'border-text bg-text/10 text-text'
                        : 'border-dashed border-line-strong bg-surface text-muted opacity-75'
                    }`}
                  >
                    <TypeDot type={type} size={24} />
                    <span>{tTypes(type)}</span>
                    <span className="rounded-full bg-surface-strong px-2 text-xs text-muted">
                      {counts[type]}
                    </span>
                    {on && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m5 12 5 5 9-10" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* On phones the map fills the rest of the first screen, so its bottom card is never off-screen. */}
      <div className="relative h-[72svh] min-h-[460px] max-h-[780px] w-full border-y border-line bg-surface-strong">
        {!unsupported && (
          <InstitutionMap
            items={filtered}
            selectedId={selected?.id ?? null}
            focus={focus}
            onSelect={setSelectedId}
            label={t('mapLabel')}
            onUnsupported={() => setUnsupported(true)}
          />
        )}

        {unsupported && (
          <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-text">
            {t('noWebgl')}
          </p>
        )}
        {(loadError || fetchFailed) && (
          <p
            role="alert"
            className="absolute inset-x-4 top-4 z-10 rounded-xl border border-line-strong bg-bg p-3 text-center text-text"
          >
            {t('loadError')}
          </p>
        )}

        {selected && (
          <div
            role="dialog"
            aria-label={selectedName}
            className="absolute inset-x-3 bottom-3 z-10 rounded-lg border border-line-strong bg-bg p-4 sm:inset-x-auto sm:start-4 sm:bottom-4 sm:w-80"
          >
            <div className="flex items-start gap-3">
              <TypeDot type={selected.type} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  {tTypes(selected.type)}
                </p>
                <h2 className="text-lg font-semibold leading-snug text-text">{selectedName}</h2>
                {selectedOriginal && selectedOriginal !== selectedName && (
                  <p className="text-sm text-muted">{selectedOriginal}</p>
                )}
                <p className="mt-1 text-sm text-muted">{place(selected)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                aria-label={t('close')}
                className="-me-1 -mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text hover:bg-surface-strong"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <Link
              href={`/institutions/${selected.country.toLowerCase()}/${selected.slug}`}
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent hover:opacity-90"
            >
              {t('more')}
            </Link>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-4 text-sm text-muted">
        <p aria-live="polite">
          {items ? t('shown', { shown: filtered.length, total: items.length }) : fetchFailed ? '' : tCatalog('loading')}
        </p>
      </div>
    </section>
  );
}
