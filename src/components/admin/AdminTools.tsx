'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import programmeCountries from '../../../data/generated/programme-countries.json';
import { getSupabaseBrowser } from '@/lib/supabase/client';

// More tools of the admin panel (data health, popular institutions, system status, duplicates, error reports, export).
// Like the rest of the admin panel it is in Russian only. The real protection is in the database: every function and
// table used here refuses anyone who is not an administrator (supabase/migrations/0029_admin_tools.sql).

type Row = Record<string, unknown>;

/** The countries for which programmes were loaded from our data files (a few more may exist: the tab can check all). */
const KNOWN_COUNTRIES: string[] = [...new Set([...(programmeCountries as { countries: string[] }).countries, 'GE', 'CN', 'JP'])];

const btn = 'inline-flex h-9 items-center rounded-lg border border-line-strong px-3 text-sm font-medium text-text hover:bg-surface-strong disabled:opacity-50';
const btnPrimary = 'inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-semibold text-on-accent hover:opacity-90 disabled:opacity-50';
const input = 'h-10 rounded-lg border border-line-strong bg-bg px-3 text-text focus:outline-2 focus:outline-offset-2 focus:outline-accent';

const regionRu = (() => {
  try {
    return new Intl.DisplayNames(['ru'], { type: 'region' });
  } catch {
    return null;
  }
})();
const countryRu = (code: unknown) => {
  const c = String(code ?? '');
  try {
    return regionRu?.of(c) ?? c;
  } catch {
    return c;
  }
};

const needMigration = (message: string) =>
  /function|does not exist|schema cache|relation|PGRST20/i.test(message) ? ' Запустите файл 0029_admin_tools.sql в Supabase (SQL Editor).' : '';

/** Loads once and again when `deps` change; `run` returns the answer or an error. */
function useRpc<T>(run: () => PromiseLike<{ data: unknown; error: { message: string } | null }>, deps: unknown[]) {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a new request starts: show the loading state first
    setState((s) => ({ ...s, loading: true }));
    Promise.resolve(run()).then((res) => {
      if (live) setState({ data: (res.data as T | null) ?? null, error: res.error ? res.error.message + needMigration(res.error.message) : null, loading: false });
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { ...state, reload };
}

function Status({ error, loading }: { error: string | null; loading: boolean }) {
  if (loading) return <p className="mt-3">Загрузка…</p>;
  if (error) return <p role="alert" className="mt-3 text-danger">Ошибка: {error}</p>;
  return null;
}

const pct = (n: number, total: number) => (total > 0 ? Math.round((n / total) * 100) : 0);
const nf = new Intl.NumberFormat('ru');

function Bar({ value }: { value: number }) {
  const tone = value >= 80 ? 'bg-accent' : value >= 40 ? 'bg-gold' : 'bg-danger';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-surface-strong" aria-hidden="true">
        <div className={`h-1.5 rounded-full ${tone}`} style={{ width: `${Math.max(2, value)}%` }} />
      </div>
      <span className="tabular-nums">{value}%</span>
    </div>
  );
}

// ------------------------------------------------------------------ data health
interface HealthCountry {
  country: string;
  institutions_with_programmes: number;
  programmes: number;
  priced: number;
  with_deadline: number;
  with_language: number;
  with_field: number;
}
const LEVEL_RU: Record<string, string> = { school: 'школа', college: 'колледж', foundation: 'подготовительные', bachelor: 'бакалавриат', master: 'магистратура', phd: 'докторантура', language_course: 'языковые курсы' };
const LEVELS = Object.keys(LEVEL_RU);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** One small request; when the database says "too slow" (it can be busy cleaning up after a big load) it tries again a few times. */
async function ask<T>(name: string, args?: Record<string, unknown>): Promise<{ data: T | null; error: string | null }> {
  let message = '';
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await getSupabaseBrowser()!.rpc(name, args);
    if (!res.error) return { data: res.data as T, error: null };
    message = res.error.message;
    if (!/timeout/i.test(message)) break;
    await sleep(1500 * (attempt + 1));
  }
  return { data: null, error: message + needMigration(message).replace('0029_admin_tools', '0031_admin_data_health_small') };
}

export function DataHealth() {
  // Every number is its own small request (one big one hits the time limit of a request), so what is ready is shown at once.
  const [institutions, setInstitutions] = useState<{ total: number; by_country: Record<string, number> } | null>(null);
  const [levels, setLevels] = useState<Record<string, number | null>>({});
  const [drafts, setDrafts] = useState<number | null | undefined>(undefined);
  const [rows, setRows] = useState<HealthCountry[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(0);

  const loadCountry = useCallback(async (code: string) => {
    const res = await ask<HealthCountry>('admin_data_health_country', { p_country: code });
    setChecked((c) => new Set(c).add(code));
    if (res.error) setErrors((e) => [...e, `${countryRu(code)}: ${res.error}`]);
    else if (res.data && res.data.programmes > 0) setRows((r) => [...r.filter((x) => x.country !== code), res.data!].sort((a, b) => b.programmes - a.programmes));
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      setRunning(true);
      setErrors([]);
      setRows([]);
      setChecked(new Set());
      setLevels({});
      setDrafts(undefined);
      const inst = await ask<{ total: number; by_country: Record<string, number> }>('admin_dh_institutions');
      if (!live) return;
      if (inst.error) setErrors((e) => [...e, `Заведения: ${inst.error}`]);
      else setInstitutions(inst.data);
      for (const level of LEVELS) {
        const res = await ask<number>('admin_dh_level', { p_level: level });
        if (!live) return;
        setLevels((l) => ({ ...l, [level]: res.error ? null : Number(res.data) }));
      }
      const d = await ask<number>('admin_dh_drafts');
      if (!live) return;
      setDrafts(d.error ? null : Number(d.data));
      for (const code of KNOWN_COUNTRIES) {
        if (!live) return;
        await loadCountry(code);
      }
      if (live) setRunning(false);
    })();
    return () => {
      live = false;
    };
  }, [round, loadCountry]);

  // The list of countries above comes from the data files; this checks all the others (one request per country).
  const [checkingOthers, setCheckingOthers] = useState(false);
  const checkOthers = async () => {
    if (!institutions) return;
    setCheckingOthers(true);
    for (const code of Object.keys(institutions.by_country)) if (!checked.has(code)) await loadCountry(code);
    setCheckingOthers(false);
  };

  const total = rows.reduce((n, c) => n + c.programmes, 0);
  const withProgrammes = rows.reduce((n, c) => n + c.institutions_with_programmes, 0);
  const allChecked = institutions ? Object.keys(institutions.by_country).every((c) => checked.has(c)) : false;
  const num = (v: number | null | undefined) => (v === undefined ? '…' : v === null ? '—' : nf.format(v));
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Здоровье данных</h2>
        <button type="button" className={btn} disabled={running} onClick={() => setRound((n) => n + 1)}>Обновить</button>
      </div>
      <p className="mt-1 text-sm text-muted">Насколько полны данные по странам: у какой доли программ есть цена, срок подачи, язык и направление. Красный — мало: туда стоит добавлять данные. Цифры приходят по одной: если база занята, часть покажется позже или будет «—».</p>
      {errors.length > 0 && (
        <div role="alert" className="mt-3 text-sm text-danger">
          <p>Не удалось прочитать (база сейчас может быть занята, нажмите «Обновить» через несколько минут):</p>
          <ul className="list-disc ps-5">
            {errors.slice(0, 4).map((e) => (
              <li key={e}>{e}</li>
            ))}
            {errors.length > 4 && <li>…и ещё {errors.length - 4}</li>}
          </ul>
        </div>
      )}
      <div className="mt-4 space-y-4">
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Программ опубликовано (по странам ниже)" value={running ? `${nf.format(total)}…` : nf.format(total)} />
          <Stat label="Заведений всего" value={institutions ? nf.format(institutions.total) : '…'} />
          <Stat label="Заведений без программ" value={institutions && allChecked ? `${nf.format(institutions.total - withProgrammes)} (${pct(institutions.total - withProgrammes, institutions.total)}%)` : institutions && !running ? `около ${nf.format(institutions.total - withProgrammes)}` : '…'} />
          <Stat label="Программ ждёт проверки" value={num(drafts)} />
        </dl>
        <div className="rounded-xl border border-line bg-surface p-4">
          <h3 className="font-semibold">По уровням</h3>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            {LEVELS.map((l) => (
              <li key={l}>{LEVEL_RU[l]}: <span className="font-medium tabular-nums">{num(levels[l])}</span></li>
            ))}
          </ul>
        </div>
        {running && <p role="status" className="text-sm text-muted">Считаю страны: {checked.size} из {KNOWN_COUNTRIES.length}…</p>}
        <div className="overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="p-3 text-start font-medium">Страна</th>
                <th className="p-3 text-end font-medium">Заведений (с программами / всего)</th>
                <th className="p-3 text-end font-medium">Программ</th>
                <th className="p-3 text-start font-medium">Цена</th>
                <th className="p-3 text-start font-medium">Срок подачи</th>
                <th className="p-3 text-start font-medium">Язык</th>
                <th className="p-3 text-start font-medium">Направление</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.country} className="border-b border-line last:border-0">
                  <td className="p-3 font-medium">{countryRu(c.country)}</td>
                  <td className="p-3 text-end tabular-nums">{nf.format(c.institutions_with_programmes)} / {nf.format(institutions?.by_country[c.country] ?? 0)}</td>
                  <td className="p-3 text-end tabular-nums">{nf.format(c.programmes)}</td>
                  <td className="p-3"><Bar value={pct(c.priced, c.programmes)} /></td>
                  <td className="p-3"><Bar value={pct(c.with_deadline, c.programmes)} /></td>
                  <td className="p-3"><Bar value={pct(c.with_language, c.programmes)} /></td>
                  <td className="p-3"><Bar value={pct(c.with_field, c.programmes)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!running && institutions && !allChecked && (
          <p>
            <button type="button" className={btn} disabled={checkingOthers} onClick={checkOthers}>
              {checkingOthers ? 'Проверяю остальные страны…' : 'Проверить остальные страны (около минуты)'}
            </button>
            <span className="ms-3 text-sm text-muted">Выше только страны, для которых мы загружали программы; здесь проверятся все.</span>
          </p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-text">{value}</dd>
    </div>
  );
}

// ------------------------------------------------------------------ popular institutions
export function TopInstitutions() {
  const [days, setDays] = useState(30);
  const { data, error, loading } = useRpc<Row[]>(() => getSupabaseBrowser()!.rpc('admin_top_institutions', { p_days: days }), [days]);
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Популярные заведения</h2>
        <select className={input} aria-label="Период" value={days} onChange={(e) => setDays(Number(e.target.value))}>
          <option value={7}>7 дней</option>
          <option value={30}>30 дней</option>
          <option value={90}>90 дней</option>
          <option value={365}>Год</option>
        </select>
      </div>
      <p className="mt-1 text-sm text-muted">Какие страницы заведений смотрят и откуда нажимают «Подать заявку». Считаются только посетители, принявшие cookie. Это основа для разговора с заведениями о партнёрстве.</p>
      <Status error={error} loading={loading} />
      {data && data.length === 0 && <p className="mt-3">За этот период пока нет просмотров.</p>}
      {data && data.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="p-3 text-start font-medium">Заведение</th>
                <th className="p-3 text-start font-medium">Страна</th>
                <th className="p-3 text-end font-medium">Просмотров</th>
                <th className="p-3 text-end font-medium">Посетителей</th>
                <th className="p-3 text-end font-medium">Нажатий «Подать заявку»</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => (
                <tr key={`${r.country}/${r.slug}`} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <Link href={`/institutions/${String(r.country).toLowerCase()}/${String(r.slug)}`} className="font-medium underline underline-offset-4">{String(r.name ?? r.slug)}</Link>
                  </td>
                  <td className="p-3">{countryRu(r.country)}</td>
                  <td className="p-3 text-end tabular-nums">{String(r.views)}</td>
                  <td className="p-3 text-end tabular-nums">{String(r.visitors)}</td>
                  <td className="p-3 text-end tabular-nums">{String(r.clicks)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------------ system status
interface SystemInfo {
  database_bytes: number;
  tables: { name: string; bytes: number; rows: number }[];
  events_last_30_days: number;
  users: number;
}
const FREE_PLAN_BYTES = 500 * 1024 * 1024; // the free Supabase plan: 500 MB of database
const mb = (b: number) => `${(b / 1024 / 1024).toFixed(b < 10 * 1024 * 1024 ? 1 : 0)} МБ`;

export function SystemStatus() {
  const { data, error, loading, reload } = useRpc<SystemInfo>(() => getSupabaseBrowser()!.rpc('admin_system'), []);
  const [health, setHealth] = useState<{ ok: boolean; ms: number } | null>(null);
  const [checking, setChecking] = useState(false);
  const ping = useCallback(async () => {
    setChecking(true);
    const t0 = performance.now();
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const body = (await res.json()) as { ok?: boolean };
      setHealth({ ok: res.ok && body.ok === true, ms: Math.round(performance.now() - t0) });
    } catch {
      setHealth({ ok: false, ms: Math.round(performance.now() - t0) });
    } finally {
      setChecking(false);
    }
  }, []);
  const used = data ? pct(data.database_bytes, FREE_PLAN_BYTES) : 0;
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Состояние сайта</h2>
        <button type="button" className={btn} onClick={reload}>Обновить</button>
      </div>
      <div className="mt-4 rounded-xl border border-line bg-surface p-4">
        <h3 className="font-semibold">Проверка сайта и базы</h3>
        <p className="mt-1 text-sm text-muted">Запрашивает /api/health: сайт отвечает и читает базу.</p>
        <p className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" className={btnPrimary} onClick={ping} disabled={checking}>{checking ? 'Проверяю…' : 'Проверить сейчас'}</button>
          {health && (
            <span role="status" className={health.ok ? 'font-medium' : 'font-medium text-danger'}>
              {health.ok ? `Всё работает, ответ за ${health.ms} мс` : `Проблема: сайт или база не ответили (${health.ms} мс)`}
            </span>
          )}
        </p>
      </div>
      <Status error={error} loading={loading} />
      {data && (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-line bg-surface p-4">
            <h3 className="font-semibold">Размер базы данных</h3>
            <p className="mt-1 text-2xl font-semibold">{mb(data.database_bytes)} <span className="text-base font-normal text-muted">из {mb(FREE_PLAN_BYTES)} на бесплатном плане ({used}%)</span></p>
            <div className="mt-2 h-2 rounded-full bg-surface-strong" aria-hidden="true">
              <div className={`h-2 rounded-full ${used >= 85 ? 'bg-danger' : used >= 60 ? 'bg-gold' : 'bg-accent'}`} style={{ width: `${Math.min(100, Math.max(2, used))}%` }} />
            </div>
            {used >= 80 && <p role="alert" className="mt-2 text-sm text-danger">База почти заполнена: перейдите на платный план Supabase или удалите старые события (site_events).</p>}
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Stat label="Событий посещаемости за 30 дней" value={nf.format(data.events_last_30_days)} />
            <Stat label="Аккаунтов" value={nf.format(data.users)} />
          </dl>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            <table className="w-full min-w-[420px] text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="p-3 text-start font-medium">Самые большие таблицы</th>
                  <th className="p-3 text-end font-medium">Размер</th>
                  <th className="p-3 text-end font-medium">Строк (примерно)</th>
                </tr>
              </thead>
              <tbody>
                {data.tables.map((t) => (
                  <tr key={t.name} className="border-b border-line last:border-0">
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3 text-end tabular-nums">{mb(t.bytes)}</td>
                    <td className="p-3 text-end tabular-nums">{t.rows >= 0 ? nf.format(t.rows) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

// ------------------------------------------------------------------ duplicates
interface DupGroup {
  country: string;
  name: string;
  n: number;
  items: { slug: string; type: string; city: string | null; programmes: number }[];
}

export function Duplicates() {
  const { data, error, loading, reload } = useRpc<DupGroup[]>(() => getSupabaseBrowser()!.rpc('admin_duplicates'), []);
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Возможные дубликаты</h2>
        <button type="button" className={btn} onClick={reload}>Обновить</button>
      </div>
      <p className="mt-1 text-sm text-muted">Заведения с одинаковым английским названием в одной стране. Часть из них — разные кампусы или филиалы, часть — настоящие дубли. Откройте страницы, сравните, и если это дубль, оставьте тот, у которого больше программ (правка в разделе «Вузы и школы»).</p>
      <Status error={error} loading={loading} />
      {data && data.length === 0 && <p className="mt-3">Дубликатов по названию не найдено.</p>}
      {data && data.length > 0 && (
        <ul className="mt-4 space-y-3">
          {data.map((g) => (
            <li key={`${g.country}|${g.name}`} className="rounded-xl border border-line bg-surface p-4">
              <p className="font-semibold">{g.name} <span className="font-normal text-muted">· {countryRu(g.country)} · {g.n}</span></p>
              <ul className="mt-2 space-y-1 text-sm">
                {g.items.map((i) => (
                  <li key={i.slug}>
                    <Link href={`/institutions/${g.country.toLowerCase()}/${i.slug}`} className="underline underline-offset-4">{i.slug}</Link>
                    <span className="text-muted"> · {i.type}{i.city ? ` · ${i.city}` : ''} · программ: {i.programmes}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ------------------------------------------------------------------ error reports
const REPORT_STATUS: Record<string, string> = { new: 'Новое', in_progress: 'В работе', done: 'Исправлено', rejected: 'Отклонено' };

export function ErrorReports() {
  const [status, setStatus] = useState('new');
  const { data, error, loading, reload } = useRpc<Row[]>(
    () => {
      let q = getSupabaseBrowser()!.from('error_reports').select('id, created_at, path, note, contact, locale, status, admin_note').order('created_at', { ascending: false }).limit(50);
      if (status) q = q.eq('status', status);
      return q;
    },
    [status],
  );
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Жалобы на ошибки</h2>
        <select className={input} aria-label="Статус" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Все</option>
          {Object.entries(REPORT_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>
      <p className="mt-1 text-sm text-muted">Сообщения от посетителей из ссылки «Сообщить об ошибке на этой странице». Если человек оставил почту, ответьте ему и поставьте статус.</p>
      <Status error={error} loading={loading} />
      {data && data.length === 0 && <p className="mt-3">Жалоб в этом статусе нет.</p>}
      {data && (
        <ul className="mt-4 space-y-3">
          {data.map((r) => (
            <ReportItem key={String(r.id)} row={r} onSaved={reload} />
          ))}
        </ul>
      )}
    </section>
  );
}

function ReportItem({ row, onSaved }: { row: Row; onSaved: () => void }) {
  const [status, setStatus] = useState(String(row.status));
  const [note, setNote] = useState(String(row.admin_note ?? ''));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const path = String(row.path ?? '');
  const save = async () => {
    setSaving(true);
    setMessage(null);
    const { error } = await getSupabaseBrowser()!.from('error_reports').update({ status, admin_note: note.trim() || null }).eq('id', row.id as string);
    setSaving(false);
    if (error) setMessage(`Ошибка: ${error.message}`);
    else {
      setMessage('Сохранено');
      onSaved();
    }
  };
  return (
    <li className="rounded-xl border border-line bg-surface p-4">
      <p className="text-sm text-muted">
        {new Date(String(row.created_at)).toLocaleString('ru')} · {String(row.locale ?? '—')} ·{' '}
        <a href={path} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">{path}</a>
      </p>
      <p className="mt-2 whitespace-pre-line">{String(row.note)}</p>
      {row.contact ? <p className="mt-1 text-sm">Связь: {String(row.contact)}</p> : null}
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-muted">Статус</span>
          <select className={input} value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(REPORT_STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <label className="min-w-[200px] flex-1 text-sm">
          <span className="mb-1 block text-muted">Заметка (видите только вы)</span>
          <input className={`${input} w-full`} value={note} maxLength={1500} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button type="button" className={btnPrimary} disabled={saving} onClick={save}>{saving ? 'Сохраняю…' : 'Сохранить'}</button>
      </div>
      {message && <p role="status" className="mt-2 text-sm">{message}</p>}
    </li>
  );
}

// ------------------------------------------------------------------ export
const csvCell = (v: unknown): string => {
  const s = v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function download(filename: string, header: string[], rows: Row[]) {
  const text = [header.join(','), ...rows.map((r) => header.map((h) => csvCell(r[h])).join(','))].join('\r\n');
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }); // the BOM makes Excel read the letters right
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** All rows of a query, 1000 at a time (the database returns at most 1000 rows per request). */
async function readAll(page: (from: number, to: number) => PromiseLike<{ data: unknown[] | null; error: { message: string } | null }>, onProgress: (n: number) => void): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += 1000) {
    let res = await page(from, from + 999);
    for (let retry = 0; retry < 3 && res.error && /timeout/i.test(res.error.message); retry++) res = await page(from, from + 999);
    if (res.error) throw new Error(res.error.message);
    out.push(...((res.data ?? []) as Row[]));
    onProgress(out.length);
    if ((res.data ?? []).length < 1000) break;
  }
  return out;
}

export function ExportData() {
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [country, setCountry] = useState('DE');
  const countries = useMemo(() => ['AU', 'CZ', 'DE', 'FI', 'GB', 'NL', 'TR', 'US', 'KZ', 'AM', 'KG', 'UZ', 'GE', 'AZ', 'PL', 'HU'], []);

  const run = async (name: string, job: () => Promise<{ file: string; header: string[]; rows: Row[] }>) => {
    setBusy(name);
    setMessage('Читаю данные…');
    try {
      const { file, header, rows } = await job();
      download(file, header, rows);
      setMessage(`Готово: ${rows.length} строк, файл «${file}» скачан.`);
    } catch (e) {
      setMessage(`Ошибка: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy('');
    }
  };
  const progress = (n: number) => setMessage(`Прочитано строк: ${n}…`);
  const db = () => getSupabaseBrowser()!;
  const today = new Date().toISOString().slice(0, 10);
  const flat = (r: Row, extra: Row) => ({ ...r, ...extra });

  return (
    <section>
      <h2 className="text-xl font-semibold">Экспорт данных</h2>
      <p className="mt-1 text-sm text-muted">Скачать данные в файл CSV (открывается в Excel). Это ваша резервная копия справочных данных: перед большой загрузкой или правкой стоит скачать. Данные пользователей (почты, даты рождения) здесь не выгружаются.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" className={btn} disabled={!!busy} onClick={() => run('inst', async () => {
          const rows = await readAll((a, b) => db().from('institutions').select('slug, type, country, city, names, website, ownership, founded_year, status').order('country').order('slug').range(a, b), progress);
          return { file: `yourhei-institutions-${today}.csv`, header: ['slug', 'type', 'country', 'city', 'names', 'website', 'ownership', 'founded_year', 'status'], rows };
        })}>Заведения (все)</button>
        <button type="button" className={btn} disabled={!!busy} onClick={() => run('sch', async () => {
          const rows = await readAll((a, b) => db().from('scholarships').select('names, scope, host_country, covers, levels, url, eligible_countries, status').range(a, b), progress).catch(async () =>
            readAll((a, b) => db().from('scholarships').select('names, scope, host_country, covers, levels, url, status').range(a, b), progress));
          return { file: `yourhei-scholarships-${today}.csv`, header: ['names', 'scope', 'host_country', 'covers', 'levels', 'url', 'eligible_countries', 'status'], rows };
        })}>Стипендии</button>
        <button type="button" className={btn} disabled={!!busy} onClick={() => run('cd', async () => {
          const rows = await readAll((a, b) => db().from('country_data').select('country, currency, academic_year_start, work_during_study, post_study_work_visa, recognition, cost_of_living, summary, official_urls, status').range(a, b), progress);
          return { file: `yourhei-countries-${today}.csv`, header: ['country', 'currency', 'academic_year_start', 'work_during_study', 'post_study_work_visa', 'recognition', 'cost_of_living', 'summary', 'official_urls', 'status'], rows };
        })}>Данные стран</button>
        <button type="button" className={btn} disabled={!!busy} onClick={() => run('rep', async () => {
          const rows = await readAll((a, b) => db().from('error_reports').select('created_at, path, note, contact, locale, status, admin_note').order('created_at', { ascending: false }).range(a, b), progress);
          return { file: `yourhei-error-reports-${today}.csv`, header: ['created_at', 'path', 'note', 'contact', 'locale', 'status', 'admin_note'], rows };
        })}>Жалобы на ошибки</button>
      </div>
      <div className="mt-4 rounded-xl border border-line bg-surface p-4">
        <h3 className="font-semibold">Программы одной страны</h3>
        <p className="mt-1 text-sm text-muted">Для большой страны (США, Великобритания) выгрузка может занять минуту-две.</p>
        <p className="mt-3 flex flex-wrap items-center gap-3">
          <select className={input} aria-label="Страна" value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map((c) => (
              <option key={c} value={c}>{countryRu(c)}</option>
            ))}
          </select>
          <button type="button" className={btnPrimary} disabled={!!busy} onClick={() => run('prog', async () => {
            const rows = await readAll((a, b) => db().from('programs').select('id, names, level, isced_f, languages, duration_years, format, tuition, free, application_url, academic_year, status, institutions!inner(slug, country)').eq('institutions.country', country).order('id').range(a, b), progress);
            const flatRows = rows.map((r) => flat(r, { institution: (r.institutions as Row | undefined)?.slug ?? '' }));
            return { file: `yourhei-programmes-${country}-${today}.csv`, header: ['institution', 'id', 'names', 'level', 'isced_f', 'languages', 'duration_years', 'format', 'tuition', 'free', 'application_url', 'academic_year', 'status'], rows: flatRows };
          })}>Скачать программы</button>
        </p>
      </div>
      {message && <p role="status" className="mt-4">{message}</p>}
    </section>
  );
}
