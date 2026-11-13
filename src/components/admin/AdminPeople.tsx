'use client';

import { useEffect, useState } from 'react';
import { parseUserAgent } from '@/lib/analytics/ua';
import { getSupabaseBrowser } from '@/lib/supabase/client';

// Who uses the site: the list of accounts and the log of visits (address, place, browser, pages).
// Russian only, like the rest of the admin panel. The database refuses these functions to anyone who is not an
// administrator (supabase/migrations/0042_visitor_details.sql). Passwords are not shown and cannot be: the database
// keeps only an irreversible hash of them.

type Row = Record<string, unknown>;
type Page = { total: number; rows: Row[] };

const PAGE = 50;
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
  if (!code) return '';
  try {
    return regionRu?.of(String(code)) ?? String(code);
  } catch {
    return String(code);
  }
};
const when = (v: unknown) => (v ? new Date(String(v)).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }) : '—');
const join = (parts: unknown[]) => parts.filter((p) => p !== null && p !== undefined && p !== '').map(String).join(' · ');
const DEVICE: Record<string, string> = { mobile: 'телефон', tablet: 'планшет', desktop: 'компьютер' };
const PROVIDER: Record<string, string> = { email: 'почта и пароль', google: 'Google', apple: 'Apple', facebook: 'Facebook', github: 'GitHub' };
const ROLE: Record<string, string> = { admin: 'администратор', moderator: 'модератор', institution_rep: 'представитель заведения' };
const EVENT: Record<string, string> = { catalog_search: 'поиск в каталоге', apply_click: 'нажал «Подать заявку»', matches_view: 'открыл подбор' };

/** Loads a page of a list again whenever `deps` change. */
function usePage(fn: string, args: Record<string, unknown>, deps: unknown[]) {
  const [state, setState] = useState<{ data: Page | null; error: string | null; loading: boolean }>({ data: null, error: null, loading: true });
  useEffect(() => {
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- a new request starts: show the loading state first
    setState((s) => ({ ...s, loading: true }));
    getSupabaseBrowser()!
      .rpc(fn, args)
      .then((res) => {
        if (!live) return;
        const missing = res.error && /function|does not exist|schema cache|PGRST20/i.test(res.error.message);
        setState({
          data: res.error ? null : (res.data as Page | null),
          error: res.error ? res.error.message + (missing ? ' Запустите файл 0042_visitor_details.sql в Supabase (SQL Editor).' : '') : null,
          loading: false,
        });
      });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

function Pager({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) {
  return (
    <div className="mt-3 flex items-center gap-3 text-sm">
      <button type="button" className={btn} disabled={page === 0} onClick={() => onPage(page - 1)}>Назад</button>
      <span>{total === 0 ? 0 : page * PAGE + 1}–{Math.min((page + 1) * PAGE, total)} из {total}</span>
      <button type="button" className={btn} disabled={(page + 1) * PAGE >= total} onClick={() => onPage(page + 1)}>Вперёд</button>
    </div>
  );
}

function Search({ value, placeholder, onSearch }: { value: string; placeholder: string; onSearch: (q: string) => void }) {
  const [text, setText] = useState(value);
  return (
    <form
      className="flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(text.trim());
      }}
    >
      <input className={`${input} min-w-0 flex-1 sm:max-w-sm`} placeholder={placeholder} aria-label={placeholder} value={text} onChange={(e) => setText(e.target.value)} />
      <button type="submit" className={btnPrimary}>Найти</button>
      {value && (
        <button type="button" className={btn} onClick={() => { setText(''); onSearch(''); }}>Сбросить</button>
      )}
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="break-words text-sm text-text">{children || '—'}</dd>
    </div>
  );
}

// ------------------------------------------------------------------ accounts

export function Accounts({ onShowVisits }: { onShowVisits: (email: string) => void }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const { data, error, loading } = usePage('admin_accounts', { p_search: q || null, p_limit: PAGE, p_offset: page * PAGE }, [q, page]);

  return (
    <section>
      <h2 className="text-xl font-semibold">Аккаунты</h2>
      <p className="mt-1 text-sm text-muted">
        Все зарегистрированные: почта, способ входа, адрес и браузер последнего входа, профиль и последний визит. Паролей здесь нет и быть не может: база хранит только их необратимый шифр, сам пароль не знает никто, кроме владельца аккаунта.
      </p>
      <div className="mt-3">
        <Search value={q} placeholder="Почта или начало IP-адреса" onSearch={(v) => { setQ(v); setPage(0); }} />
      </div>
      {loading && <p className="mt-3">Загрузка…</p>}
      {error && !loading && <p role="alert" className="mt-3 text-danger">Ошибка: {error}</p>}
      {data && data.rows.length === 0 && <p className="mt-4">Никого не найдено.</p>}
      <ul className="mt-4 space-y-3">
        {(data?.rows ?? []).map((a) => {
          const login = parseUserAgent(a.login_user_agent as string | null);
          const providers = (Array.isArray(a.providers) ? (a.providers as string[]) : []).map((p) => PROVIDER[p] ?? p).join(', ');
          return (
            <li key={String(a.id)} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="break-all font-semibold text-text">{String(a.email ?? '—')}</div>
                  <div className="text-sm text-muted">
                    {join([ROLE[String(a.role)] ?? null, a.plan === 'premium' ? 'премиум' : null, a.email_confirmed_at ? 'почта подтверждена' : 'почта не подтверждена'])}
                  </div>
                </div>
                {typeof a.email === 'string' && Number(a.page_views ?? 0) > 0 && (
                  <button type="button" className={btn} onClick={() => onShowVisits(String(a.email))}>Визиты</button>
                )}
              </div>
              <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Способ входа">{providers}</Field>
                <Field label="Регистрация">{when(a.created_at)}</Field>
                <Field label="Последний вход">{when(a.last_sign_in_at)}</Field>
                <Field label="IP последнего входа">{a.login_ip ? <span className="font-mono">{String(a.login_ip)}</span> : null}</Field>
                <Field label="Браузер последнего входа">{join([login.browser, login.os])}</Field>
                <Field label="Профиль">{join([countryRu(a.residence_country), a.age != null ? `${a.age} лет` : null, a.gender === 'male' ? 'муж.' : a.gender === 'female' ? 'жен.' : null])}</Field>
                <Field label="Гражданство">{(Array.isArray(a.citizenships) ? (a.citizenships as string[]) : []).map(countryRu).join(', ')}</Field>
                <Field label="Активность">{join([`страниц: ${a.page_views ?? 0}`, `опросов: ${a.surveys_completed ?? 0}`, `в избранном: ${a.favorites ?? 0}`, a.marketing_opt_in ? 'рассылка: да' : null])}</Field>
                <Field label="Последний визит">{a.visit_at ? when(a.visit_at) : ''}</Field>
                <Field label="IP последнего визита">{a.visit_ip ? <span className="font-mono">{String(a.visit_ip)}</span> : null}</Field>
                <Field label="Откуда">{join([countryRu(a.visit_country), a.visit_region, a.visit_city, a.visit_as_org])}</Field>
                <Field label="Устройство">{join([a.visit_browser, a.visit_os, DEVICE[String(a.visit_device)] ?? null])}</Field>
              </dl>
            </li>
          );
        })}
      </ul>
      {data && <Pager page={page} total={data.total} onPage={setPage} />}
    </section>
  );
}

// ------------------------------------------------------------------ visits

function VisitPages({ session }: { session: string }) {
  const [state, setState] = useState<{ rows: Row[] | null; error: string | null }>({ rows: null, error: null });
  useEffect(() => {
    let live = true;
    getSupabaseBrowser()!
      .rpc('admin_visit_pages', { p_session: session })
      .then((res) => {
        if (live) setState({ rows: res.error ? null : ((res.data as Row[] | null) ?? []), error: res.error?.message ?? null });
      });
    return () => {
      live = false;
    };
  }, [session]);
  if (state.error) return <p role="alert" className="mt-2 text-sm text-danger">Ошибка: {state.error}</p>;
  if (!state.rows) return <p className="mt-2 text-sm">Загрузка…</p>;
  return (
    <ol className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
      {state.rows.map((r, i) => {
        const meta = r.meta && typeof r.meta === 'object' ? Object.entries(r.meta as Row).map(([k, v]) => `${k}: ${String(v)}`).join(', ') : '';
        return (
          <li key={i} className="flex flex-wrap gap-x-2">
            <span className="tabular-nums text-muted">{new Date(String(r.at)).toLocaleTimeString('ru-RU')}</span>
            <span className="break-all">{String(r.path)}</span>
            {r.event !== 'page_view' && <span className="text-muted">— {EVENT[String(r.event)] ?? String(r.event)}{meta ? ` (${meta})` : ''}</span>}
          </li>
        );
      })}
    </ol>
  );
}

export function Visitors({ initialSearch = '' }: { initialSearch?: string }) {
  const [days, setDays] = useState(7);
  const [q, setQ] = useState(initialSearch);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const { data, error, loading } = usePage('admin_visits', { p_days: days, p_search: q || null, p_limit: PAGE, p_offset: page * PAGE }, [days, q, page]);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">Посетители</h2>
        <select className={input} aria-label="Период" value={days} onChange={(e) => { setDays(Number(e.target.value)); setPage(0); }}>
          <option value={1}>Сутки</option>
          <option value={7}>7 дней</option>
          <option value={30}>30 дней</option>
          <option value={90}>90 дней</option>
          <option value={365}>Год</option>
        </select>
      </div>
      <p className="mt-1 text-sm text-muted">
        Журнал визитов: одна строка — один визит, с аккаунтом или без. Страна, город, индекс, координаты и провайдер определяются по IP-адресу сетью Cloudflare: это место провайдера с точностью до города, а не дом человека. IP-адреса хранятся 3 года, потом стираются. Поисковые роботы и сама админ-панель не записываются.
      </p>
      <div className="mt-3">
        <Search key={initialSearch} value={q} placeholder="IP, город, провайдер, почта или код страны" onSearch={(v) => { setQ(v); setPage(0); }} />
      </div>
      {loading && <p className="mt-3">Загрузка…</p>}
      {error && !loading && <p role="alert" className="mt-3 text-danger">Ошибка: {error}</p>}
      {data && data.rows.length === 0 && <p className="mt-4">Визитов не найдено.</p>}
      <ul className="mt-4 space-y-3">
        {(data?.rows ?? []).map((v) => {
          const id = String(v.session);
          const hasMap = typeof v.lat === 'number' && typeof v.lon === 'number';
          return (
            <li key={id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-text">
                    <span className="font-mono">{String(v.ip ?? 'IP не записан')}</span>
                    <span className="font-normal text-muted"> · {join([countryRu(v.country), v.region, v.city]) || 'место неизвестно'}</span>
                  </div>
                  <div className="text-sm text-muted">
                    {when(v.first_at)} – {new Date(String(v.last_at)).toLocaleTimeString('ru-RU', { timeStyle: 'short' })}
                    {v.email ? <> · <span className="break-all text-text">{String(v.email)}</span></> : ' · без аккаунта'}
                  </div>
                </div>
                <button type="button" className={btn} aria-expanded={open === id} onClick={() => setOpen(open === id ? null : id)}>
                  {open === id ? 'Скрыть' : `Страницы (${Number(v.pages ?? 0) + Number(v.actions ?? 0)})`}
                </button>
              </div>
              <dl className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Браузер и система">{join([v.browser, v.os])}</Field>
                <Field label="Устройство">{join([DEVICE[String(v.device)] ?? null, v.screen ? `экран ${v.screen}` : null])}</Field>
                <Field label="Язык браузера и сайта">{join([v.lang, v.locale ? `сайт: ${v.locale}` : null])}</Field>
                <Field label="Провайдер">{join([v.as_org, v.asn ? `AS${v.asn}` : null])}</Field>
                <Field label="Индекс и часовой пояс">{join([v.postal, v.timezone])}</Field>
                <Field label="Координаты (примерно)">
                  {hasMap && (
                    <a className="underline underline-offset-4" target="_blank" rel="noopener noreferrer" href={`https://www.openstreetmap.org/?mlat=${v.lat}&mlon=${v.lon}#map=10/${v.lat}/${v.lon}`}>
                      {String(v.lat)}, {String(v.lon)}
                    </a>
                  )}
                </Field>
                <Field label="Первая страница">{String(v.entry ?? '')}</Field>
                <Field label="Откуда пришёл">{String(v.referrer ?? '') || 'прямой заход'}</Field>
              </dl>
              {typeof v.user_agent === 'string' && <p className="mt-2 break-all text-xs text-muted">{v.user_agent}</p>}
              {open === id && <VisitPages session={id} />}
            </li>
          );
        })}
      </ul>
      {data && <Pager page={page} total={data.total} onPage={setPage} />}
    </section>
  );
}
