'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { inputClass, primaryButton, secondaryButton } from '@/components/forms/ui';
import { Link, useRouter } from '@/i18n/navigation';
import { buildProgrammeRow, CABINET_LEVELS, PERIODS, type CabinetPeriod, type Deadline, type ProgrammeError, type ProgrammeForm, type TuitionLine } from '@/lib/cabinet/programme';
import { pickLocalized } from '@/lib/institutions/localized';
import { safeHttpUrl } from '@/lib/safe-url';
import { getSupabaseBrowser } from '@/lib/supabase/client';

type Row = Record<string, unknown>;
const rec = (v: unknown): Row => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Row) : {});
const texts = (v: unknown): Record<string, string> => Object.fromEntries(Object.entries(rec(v)).filter(([, x]) => typeof x === 'string')) as Record<string, string>;

interface Mine {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  institution: { id: string; slug: string; country: string; names: Record<string, string> };
}
type State = { kind: 'loading' } | { kind: 'failed' } | { kind: 'ready'; requests: Mine[] };

/** The institution's account: edit the card and the programmes (prices, deadlines, links) yourself. */
export function CabinetApp() {
  const t = useTranslations('Cabinet');
  const router = useRouter();
  const locale = useLocale();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [chosen, setChosen] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      router.replace('/login');
      return;
    }
    (async () => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) {
          router.replace('/login?next=%2Fcabinet');
          return;
        }
        const { data, error } = await supabase.from('institution_reps').select('id, status, institutions (id, slug, country, names)').eq('user_id', user.user.id).order('created_at', { ascending: false });
        if (error) throw error;
        const requests = ((data ?? []) as Row[]).flatMap((r): Mine[] => {
          const i = rec(r.institutions);
          const status = r.status;
          if (typeof i.id !== 'string' || (status !== 'pending' && status !== 'approved' && status !== 'rejected')) return [];
          return [{ id: String(r.id), status, institution: { id: i.id, slug: String(i.slug), country: String(i.country), names: texts(i.names) } }];
        });
        setState({ kind: 'ready', requests });
      } catch (error) {
        console.error('[cabinet] could not load', error);
        setState({ kind: 'failed' });
      }
    })();
  }, [router]);

  if (state.kind === 'loading') return <p className="text-muted">{t('loading')}</p>;
  if (state.kind === 'failed') return <p role="alert" className="rounded-lg border border-danger p-4 font-medium text-danger">{t('failed')}</p>;

  const approved = state.requests.filter((r) => r.status === 'approved');
  const waiting = state.requests.filter((r) => r.status !== 'approved');
  const current = approved.find((r) => r.institution.id === chosen) ?? approved[0] ?? null;

  return (
    <div className="space-y-8">
      {waiting.length > 0 && (
        <ul className="space-y-2 text-sm">
          {waiting.map((r) => (
            <li key={r.id} className="rounded-lg border border-line bg-surface px-4 py-3">
              {t(`request.${r.status === 'pending' ? 'pending' : 'rejected'}`, { name: pickLocalized(r.institution.names, locale).text })}
            </li>
          ))}
        </ul>
      )}
      {!current ? (
        <section className="rounded-lg border border-line bg-surface p-6">
          <p>{t('none')}</p>
          <Link href="/catalog" className={`${primaryButton} mt-4`}>{t('findInstitution')}</Link>
        </section>
      ) : (
        <>
          {approved.length > 1 && (
            <label className="block text-sm font-semibold text-text">
              {t('institution')}
              <select value={current.institution.id} onChange={(e) => setChosen(e.target.value)} className={`${inputClass} mt-1 font-normal`}>
                {approved.map((r) => (
                  <option key={r.id} value={r.institution.id}>{pickLocalized(r.institution.names, locale).text}</option>
                ))}
              </select>
            </label>
          )}
          <h2 className="text-2xl font-semibold text-text">
            <Link href={`/institutions/${current.institution.country.toLowerCase()}/${current.institution.slug}`} className="underline-offset-4 hover:underline">
              {pickLocalized(current.institution.names, locale).text}
            </Link>
          </h2>
          <CardEditor key={`card-${current.institution.id}`} institutionId={current.institution.id} />
          <Programmes key={`prog-${current.institution.id}`} institutionId={current.institution.id} />
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ the institution card
function CardEditor({ institutionId }: { institutionId: string }) {
  const t = useTranslations('Cabinet.card');
  const [website, setWebsite] = useState('');
  const [dorm, setDorm] = useState<'' | 'yes' | 'no'>('');
  const [desc, setDesc] = useState({ original: '', en: '', ru: '' });
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<'saved' | 'failed' | 'url' | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    (async () => {
      const { data } = (await supabase?.from('institutions').select('website, dormitory, description').eq('id', institutionId).maybeSingle()) ?? { data: null };
      const r = rec(data);
      setWebsite(typeof r.website === 'string' ? r.website : '');
      setDorm(r.dormitory === true ? 'yes' : r.dormitory === false ? 'no' : '');
      const d = texts(r.description);
      setDesc({ original: d.original ?? '', en: d.en ?? '', ru: d.ru ?? '' });
      setLoaded(true);
    })();
  }, [institutionId]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const url = website.trim() === '' ? null : safeHttpUrl(website.trim());
    if (website.trim() !== '' && !url) return setMessage('url');
    const current = await supabase.from('institutions').select('description').eq('id', institutionId).maybeSingle();
    const description = { ...texts(rec(current.data).description), ...Object.fromEntries(Object.entries(desc).filter(([, v]) => v.trim() !== '').map(([k, v]) => [k, v.trim()])) };
    const { error } = await supabase.from('institutions').update({ website: url, dormitory: dorm === '' ? null : dorm === 'yes', description }).eq('id', institutionId);
    setMessage(error ? 'failed' : 'saved');
  }

  if (!loaded) return null;
  return (
    <form onSubmit={save} className="space-y-4 rounded-lg border border-line bg-surface p-5" noValidate>
      <h3 className="text-lg font-semibold text-text">{t('title')}</h3>
      <label className="block text-sm font-semibold text-text">
        {t('website')}
        <input value={website} onChange={(e) => setWebsite(e.target.value)} inputMode="url" placeholder="https://" className={`${inputClass} mt-1 font-normal`} />
      </label>
      <label className="block text-sm font-semibold text-text">
        {t('dormitory')}
        <select value={dorm} onChange={(e) => setDorm(e.target.value as '' | 'yes' | 'no')} className={`${inputClass} mt-1 font-normal`}>
          <option value="">{t('unknown')}</option>
          <option value="yes">{t('yes')}</option>
          <option value="no">{t('no')}</option>
        </select>
      </label>
      {(['en', 'ru', 'original'] as const).map((k) => (
        <label key={k} className="block text-sm font-semibold text-text">
          {t(`description.${k}`)}
          <textarea value={desc[k]} onChange={(e) => setDesc({ ...desc, [k]: e.target.value })} rows={3} maxLength={1500} className="mt-1 w-full rounded-xl border border-line-strong bg-bg p-3 font-normal text-text" />
        </label>
      ))}
      {message && <p role={message === 'saved' ? 'status' : 'alert'} className={`text-sm font-medium ${message === 'saved' ? 'text-text' : 'text-danger'}`}>{t(`message.${message}`)}</p>}
      <button type="submit" className={primaryButton}>{t('save')}</button>
    </form>
  );
}

// ------------------------------------------------------------------ programmes
interface Programme {
  id: string;
  names: Record<string, string>;
  level: string;
  languages: string[];
  durationYears: number | null;
  free: boolean;
  tuition: TuitionLine[];
  deadlines: Deadline[];
  applicationUrl: string | null;
  byInstitution: boolean;
}

const EMPTY_FORM: ProgrammeForm = { nameEn: '', nameOriginal: '', level: 'bachelor', languages: 'en', durationYears: '', free: false, amount: '', currency: 'USD', period: 'year', deadline: '', applicationUrl: '' };

function toForm(p: Programme): ProgrammeForm {
  const line = p.tuition.find((x) => x.applies_to === 'international') ?? p.tuition.find((x) => x.applies_to === 'all') ?? null;
  const deadline = p.deadlines.find((d) => d.applies_to === 'international')?.date ?? '';
  return {
    nameEn: p.names.en ?? '',
    nameOriginal: p.names.original ?? '',
    level: p.level,
    languages: p.languages.join(', '),
    durationYears: p.durationYears === null ? '' : String(p.durationYears),
    free: p.free,
    amount: line?.amount != null ? String(line.amount) : '',
    currency: line?.currency ?? 'USD',
    period: (PERIODS as readonly string[]).includes(line?.period ?? '') ? (line?.period as CabinetPeriod) : 'year',
    deadline,
    applicationUrl: p.applicationUrl ?? '',
  };
}

function Programmes({ institutionId }: { institutionId: string }) {
  const t = useTranslations('Cabinet.programmes');
  const locale = useLocale();
  const [list, setList] = useState<Programme[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [limit, setLimit] = useState(30);

  const reload = useCallback(async () => {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { data } = await supabase.from('programs').select('id, names, level, languages, duration_years, free, tuition, deadlines, application_url, requirements').eq('institution_id', institutionId).order('level').order('id').limit(500);
    setList(
      ((data ?? []) as Row[]).map((r) => ({
        id: String(r.id),
        names: texts(r.names),
        level: String(r.level),
        languages: Array.isArray(r.languages) ? r.languages.filter((l): l is string => typeof l === 'string') : [],
        durationYears: typeof r.duration_years === 'number' ? r.duration_years : r.duration_years != null ? Number(r.duration_years) : null,
        free: r.free === true,
        tuition: (Array.isArray(r.tuition) ? r.tuition : []) as TuitionLine[],
        deadlines: (Array.isArray(r.deadlines) ? r.deadlines : []) as Deadline[],
        applicationUrl: typeof r.application_url === 'string' ? r.application_url : null,
        byInstitution: rec(r.requirements).source === 'institution',
      })),
    );
  }, [institutionId]);

  useEffect(() => {
    (async () => {
      await reload();
    })();
  }, [reload]);

  return (
    <section aria-labelledby="cab-programmes" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id="cab-programmes" className="text-lg font-semibold text-text">{t('title')}</h3>
        <button type="button" onClick={() => setAdding(true)} className={secondaryButton}>{t('add')}</button>
      </div>
      <p className="text-sm text-muted">{t('note')}</p>
      {adding && (
        <ProgrammeEditor
          institutionId={institutionId}
          initial={EMPTY_FORM}
          onDone={async (changed) => {
            setAdding(false);
            if (changed) await reload();
          }}
        />
      )}
      {list === null ? (
        <p className="text-muted">{t('loading')}</p>
      ) : list.length === 0 ? (
        <p className="rounded-lg border border-line bg-surface p-4">{t('empty')}</p>
      ) : (
        <>
          <ul className="space-y-3">
            {list.slice(0, limit).map((p) => (
              <ProgrammeItem key={p.id} programme={p} locale={locale} onChanged={reload} />
            ))}
          </ul>
          {list.length > limit && (
            <button type="button" className={secondaryButton} onClick={() => setLimit(limit + 30)}>{t('more')}</button>
          )}
        </>
      )}
    </section>
  );
}

function ProgrammeItem({ programme, locale, onChanged }: { programme: Programme; locale: string; onChanged: () => Promise<void> }) {
  const t = useTranslations('Cabinet.programmes');
  const [editing, setEditing] = useState(false);
  const name = pickLocalized(programme.names, locale).text;
  const price = programme.free ? t('free') : programme.tuition.find((x) => x.applies_to === 'international' || x.applies_to === 'all');

  async function remove() {
    if (!window.confirm(t('confirmDelete', { name }))) return;
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    const { error } = await supabase.from('programs').delete().eq('id', programme.id);
    if (!error) await onChanged();
  }

  return (
    <li className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-text">{name}</p>
          <p className="text-sm text-muted">
            {typeof price === 'string' ? price : price?.amount != null ? `${price.amount} ${price.currency} / ${price.period}` : t('noPrice')}
            {programme.byInstitution ? ` · ${t('byYou')}` : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setEditing((v) => !v)} className="inline-flex h-9 items-center rounded-lg border border-line-strong px-3 text-sm hover:bg-surface-strong">{editing ? t('close') : t('edit')}</button>
          {programme.byInstitution && (
            <button type="button" onClick={remove} className="inline-flex h-9 items-center rounded-lg border border-line-strong px-3 text-sm hover:bg-surface-strong">{t('delete')}</button>
          )}
        </div>
      </div>
      {editing && (
        <div className="mt-4">
          <ProgrammeEditor
            programme={programme}
            initial={toForm(programme)}
            onDone={async (changed) => {
              setEditing(false);
              if (changed) await onChanged();
            }}
          />
        </div>
      )}
    </li>
  );
}

function ProgrammeEditor({ institutionId, programme, initial, onDone }: { institutionId?: string; programme?: Programme; initial: ProgrammeForm; onDone: (changed: boolean) => Promise<void> }) {
  const t = useTranslations('Cabinet.programmes');
  const tLevel = useTranslations('Survey.q.level.options');
  const [form, setForm] = useState<ProgrammeForm>(initial);
  const [errors, setErrors] = useState<ProgrammeError[]>([]);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ProgrammeForm>(k: K, v: ProgrammeForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  const err = (k: ProgrammeError) => errors.includes(k);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const built = buildProgrammeRow(form, programme ? { names: programme.names, tuition: programme.tuition, deadlines: programme.deadlines } : {});
    if (!built.ok) return setErrors(built.errors);
    setErrors([]);
    setFailed(false);
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    // The database marks the programme as entered by the institution and publishes it (migration 0011).
    const { error } = programme
      ? await supabase.from('programs').update(built.row).eq('id', programme.id)
      : await supabase.from('programs').insert({ ...built.row, institution_id: institutionId, format: 'on_campus', intakes: [], requirements: {}, status: 'published' });
    setBusy(false);
    if (error) return setFailed(true);
    await onDone(true);
  }

  const fieldClass = (k: ProgrammeError) => `${inputClass} mt-1 font-normal ${err(k) ? 'border-danger' : ''}`;
  return (
    <form onSubmit={save} className="space-y-3 rounded-lg border border-line-strong bg-bg p-4" noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm font-semibold text-text">
          {t('nameEn')}
          <input value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} className={fieldClass('name')} />
        </label>
        <label className="block text-sm font-semibold text-text">
          {t('nameOriginal')}
          <input value={form.nameOriginal} onChange={(e) => set('nameOriginal', e.target.value)} className={fieldClass('name')} />
        </label>
        <label className="block text-sm font-semibold text-text">
          {t('level')}
          <select value={form.level} onChange={(e) => set('level', e.target.value)} className={fieldClass('level')}>
            {CABINET_LEVELS.map((l) => (
              <option key={l} value={l}>{tLevel.has(l as 'bachelor') ? tLevel(l as 'bachelor') : l}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-text">
          {t('languages')}
          <input value={form.languages} onChange={(e) => set('languages', e.target.value)} placeholder="en, ru" className={fieldClass('languages')} />
        </label>
        <label className="block text-sm font-semibold text-text">
          {t('duration')}
          <input value={form.durationYears} onChange={(e) => set('durationYears', e.target.value)} inputMode="decimal" className={fieldClass('duration')} />
        </label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm font-semibold text-text">
          <input type="checkbox" checked={form.free} onChange={(e) => set('free', e.target.checked)} className="size-5" />
          {t('free')}
        </label>
        {!form.free && (
          <>
            <label className="block text-sm font-semibold text-text">
              {t('amount')}
              <input value={form.amount} onChange={(e) => set('amount', e.target.value)} inputMode="decimal" className={fieldClass('amount')} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-text">
                {t('currency')}
                <input value={form.currency} onChange={(e) => set('currency', e.target.value.toUpperCase())} maxLength={3} className={fieldClass('currency')} />
              </label>
              <label className="block text-sm font-semibold text-text">
                {t('period')}
                <select value={form.period} onChange={(e) => set('period', e.target.value as CabinetPeriod)} className={fieldClass('amount')}>
                  {PERIODS.map((p) => (
                    <option key={p} value={p}>{t(`periods.${p}`)}</option>
                  ))}
                </select>
              </label>
            </div>
          </>
        )}
        <label className="block text-sm font-semibold text-text">
          {t('deadline')}
          <input type="date" value={form.deadline} onChange={(e) => set('deadline', e.target.value)} className={fieldClass('deadline')} />
        </label>
        <label className="block text-sm font-semibold text-text">
          {t('applicationUrl')}
          <input value={form.applicationUrl} onChange={(e) => set('applicationUrl', e.target.value)} inputMode="url" placeholder="https://" className={fieldClass('url')} />
        </label>
      </div>
      {errors.length > 0 && (
        <ul role="alert" className="list-disc ps-5 text-sm font-medium text-danger">
          {errors.map((k) => (
            <li key={k}>{t(`errors.${k}`)}</li>
          ))}
        </ul>
      )}
      {failed && <p role="alert" className="text-sm font-medium text-danger">{t('errors.failed')}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={primaryButton}>{t('save')}</button>
        <button type="button" onClick={() => onDone(false)} className={secondaryButton}>{t('cancel')}</button>
      </div>
    </form>
  );
}
