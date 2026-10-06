'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { profileDocType } from '@/lib/documents';
import { pickLocalized } from '@/lib/institutions/localized';
import { rec, toProgramDetail, type Money, type ProgramDetail } from '@/lib/institutions/program-detail';
import { getSupabaseBrowser } from '@/lib/supabase/client';
import { CERTIFICATES, EXAMS, labelFor } from '@/lib/survey/references';

interface Item {
  program: ProgramDetail;
  institution: { slug: string; country: string; names: Record<string, string>; city: Record<string, string> };
}
type State = { kind: 'loading' } | { kind: 'failed' } | { kind: 'ready'; items: Item[] };

const MAX = 3;

/** Side-by-side comparison of up to 3 programmes chosen with the "Compare" buttons in the matches. */
export function CompareApp() {
  const t = useTranslations('Compare');
  const params = useSearchParams();
  const ids = (params.get('ids') ?? '').split(',').filter((x) => /^[0-9a-f-]{36}$/i.test(x)).slice(0, MAX);
  const key = ids.join(',');
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    const wanted = key ? key.split(',') : [];
    if (!supabase || wanted.length === 0) return;
    let live = true;
    supabase
      .from('programs')
      .select('id, names, level, isced_f, languages, duration_years, intakes, tuition, free, requirements, deadlines, application_fee, application_url, academic_year, status, institutions (slug, country, names, city)')
      .in('id', wanted)
      .eq('status', 'published')
      .then(({ data, error }) => {
        if (!live) return;
        if (error) return setState({ kind: 'failed' });
        const items = wanted.flatMap((id) => {
          const row = (data ?? []).map(rec).find((r) => r.id === id);
          const program = row ? toProgramDetail(row) : null;
          const inst = rec(row?.institutions);
          return program ? [{ program, institution: { slug: String(inst.slug), country: String(inst.country), names: rec(inst.names) as Record<string, string>, city: rec(inst.city) as Record<string, string> } }] : [];
        });
        setState({ kind: 'ready', items });
      });
    return () => {
      live = false;
    };
  }, [key]);

  if (ids.length > 0 && state.kind === 'loading') return <p className="text-muted">{t('loading')}</p>;
  if (state.kind === 'failed') return <p role="alert" className="rounded-lg border border-danger p-4 font-medium text-danger">{t('failed')}</p>;
  if (ids.length === 0 || state.kind !== 'ready' || state.items.length === 0) {
    return (
      <section className="rounded-lg border border-line bg-surface p-6">
        <p>{t('empty')}</p>
        <Link href="/matches" className="mt-3 inline-block font-semibold text-accent-text underline underline-offset-4">{t('back')}</Link>
      </section>
    );
  }
  return <Table items={state.items} />;
}

function Table({ items }: { items: Item[] }) {
  const t = useTranslations('Compare');
  const tInst = useTranslations('Institution');
  const tCard = useTranslations('Matches.card');
  const tDocs = useTranslations('Register.documents.items');
  const tLevel = useTranslations('Survey.q.level.options');
  const locale = useLocale();
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
  const langNames = new Intl.DisplayNames([locale], { type: 'language' });
  const money = (m: Money) => (m.amount === null ? '—' : new Intl.NumberFormat(locale, { style: 'currency', currency: m.currency, maximumFractionDigits: 0 }).format(m.amount));
  const exam = (id: string) => {
    const e = CERTIFICATES.find((c) => c.id === id) ?? EXAMS.find((x) => x.id === id);
    return e ? labelFor(e.label, locale) : id.toUpperCase();
  };
  const date = (d: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`));

  const rows: { id: string; label: string; cell: (i: Item) => React.ReactNode }[] = [
    { id: 'institution', label: t('rows.institution'), cell: (i) => <Link href={`/institutions/${i.institution.country.toLowerCase()}/${i.institution.slug}`} className="font-medium underline underline-offset-4">{pickLocalized(i.institution.names, locale).text}</Link> },
    { id: 'location', label: t('rows.location'), cell: (i) => [pickLocalized(i.institution.city, locale).text, regionNames.of(i.institution.country) ?? i.institution.country].filter(Boolean).join(', ') },
    { id: 'level', label: t('rows.level'), cell: (i) => (tLevel.has(i.program.level as 'bachelor') ? tLevel(i.program.level as 'bachelor') : i.program.level) },
    { id: 'duration', label: t('rows.duration'), cell: (i) => (i.program.durationYears ? tCard('years', { count: i.program.durationYears }) : '—') },
    { id: 'languages', label: t('rows.languages'), cell: (i) => (i.program.languages.length ? i.program.languages.map((l) => langNames.of(l) ?? l).join(', ') : '—') },
    {
      id: 'tuition',
      label: t('rows.tuition'),
      cell: (i) =>
        i.program.free ? tInst('free') : i.program.tuition.filter((x) => x.amount !== null).length === 0 ? '—' : (
          <ul className="space-y-0.5">
            {i.program.tuition.filter((x) => x.amount !== null).map((x, k) => (
              <li key={k}>{money(x)} {tInst(`per.${x.period}` as 'per.year')} ({tInst(`for.${x.appliesTo}` as 'for.all')})</li>
            ))}
          </ul>
        ),
    },
    {
      id: 'requirements',
      label: t('rows.requirements'),
      cell: (i) => {
        const lines = [
          ...i.program.minScores.map((s) => tInst('minScore', { exam: exam(s.exam), score: s.min })),
          ...(i.program.documents.length ? [`${tInst('documentsTitle')}: ${i.program.documents.map((d) => { const k = profileDocType(d); return tDocs.has(k as 'passport') ? tDocs(k as 'passport') : d; }).join(', ')}`] : []),
        ];
        return lines.length ? <ul className="space-y-0.5">{lines.map((l) => <li key={l}>{l}</li>)}</ul> : '—';
      },
    },
    { id: 'deadlines', label: t('rows.deadlines'), cell: (i) => { const d = i.program.deadlines.filter((x) => x.date); return d.length ? <ul>{d.map((x) => <li key={`${x.intake}${x.date}`}>{date(x.date as string)}</li>)}</ul> : '—'; } },
    { id: 'apply', label: t('rows.apply'), cell: (i) => (i.program.applicationUrl ? <a href={i.program.applicationUrl} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-4">{tCard('apply')}</a> : '—') },
  ];

  return (
    <div>
      <p className="text-muted">{t('intro')}</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr>
              <th scope="col" className="w-32 border-b border-line p-3 text-start"><span className="sr-only">{t('title')}</span></th>
              {items.map((i) => (
                <th key={i.program.id} scope="col" className="border-b border-line p-3 text-start align-top text-base font-semibold text-text">{pickLocalized(i.program.names, locale).text}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <th scope="row" className="border-b border-line p-3 text-start font-medium text-muted">{r.label}</th>
                {items.map((i) => (
                  <td key={i.program.id} className="border-b border-line p-3">{r.cell(i)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-6"><Link href="/matches" className="font-semibold text-accent-text underline underline-offset-4">{t('back')}</Link></p>
    </div>
  );
}
