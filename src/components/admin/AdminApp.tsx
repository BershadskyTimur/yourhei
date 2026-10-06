'use client';

import { useCallback, useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { safeHttpUrl } from '@/lib/safe-url';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase/client';

// The admin panel is an internal tool for the site owner, so it is in Russian only (not translated).
// Real protection is in the database (supabase/migrations/0006_admin.sql): without the "admin" role
// every request below is refused by Row Level Security, whatever this page shows.

type Tab = 'dashboard' | 'institutions' | 'programs' | 'countries' | 'log';
type Access = 'loading' | 'guest' | 'denied' | 'admin' | 'unconfigured';
type Row = Record<string, unknown>;

const TABS: { id: Tab; label: string }[] = [
  { id: 'dashboard', label: 'Обзор' },
  { id: 'institutions', label: 'Вузы и школы' },
  { id: 'programs', label: 'Программы на проверке' },
  { id: 'countries', label: 'Данные стран' },
  { id: 'log', label: 'Журнал изменений' },
];

const STAT_LABELS: [string, string][] = [
  ['users', 'Пользователей'],
  ['users_last_7_days', 'Новых за 7 дней'],
  ['surveys_completed', 'Пройденных опросов'],
  ['institutions', 'Учебных заведений'],
  ['institutions_published', 'С подробной карточкой'],
  ['programs', 'Программ всего'],
  ['programs_published', 'Программ опубликовано'],
  ['programs_draft', 'Программ ждёт проверки'],
  ['countries_published', 'Стран опубликовано'],
  ['countries_draft', 'Стран ждёт проверки'],
];

const btn =
  'inline-flex h-9 items-center rounded-lg border border-line-strong px-3 text-sm font-medium text-text hover:bg-surface-strong disabled:opacity-50';
const btnPrimary =
  'inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm font-semibold text-on-accent hover:opacity-90 disabled:opacity-50';
const input =
  'h-10 rounded-lg border border-line-strong bg-bg px-3 text-text focus:outline-2 focus:outline-offset-2 focus:outline-accent';

function nameOf(names: unknown): string {
  const n = (names ?? {}) as Record<string, string>;
  return n.en || n.original || n.ru || '—';
}

export function AdminApp() {
  const [access, setAccess] = useState<Access>(() => (isSupabaseConfigured() ? 'loading' : 'unconfigured'));
  const [tab, setTab] = useState<Tab>('dashboard');

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return setAccess('guest');
      const { data } = await supabase.from('profiles').select('role').eq('id', user.user.id).maybeSingle();
      setAccess(data?.role === 'admin' ? 'admin' : 'denied');
    })();
  }, []);

  if (access === 'loading') return <p>Загрузка…</p>;
  if (access === 'unconfigured') return <p>Supabase не подключён (проверьте .env.local).</p>;
  if (access === 'guest')
    return (
      <p>
        Нужно войти в аккаунт администратора. <Link href="/login" className="underline">Войти</Link>
      </p>
    );
  if (access === 'denied') return <p>Нет доступа: у этого аккаунта нет роли администратора.</p>;

  return (
    <div>
      <div role="tablist" aria-label="Разделы админ-панели" className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={tab === t.id ? btnPrimary : btn}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'institutions' && <Institutions />}
        {tab === 'programs' && <Programs />}
        {tab === 'countries' && <Countries />}
        {tab === 'log' && <AuditLog />}
      </div>
    </div>
  );
}

function useLoad<T>(load: () => Promise<{ data: T | null; error: { message: string } | null }>) {
  const [state, setState] = useState<{ data: T | null; error: string | null; loading: boolean }>({
    data: null,
    error: null,
    loading: true,
  });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let live = true;
    load().then((res) => {
      if (live) setState({ data: res.data, error: res.error?.message ?? null, loading: false });
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);
  const reload = useCallback(async () => setTick((n) => n + 1), []);
  return { ...state, reload };
}

function Status({ error, loading }: { error: string | null; loading: boolean }) {
  if (loading) return <p>Загрузка…</p>;
  if (error) return <p role="alert" className="text-danger">Ошибка: {error}</p>;
  return null;
}

function Dashboard() {
  const { data, error, loading } = useLoad<Record<string, number>>(async () => {
    const res = await getSupabaseBrowser()!.rpc('admin_stats');
    return { data: res.data as Record<string, number> | null, error: res.error };
  });
  return (
    <section>
      <h2 className="text-xl font-semibold">Обзор</h2>
      <Status error={error} loading={loading} />
      {data && (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STAT_LABELS.map(([key, label]) => (
            <div key={key} className="rounded-xl border border-line bg-surface p-4">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="mt-1 text-3xl font-semibold text-text">{data[key] ?? 0}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

const PAGE = 25;

function Institutions() {
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let live = true;
    const term = q.trim().replace(/[^\p{L}\p{N} '-]/gu, '');
    let query = getSupabaseBrowser()!
      .from('institutions')
      .select('id, slug, type, country, city, names, website, ownership, founded_year, status', { count: 'exact' })
      .order('country')
      .order('slug')
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (status) query = query.eq('status', status);
    if (term) query = query.or(`names->>en.ilike.%${term}%,names->>original.ilike.%${term}%`);
    query.then((res) => {
      if (!live) return;
      setRows((res.data as Row[]) ?? []);
      setCount(res.count ?? 0);
      setError(res.error?.message ?? null);
      setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [q, status, page, tick]);

  const load = () => setTick((n) => n + 1);

  return (
    <section>
      <h2 className="text-xl font-semibold">Вузы и школы</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          className={input}
          placeholder="Поиск по названию"
          aria-label="Поиск по названию"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
        />
        <select
          className={input}
          aria-label="Статус"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
        >
          <option value="">Любой статус</option>
          <option value="published">Опубликован</option>
          <option value="draft">Черновик</option>
        </select>
      </div>
      <Status error={error} loading={loading} />
      <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
        {rows.map((r) => (
          <li key={String(r.id)} className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div>
              <div className="font-medium">{nameOf(r.names)}</div>
              <div className="text-sm text-muted">
                {String(r.country)} · {String(r.type)} · {r.status === 'published' ? 'опубликован' : 'черновик'}
              </div>
            </div>
            <button type="button" className={btn} onClick={() => setEditing(r)}>
              Изменить
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <button type="button" className={btn} disabled={page === 0} onClick={() => setPage(page - 1)}>
          Назад
        </button>
        <span>
          {count === 0 ? 0 : page * PAGE + 1}–{Math.min((page + 1) * PAGE, count)} из {count}
        </span>
        <button type="button" className={btn} disabled={(page + 1) * PAGE >= count} onClick={() => setPage(page + 1)}>
          Вперёд
        </button>
      </div>
      {editing && (
        <InstitutionEditor
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
    </section>
  );
}

function InstitutionEditor({ row, onClose, onSaved }: { row: Row; onClose: () => void; onSaved: () => void }) {
  const names = (row.names ?? {}) as Record<string, string>;
  const [nameEn, setNameEn] = useState(names.en ?? '');
  const [nameRu, setNameRu] = useState(names.ru ?? '');
  const [website, setWebsite] = useState(String(row.website ?? ''));
  const [ownership, setOwnership] = useState(String(row.ownership ?? ''));
  const [founded, setFounded] = useState(row.founded_year ? String(row.founded_year) : '');
  const [status, setStatus] = useState(String(row.status));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function save() {
    setBusy(true);
    setError(null);
    const nextNames = { ...names, ...(nameEn ? { en: nameEn } : {}), ...(nameRu ? { ru: nameRu } : {}) };
    const yearNum = founded ? Number(founded) : null;
    if (yearNum !== null && (!Number.isInteger(yearNum) || yearNum < 500 || yearNum > new Date().getFullYear())) {
      setError('Год основания указан неверно');
      setBusy(false);
      return;
    }
    const { error: err } = await getSupabaseBrowser()!
      .from('institutions')
      .update({
        names: nextNames,
        website: website.trim() || null,
        ownership: ownership || null,
        founded_year: yearNum,
        status,
        verified_at: status === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', row.id as string);
    setBusy(false);
    if (err) setError(err.message);
    else onSaved();
  }

  async function remove() {
    setBusy(true);
    const { error: err } = await getSupabaseBrowser()!.from('institutions').delete().eq('id', row.id as string);
    setBusy(false);
    if (err) setError(err.message);
    else onSaved();
  }

  return (
    <div role="dialog" aria-modal="true" aria-label="Редактирование" className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-full w-full max-w-lg overflow-auto rounded-2xl bg-bg p-5 shadow-xl">
        <h3 className="text-lg font-semibold">{nameOf(row.names)}</h3>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-1 text-sm">
            Название (английский)
            <input className={input} value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Название (русский)
            <input className={input} value={nameRu} onChange={(e) => setNameRu(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Сайт
            <input className={input} value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
          </label>
          <label className="grid gap-1 text-sm">
            Форма собственности
            <select className={input} value={ownership} onChange={(e) => setOwnership(e.target.value)}>
              <option value="">Неизвестно</option>
              <option value="public">Государственный</option>
              <option value="private">Частный</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Год основания
            <input className={input} inputMode="numeric" value={founded} onChange={(e) => setFounded(e.target.value)} />
          </label>
          <label className="grid gap-1 text-sm">
            Статус
            <select className={input} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">Черновик</option>
              <option value="published">Опубликован (проверен)</option>
            </select>
          </label>
        </div>
        {error && <p role="alert" className="mt-3 text-danger">{error}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" className={btnPrimary} disabled={busy} onClick={save}>
            Сохранить
          </button>
          <button type="button" className={btn} onClick={onClose}>
            Отмена
          </button>
          <span className="flex-1" />
          {confirmDelete ? (
            <button type="button" className={btn} disabled={busy} onClick={remove}>
              Точно удалить вместе с программами
            </button>
          ) : (
            <button type="button" className={btn} onClick={() => setConfirmDelete(true)}>
              Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Programs() {
  const { data, error, loading, reload } = useLoad<Row[]>(async () => {
    const res = await getSupabaseBrowser()!
      .from('programs')
      .select('id, names, level, languages, duration_years, tuition, free, application_url, status, institutions(names, country)')
      .eq('status', 'draft')
      .order('created_at')
      .limit(100);
    return { data: res.data as unknown as Row[] | null, error: res.error };
  });
  const [actionError, setActionError] = useState<string | null>(null);

  async function act(id: string, kind: 'publish' | 'delete') {
    const table = getSupabaseBrowser()!.from('programs');
    const { error: err } =
      kind === 'publish'
        ? await table.update({ status: 'published', verified_at: new Date().toISOString() }).eq('id', id)
        : await table.delete().eq('id', id);
    setActionError(err?.message ?? null);
    if (!err) await reload();
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">Программы на проверке</h2>
      <p className="mt-1 text-sm text-muted">
        Публикуйте только то, что сверили с официальной страницей (ссылка есть в каждой строке). До публикации программа не видна посетителям и не участвует в подборе.
      </p>
      <Status error={error ?? actionError} loading={loading} />
      {data && data.length === 0 && <p className="mt-4">Черновиков нет.</p>}
      <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
        {(data ?? []).map((p) => {
          const inst = (p.institutions ?? {}) as Row;
          return (
            <li key={String(p.id)} className="flex flex-wrap items-center justify-between gap-2 p-3">
              <div>
                <div className="font-medium">{nameOf(p.names)}</div>
                <div className="text-sm text-muted">
                  {nameOf(inst.names)} · {String(inst.country ?? '')} · {String(p.level)} ·{' '}
                  {((p.languages as string[]) ?? []).join(', ') || 'язык не указан'}
                  {p.free ? ' · бесплатно' : ''}
                </div>
                {typeof p.application_url === 'string' && (
                  <a href={safeHttpUrl(p.application_url) ?? undefined} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                    Официальная страница
                  </a>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" className={btnPrimary} onClick={() => act(String(p.id), 'publish')}>
                  Опубликовать
                </button>
                <button type="button" className={btn} onClick={() => act(String(p.id), 'delete')}>
                  Удалить
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Countries() {
  const { data, error, loading, reload } = useLoad<Row[]>(async () => {
    const res = await getSupabaseBrowser()!.from('country_data').select('country, currency, status, verified_at').order('country');
    return { data: res.data as Row[] | null, error: res.error };
  });
  const [actionError, setActionError] = useState<string | null>(null);

  async function toggle(country: string, status: string) {
    const next = status === 'published' ? 'draft' : 'published';
    const { error: err } = await getSupabaseBrowser()!
      .from('country_data')
      .update({ status: next, verified_at: next === 'published' ? new Date().toISOString() : null })
      .eq('country', country);
    setActionError(err?.message ?? null);
    if (!err) await reload();
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">Данные стран</h2>
      <Status error={error ?? actionError} loading={loading} />
      {data && data.length === 0 && <p className="mt-4">Данных по странам пока нет.</p>}
      <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
        {(data ?? []).map((c) => (
          <li key={String(c.country)} className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div>
              <span className="font-medium">{String(c.country)}</span>{' '}
              <span className="text-sm text-muted">
                {String(c.currency ?? '')} · {c.status === 'published' ? 'опубликовано' : 'черновик'}
              </span>
            </div>
            <button type="button" className={btn} onClick={() => toggle(String(c.country), String(c.status))}>
              {c.status === 'published' ? 'Снять с публикации' : 'Опубликовать'}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AuditLog() {
  const { data, error, loading } = useLoad<Row[]>(async () => {
    const res = await getSupabaseBrowser()!.from('audit_log').select('id, at, action, table_name, row_id, details').order('at', { ascending: false }).limit(100);
    return { data: res.data as Row[] | null, error: res.error };
  });
  return (
    <section>
      <h2 className="text-xl font-semibold">Журнал изменений</h2>
      <p className="mt-1 text-sm text-muted">Последние 100 изменений, сделанных через сайт.</p>
      <Status error={error} loading={loading} />
      {data && data.length === 0 && <p className="mt-4">Пока пусто.</p>}
      <ul className="mt-4 divide-y divide-line rounded-xl border border-line text-sm">
        {(data ?? []).map((l) => (
          <li key={String(l.id)} className="p-3">
            <span className="font-medium">{String(l.action)}</span> · {String(l.table_name)} · {nameOf(((l.details as Row)?.row as Row)?.names)}
            <div className="text-muted">{new Date(String(l.at)).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
