'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { countByType, filterInstitutions } from '@/lib/institutions/filter';
import { pickLocalized } from '@/lib/institutions/localized';
import {
  INSTITUTION_TYPES,
  type InstitutionType,
  type MapInstitution,
} from '@/lib/institutions/types';
import { InstitutionMap, type FocusRequest } from './InstitutionMap';
import { TypeDot } from './TypeDot';

interface Props {
  items: MapInstitution[];
  loadError: boolean;
}

const MAX_SUGGESTIONS = 6;

export function InstitutionExplorer({ items, loadError }: Props) {
  const t = useTranslations('Home.map');
  const tTypes = useTranslations('Types');
  const locale = useLocale();

  const [types, setTypes] = useState<ReadonlySet<InstitutionType>>(() => new Set(INSTITUTION_TYPES));
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focus, setFocus] = useState<FocusRequest | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const focusCounter = useRef(0);

  const counts = useMemo(() => countByType(items), [items]);
  const filtered = useMemo(() => filterInstitutions(items, { types, query }), [items, types, query]);
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
      className="overflow-hidden rounded-3xl border border-line-strong/40 bg-bg shadow-xl"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setSelectedId(null);
          setShowSuggestions(false);
        }
      }}
    >
      <div className="border-b border-line bg-surface">
        <div className="flex flex-col gap-3 px-4 py-3 sm:py-4 lg:flex-row lg:items-end lg:justify-between">
          <h2 id="map-title" className="text-xl font-bold text-brand sm:text-2xl">
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
              className="h-11 w-full rounded-full border border-line-strong bg-bg px-4 text-text placeholder:text-muted"
            />
            {showSuggestions && query.trim() !== '' && (
              <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-2xl border border-line-strong bg-bg shadow-lg">
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

        <div className="px-4 pb-4">
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
                    className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-sm ${
                      on
                        ? 'border-line-strong bg-bg text-text'
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
      <div className="relative h-[70svh] min-h-[420px] max-h-[760px] w-full bg-surface-strong">
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
        {loadError && (
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
            className="absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-line-strong bg-bg p-4 shadow-xl sm:inset-x-auto sm:start-4 sm:bottom-4 sm:w-80"
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
              className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-on-accent hover:opacity-90"
            >
              {t('more')}
            </Link>
          </div>
        )}
      </div>

      <div className="px-4 py-3 text-sm text-muted">
        <p aria-live="polite">{t('shown', { shown: filtered.length, total: items.length })}</p>
      </div>
    </section>
  );
}
