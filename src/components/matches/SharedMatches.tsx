'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { primaryButton } from '@/components/forms/ui';
import { Link } from '@/i18n/navigation';
import { pickLocalized } from '@/lib/institutions/localized';
import { parseSnapshot, type SnapshotItem } from '@/lib/matches/snapshot';
import { getSupabaseBrowser } from '@/lib/supabase/client';

type State = { kind: 'loading' } | { kind: 'missing' } | { kind: 'ready'; date: string; items: SnapshotItem[] };
const GROUPS = ['safe', 'suitable', 'ambitious'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** A saved list of matching results opened with its secret link. */
export function SharedMatches({ token }: { token: string }) {
  const t = useTranslations('Matches');
  const tShared = useTranslations('Shared');
  const tLevel = useTranslations('Survey.q.level.options');
  const locale = useLocale();
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    (async () => {
      if (!supabase || !UUID.test(token)) {
        setState({ kind: 'missing' });
        return;
      }
      // anyone with the link: the database function; the owner can also open a list that is not shared
      const shared = await supabase.rpc('get_shared_matches', { p_token: token });
      let value = shared.data as { created_at?: string; items?: unknown } | null;
      if (!value) {
        const own = await supabase.from('saved_matches').select('created_at, items').eq('share_token', token).maybeSingle();
        value = own.data as { created_at?: string; items?: unknown } | null;
      }
      const items = parseSnapshot(value?.items);
      setState(value && items.length > 0 ? { kind: 'ready', date: String(value.created_at ?? ''), items } : { kind: 'missing' });
    })();
  }, [token]);

  if (state.kind === 'loading') return <p className="text-muted">{tShared('loading')}</p>;
  if (state.kind === 'missing') return <p className="rounded-lg border border-line bg-surface p-5">{tShared('missing')}</p>;

  return (
    <div className="space-y-8">
      <p className="text-muted">{tShared('from', { date: state.date ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(state.date)) : '' })}</p>
      {GROUPS.map((g) => {
        const items = state.items.filter((i) => i.group === g);
        if (items.length === 0) return null;
        return (
          <section key={g} aria-labelledby={`shared-${g}`}>
            <h2 id={`shared-${g}`} className="text-2xl font-semibold text-text">{t(`groups.${g}.title`)}</h2>
            <ul className="mt-3 space-y-3">
              {items.map((i, n) => (
                <li key={`${i.slug}-${n}`} className="flex items-start justify-between gap-3 rounded-lg border border-line bg-surface p-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-text">{pickLocalized(i.names, locale).text}</p>
                    <p className="text-sm">
                      <Link href={`/institutions/${i.country.toLowerCase()}/${i.slug}`} className="underline-offset-4 hover:underline">{pickLocalized(i.institution, locale).text}</Link>
                      <span className="text-muted"> · {regionNames.of(i.country) ?? i.country}{i.level ? ` · ${tLevel.has(i.level as 'bachelor') ? tLevel(i.level as 'bachelor') : i.level}` : ''}</span>
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-semibold text-accent-text">{i.score}%</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <div className="rounded-lg border border-line-strong bg-accent-soft p-5">
        <p className="font-semibold text-text">{tShared('cta')}</p>
        <Link href="/survey" className={`${primaryButton} mt-3`}>{tShared('ctaButton')}</Link>
      </div>
    </div>
  );
}
