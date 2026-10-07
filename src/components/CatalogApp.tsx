'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TypeDot } from '@/components/TypeDot';
import { inputClass, secondaryButton } from '@/components/forms/ui';
import { Link } from '@/i18n/navigation';
import { CATALOG_CURRENCIES, totalYearly, yearlyLiving, yearlyTuition } from '@/lib/catalog/cost';
import { chooseCurrency, loadCountryFacts, loadRates, useChosenCurrency, useMounted } from '@/lib/catalog/currency-store';
import { CATALOG_LEVELS, nameFilter, searchTerm } from '@/lib/catalog/query';
import { COUNTRIES } from '@/lib/countries';
import { pickLocalized } from '@/lib/institutions/localized';
import { INSTITUTION_TYPES, isInstitutionType, type InstitutionType } from '@/lib/institutions/types';
import { toProgram } from '@/lib/matching/load';
import type { CountryFacts, MatchProgram, Rates } from '@/lib/matching/types';
import { COMMON_LANGUAGES, ISCED, iscedEntry, labelFor } from '@/lib/survey/references';
import { getSupabaseBrowser } from '@/lib/supabase/client';

const PAGE = 40;
const MAX_FETCHES = 6; // one "show more" may look through at most 6 x 40 programmes while a price filter is on
const COLUMNS = 'id, names, level, isced_f, languages, duration_years, tuition, free, institutions!inner (id, slug, type, country, city, names)';
type Mode = 'programs' | 'institutions';
interface Filters {
  q: string;
  country: string;
  level: string;
  language: string;
  field: string;
  type: string;
  freeOnly: boolean;
  maxPrice: string;
}
const EMPTY: Filters = { q: '', country: '', level: '', language: '', field: '', type: '', freeOnly: false, maxPrice: '' };

interface InstitutionRow {
  id: string;
  slug: string;
  type: InstitutionType;
  country: string;
  city: Record<string, string>;
  names: Record<string, string>;
}
type Row = Record<string, unknown>;
const rec = (v: unknown): Row => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Row) : {});

const BROAD_FIELDS = ISCED.filter((e) => e.c.length === 2);

/** The catalog: every published programme or institution, with filters and prices in the visitor's currency. */
export function CatalogApp() {
  const t = useTranslations('Catalog');
  const tTypes = useTranslations('Types');
  const tLevel = useTranslations('Survey.q.level.options');
  const locale = useLocale();
  const regionNames = useMemo(() => new Intl.DisplayNames([locale], { type: 'region' }), [locale]);
  const langNames = useMemo(() => new Intl.DisplayNames([locale], { type: 'language' }), [locale]);

  const [mode, setMode] = useState<Mode>('programs');
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);
  const currency = useChosenCurrency(locale);
  const mounted = useMounted();
  const [rates, setRates] = useState<Rates>({});
  const [facts, setFacts] = useState<Record<string, CountryFacts>>({});
  const [programs, setPrograms] = useState<MatchProgram[]>([]);
  const [institutions, setInstitutions] = useState<InstitutionRow[]>([]);
  // `result.key` says which search the list belongs to: while it differs from the current search, the list is loading
  const [result, setResult] = useState<{ key: string; status: 'ready' | 'failed' } | null>(null);
  const searchKey = JSON.stringify([applied, mode]);
  const status: 'loading' | 'ready' | 'failed' = result && result.key === searchKey ? result.status : 'loading';
  const [more, setMore] = useState(false);
  const offset = useRef(0);
  const after = useRef<{ institution: string; program: string } | null>(null);
  const legacy = useRef(false);
  const run = useRef(0);

  // exchange rates and the living costs of the countries
  useEffect(() => {
    void loadRates().then(setRates);
    void loadCountryFacts().then(setFacts);
  }, []);

  const load = useCallback(
    async (reset: boolean, f: Filters, m: Mode) => {
      const supabase = getSupabaseBrowser();
      const ticket = ++run.current;
      const key = JSON.stringify([f, m]);
      if (!supabase) {
        setResult({ key, status: 'failed' });
        return;
      }
      if (reset) {
        offset.current = 0;
        after.current = null;
      }
      try {
        const maxPrice = Number(f.maxPrice);
        const priceFilter = m === 'programs' && Number.isFinite(maxPrice) && f.maxPrice !== '';
        const found: MatchProgram[] = [];
        const foundInstitutions: InstitutionRow[] = [];
        let exhausted = false;
        for (let attempt = 0; attempt < (priceFilter ? MAX_FETCHES : 1) && !exhausted; attempt++) {
          if (m === 'programs') {
            let page: Row[] | null = null;
            if (!legacy.current) {
              // the fast way: a database function that pages by keyset (migration 0011)
              const res = await supabase.rpc('catalog_programs', {
                p_country: f.country || null,
                p_level: f.level || null,
                p_language: f.language || null,
                p_field: f.field || null,
                p_free: f.freeOnly,
                p_q: searchTerm(f.q) || null,
                p_after_institution: after.current?.institution ?? null,
                p_after_program: after.current?.program ?? null,
                p_limit: PAGE,
              });
              if (res.error && /catalog_programs|PGRST202/.test(`${res.error.code} ${res.error.message}`)) legacy.current = true;
              else if (res.error) throw res.error;
              else {
                const list = (Array.isArray(res.data) ? res.data : []) as Row[];
                const last = list[list.length - 1];
                if (last) after.current = { institution: String(rec(last.institutions).id), program: String(last.id) };
                page = list;
              }
            }
            if (page === null) {
              // the older way (the database function is not installed yet): plain query, may be slow for rare filters
              let q = supabase.from('programs').select(COLUMNS).eq('status', 'published').order('id');
              if (f.level) q = q.eq('level', f.level);
              if (f.language) q = q.contains('languages', [f.language]);
              if (f.field) q = q.like('isced_f', `${f.field}%`);
              if (f.freeOnly) q = q.eq('free', true);
              if (f.country) q = q.eq('institutions.country', f.country);
              const or = nameFilter(f.q, ['en', 'original']);
              if (or) q = q.or(or);
              const res = await q.range(offset.current, offset.current + PAGE - 1);
              if (res.error) throw res.error;
              offset.current += PAGE;
              page = res.data as unknown as Row[];
            }
            exhausted = page.length < PAGE;
            for (const row of page) {
              const p = toProgram(row);
              if (!p) continue;
              if (priceFilter && !p.free) {
                const y = yearlyTuition(p.tuition, p.durationYears, currency, rates);
                if (!y || y.currency !== currency || y.amount > maxPrice) continue;
              }
              found.push(p);
            }
            if (found.length >= PAGE / 2) break;
          } else {
            let q = supabase.from('institutions').select('id, slug, type, country, city, names').eq('status', 'published').order('id');
            if (f.type) q = q.eq('type', f.type);
            if (f.country) q = q.eq('country', f.country);
            const or = nameFilter(f.q, ['en', 'original']);
            if (or) q = q.or(or);
            const res = await q.range(offset.current, offset.current + PAGE - 1);
            if (res.error) throw res.error;
            offset.current += PAGE;
            exhausted = res.data.length < PAGE;
            for (const r of res.data as unknown as Row[]) {
              if (typeof r.id === 'string' && typeof r.type === 'string' && isInstitutionType(r.type)) {
                foundInstitutions.push({ id: r.id, slug: String(r.slug), type: r.type, country: String(r.country), city: rec(r.city) as Record<string, string>, names: rec(r.names) as Record<string, string> });
              }
            }
          }
        }
        if (ticket !== run.current) return; // a newer search has started
        if (m === 'programs') setPrograms((old) => (reset ? found : [...old, ...found]));
        else setInstitutions((old) => (reset ? foundInstitutions : [...old, ...foundInstitutions]));
        setMore(!exhausted);
        setResult({ key, status: 'ready' });
      } catch (error) {
        if (ticket !== run.current) return;
        console.error('[catalog] could not load', error);
        setResult({ key, status: 'failed' });
      }
    },
    [currency, rates],
  );

  // the first load and every change of the applied filters
  useEffect(() => {
    (async () => {
      await load(true, applied, mode);
    })();
    // `load` changes when rates arrive; the list is not reloaded for that (prices are computed on screen)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied, mode]);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((f) => ({ ...f, [key]: value }));
  // Region names come from the browser's own tables, which differ from the server's: fill the list after the page is shown.
  const countries = useMemo(() => (mounted ? COUNTRIES.map((c) => c.code).sort((a, b) => (regionNames.of(a) ?? a).localeCompare(regionNames.of(b) ?? b, locale)) : []), [mounted, regionNames, locale]);

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label={t('modeLabel')} className="flex gap-2">
        {(['programs', 'institutions'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => setMode(m)}
            className={`inline-flex h-10 items-center rounded-lg border px-4 text-sm font-semibold ${mode === m ? 'border-line-strong bg-accent-soft text-text' : 'border-line bg-bg text-muted hover:bg-surface-strong'}`}
          >
            {t(`mode.${m}`)}
          </button>
        ))}
      </div>

      <form
        className="grid gap-4 rounded-lg border border-line bg-surface p-5 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(filters);
        }}
      >
        <label className="block text-sm font-semibold text-text sm:col-span-2 lg:col-span-3">
          {t('search')}
          <input type="search" value={filters.q} onChange={(e) => set('q', e.target.value)} placeholder={t('searchPlaceholder')} maxLength={60} className={`${inputClass} mt-1 font-normal`} />
        </label>

        <label className="block text-sm font-semibold text-text">
          {t('country')}
          <select value={filters.country} onChange={(e) => set('country', e.target.value)} className={`${inputClass} mt-1 font-normal`}>
            <option value="">{t('any')}</option>
            {countries.map((c) => (
              <option key={c} value={c}>{regionNames.of(c) ?? c}</option>
            ))}
          </select>
        </label>

        {mode === 'institutions' ? (
          <label className="block text-sm font-semibold text-text">
            {t('type')}
            <select value={filters.type} onChange={(e) => set('type', e.target.value)} className={`${inputClass} mt-1 font-normal`}>
              <option value="">{t('any')}</option>
              {INSTITUTION_TYPES.map((x) => (
                <option key={x} value={x}>{tTypes(x)}</option>
              ))}
            </select>
          </label>
        ) : (
          <>
            <label className="block text-sm font-semibold text-text">
              {t('level')}
              <select value={filters.level} onChange={(e) => set('level', e.target.value)} className={`${inputClass} mt-1 font-normal`}>
                <option value="">{t('any')}</option>
                {CATALOG_LEVELS.map((x) => (
                  <option key={x} value={x}>{tLevel.has(x as 'bachelor') ? tLevel(x as 'bachelor') : x}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-text">
              {t('language')}
              <select value={filters.language} onChange={(e) => set('language', e.target.value)} className={`${inputClass} mt-1 font-normal`}>
                <option value="">{t('any')}</option>
                {COMMON_LANGUAGES.map((x) => (
                  <option key={x} value={x}>{langNames.of(x) ?? x}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-text">
              {t('field')}
              <select value={filters.field} onChange={(e) => set('field', e.target.value)} className={`${inputClass} mt-1 font-normal`}>
                <option value="">{t('any')}</option>
                {BROAD_FIELDS.map((x) => (
                  <option key={x.c} value={x.c}>{labelFor(x, locale)}</option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-semibold text-text">
              {t('maxPrice', { currency })}
              <input type="number" inputMode="numeric" min={0} step={500} value={filters.maxPrice} onChange={(e) => set('maxPrice', e.target.value)} className={`${inputClass} mt-1 font-normal`} />
            </label>
            <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-text">
              <input type="checkbox" checked={filters.freeOnly} onChange={(e) => set('freeOnly', e.target.checked)} className="size-5" />
              {t('freeOnly')}
            </label>
          </>
        )}

        <div className="flex flex-wrap items-end gap-3 sm:col-span-2 lg:col-span-3">
          <button type="submit" className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-6 font-semibold text-on-accent hover:opacity-90">{t('apply')}</button>
          <button
            type="button"
            className={secondaryButton}
            onClick={() => {
              setFilters(EMPTY);
              setApplied(EMPTY);
            }}
          >
            {t('reset')}
          </button>
          <label className="ms-auto block text-sm font-semibold text-text">
            {t('currency')}
            <select value={currency} onChange={(e) => chooseCurrency(e.target.value)} className={`${inputClass} mt-1 w-28 font-normal`}>
              {CATALOG_CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
      </form>

      {status === 'loading' && <p className="text-muted">{t('loading')}</p>}
      {status === 'failed' && <p role="alert" className="rounded-lg border border-danger p-4 font-medium text-danger">{t('failed')}</p>}

      {status === 'ready' && mode === 'programs' && (
        <>
          {programs.length === 0 ? (
            <p className="rounded-lg border border-line bg-surface p-5">{t('empty')}</p>
          ) : (
            <ul className="space-y-3">
              {programs.map((p) => (
                <ProgramRow key={p.id} program={p} currency={currency} rates={rates} facts={facts[p.institution.country] ?? null} />
              ))}
            </ul>
          )}
          <p className="text-sm text-muted">{t('ratesNote')}</p>
        </>
      )}

      {status === 'ready' && mode === 'institutions' && (
        <>
          {institutions.length === 0 ? (
            <p className="rounded-lg border border-line bg-surface p-5">{t('empty')}</p>
          ) : (
            <ul className="space-y-3">
              {institutions.map((i) => {
                const city = pickLocalized(i.city, locale).text;
                return (
                  <li key={i.id} className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4">
                    <TypeDot type={i.type} size={20} />
                    <div className="min-w-0">
                      <Link href={`/institutions/${i.country.toLowerCase()}/${i.slug}`} className="font-semibold underline-offset-4 hover:underline">
                        {pickLocalized(i.names, locale).text}
                      </Link>
                      <p className="text-sm text-muted">{[tTypes(i.type), city, regionNames.of(i.country) ?? i.country].filter(Boolean).join(' · ')}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {status === 'ready' && more && (
        <button type="button" className={secondaryButton} onClick={() => void load(false, applied, mode)}>
          {t('more')}
        </button>
      )}
    </div>
  );
}

function ProgramRow({ program, currency, rates, facts }: { program: MatchProgram; currency: string; rates: Rates; facts: CountryFacts | null }) {
  const t = useTranslations('Catalog');
  const tInst = useTranslations('Institution');
  const tLevel = useTranslations('Survey.q.level.options');
  const locale = useLocale();
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
  const langNames = new Intl.DisplayNames([locale], { type: 'language' });
  const money = (amount: number, cur: string) => {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(amount);
    } catch {
      return `${Math.round(amount)} ${cur}`;
    }
  };

  const inst = program.institution;
  const price = yearlyTuition(program.tuition, program.durationYears, currency, rates);
  const living = facts ? yearlyLiving(facts.costOfLiving, inst.city, currency, rates) : null;
  const total = totalYearly(price, program.free, living, currency);
  const field = program.iscedF ? iscedEntry(program.iscedF.slice(0, 2)) : undefined;

  return (
    <li className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-text">{pickLocalized(program.names, locale).text}</p>
          <p className="text-sm">
            <Link href={`/institutions/${inst.country.toLowerCase()}/${inst.slug}`} className="underline-offset-4 hover:underline">
              {pickLocalized(inst.names, locale).text}
            </Link>
            <span className="text-muted"> · {regionNames.of(inst.country) ?? inst.country}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {[
              tLevel.has(program.level as 'bachelor') ? tLevel(program.level as 'bachelor') : program.level,
              program.durationYears ? t('years', { count: program.durationYears }) : null,
              program.languages.length ? program.languages.map((l) => langNames.of(l) ?? l).join(', ') : null,
              field ? labelFor(field, locale) : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <div className="text-end text-sm">
          {program.free ? (
            <p className="font-semibold text-text">{tInst('free')}</p>
          ) : price ? (
            <>
              <p className="font-semibold text-text">{t('perYear', { price: money(price.amount, price.currency) })}</p>
              {price.converted && <p className="text-xs text-muted">{t('approx')}</p>}
            </>
          ) : (
            <p className="text-muted">{t('priceUnknown')}</p>
          )}
          {total ? (
            <p className="mt-1 text-muted">{t('total', { total: money(total.total, total.currency), living: money(total.living, total.currency) })}</p>
          ) : (
            (price || program.free) && <p className="mt-1 text-xs text-muted">{t('livingUnknown')}</p>
          )}
        </div>
      </div>
    </li>
  );
}
