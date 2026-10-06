'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { TypeDot } from '@/components/TypeDot';
import { primaryButton } from '@/components/forms/ui';
import { Link, useRouter } from '@/i18n/navigation';
import { pickLocalized } from '@/lib/institutions/localized';
import { isInstitutionType, type InstitutionType } from '@/lib/institutions/types';
import { profileDocType } from '@/lib/documents';
import { getSupabaseBrowser } from '@/lib/supabase/client';

interface Saved {
  id: string;
  slug: string;
  country: string;
  type: InstitutionType;
  names: Record<string, string>;
  city: Record<string, string>;
  programCount: number;
  nextDeadline: string | null;
  documents: string[];
}
type State = { kind: 'loading' } | { kind: 'failed' } | { kind: 'ready'; items: Saved[]; have: Set<string>; userId: string };

type Row = Record<string, unknown>;
const rec = (v: unknown): Row => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Row) : {});

/** "My list": the saved institutions with the next deadline and a checklist of the documents they need. */
export function FavoritesApp() {
  const t = useTranslations('Favorites');
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: 'loading' });

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
          router.replace('/login?next=%2Ffavorites');
          return;
        }
        const [fav, docs] = await Promise.all([
          supabase
            .from('favorites')
            .select('institution_id, created_at, institutions (id, slug, type, country, names, city, programs (status, deadlines, requirements))')
            .eq('user_id', user.user.id)
            .order('created_at', { ascending: false }),
          supabase.from('user_documents').select('doc_type, status').eq('user_id', user.user.id),
        ]);
        if (fav.error) throw fav.error;
        const today = new Date().toISOString().slice(0, 10);
        const items: Saved[] = (fav.data as unknown as Row[]).flatMap((f) => {
          const i = rec(f.institutions);
          if (typeof i.id !== 'string' || typeof i.type !== 'string' || !isInstitutionType(i.type)) return [];
          const programs = (Array.isArray(i.programs) ? i.programs : []).map(rec).filter((p) => p.status === 'published');
          const dates = programs.flatMap((p) => (Array.isArray(p.deadlines) ? p.deadlines : []).map((d) => rec(d).date)).filter((d): d is string => typeof d === 'string' && d >= today).sort();
          const documents = [...new Set(programs.flatMap((p) => (Array.isArray(rec(p.requirements).documents) ? (rec(p.requirements).documents as unknown[]) : [])).filter((d): d is string => typeof d === 'string').map(profileDocType))];
          return [{
            id: i.id,
            slug: String(i.slug),
            country: String(i.country),
            type: i.type,
            names: rec(i.names) as Record<string, string>,
            city: rec(i.city) as Record<string, string>,
            programCount: programs.length,
            nextDeadline: dates[0] ?? null,
            documents,
          }];
        });
        const have = new Set(((docs.data ?? []) as Row[]).filter((d) => d.status === 'have').map((d) => String(d.doc_type)));
        setState({ kind: 'ready', items, have, userId: user.user.id });
      } catch (error) {
        console.error('[favorites] could not load', error);
        setState({ kind: 'failed' });
      }
    })();
  }, [router]);

  if (state.kind === 'loading') return <p className="text-muted">{t('loading')}</p>;
  if (state.kind === 'failed') return <p role="alert" className="rounded-lg border border-danger p-4 font-medium text-danger">{t('failed')}</p>;
  return <List state={state} onRemoved={(id) => setState({ ...state, items: state.items.filter((x) => x.id !== id) })} />;
}

function List({ state, onRemoved }: { state: Extract<State, { kind: 'ready' }>; onRemoved: (id: string) => void }) {
  const t = useTranslations('Favorites');
  const tInst = useTranslations('Institution');
  const tDocs = useTranslations('Register.documents.items');
  const locale = useLocale();
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });

  if (state.items.length === 0) {
    return (
      <section className="rounded-lg border border-line bg-surface p-6">
        <p>{t('empty')}</p>
        <Link href="/" className={`${primaryButton} mt-4`}>{t('emptyCta')}</Link>
      </section>
    );
  }

  async function remove(id: string) {
    const { error } = await getSupabaseBrowser()!.from('favorites').delete().eq('user_id', state.userId).eq('institution_id', id);
    if (!error) onRemoved(id);
  }

  return (
    <ul className="space-y-4">
      {state.items.map((s) => {
        const name = pickLocalized(s.names, locale).text;
        const city = pickLocalized(s.city, locale).text;
        return (
          <li key={s.id} className="rounded-lg border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2">
                  <TypeDot type={s.type} size={20} />
                  <Link href={`/institutions/${s.country.toLowerCase()}/${s.slug}`} className="text-lg font-semibold underline-offset-4 hover:underline">{name}</Link>
                </p>
                <p className="text-sm text-muted">{[city, regionNames.of(s.country) ?? s.country].filter(Boolean).join(', ')}{s.programCount > 0 ? ` · ${tInst('programsCount', { count: s.programCount })}` : ''}</p>
              </div>
              <button type="button" onClick={() => remove(s.id)} className="inline-flex h-9 shrink-0 items-center rounded-lg border border-line-strong px-3 text-sm hover:bg-surface-strong">{t('remove')}</button>
            </div>
            <p className="mt-3 text-sm">
              {s.nextDeadline ? t('nextDeadline', { date: new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${s.nextDeadline}T00:00:00Z`)) }) : <span className="text-muted">{t('noDeadline')}</span>}
            </p>
            {s.documents.length > 0 && (
              <div className="mt-3">
                <h3 className="text-sm font-semibold text-text">{t('docsTitle')}</h3>
                <ul className="mt-1 flex flex-wrap gap-2 text-sm">
                  {s.documents.map((d) => {
                    const ok = state.have.has(d);
                    return (
                      <li key={d} className={`rounded-lg border px-2.5 py-1 ${ok ? 'border-line bg-bg' : 'border-line-strong bg-accent-soft'}`}>
                        <span aria-hidden="true">{ok ? '✓ ' : '○ '}</span>
                        {tDocs.has(d as 'passport') ? tDocs(d as 'passport') : d}
                        <span className="sr-only"> — {ok ? t('docHave') : t('docMissing')}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
