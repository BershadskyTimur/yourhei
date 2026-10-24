import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { DeadlineRow } from '@/lib/deadlines/deadlines';

const APPLIES = { international: 'appliesInternational', eu: 'appliesEu', all: 'appliesAll' } as const;

/** Rows of the deadline calendar: the date, the institution (a link to its page), who it is for, the levels and the number of programmes. */
export async function DeadlineList({ rows, locale, showCountry = false }: { rows: DeadlineRow[]; locale: string; showCountry?: boolean }) {
  const t = await getTranslations('Deadlines');
  const tLevel = await getTranslations('Survey.q.level.options');
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });
  const month = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
  const regions = new Intl.DisplayNames([locale], { type: 'region' });

  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={`${r.s}|${r.d}|${r.i}|${r.a}`} className="rounded-lg border border-line bg-surface p-4 sm:p-5">
          <p className="text-base font-semibold text-text">
            <time dateTime={r.d}>{date.format(new Date(`${r.d}T00:00:00Z`))}</time>
          </p>
          <h3 className="mt-1 text-lg font-semibold leading-snug text-text">
            <Link href={`/institutions/${r.c.toLowerCase()}/${r.s}`} className="underline-offset-4 hover:underline">{r.n}</Link>
          </h3>
          <p className="mt-1 text-sm text-muted">
            {[
              showCountry ? (regions.of(r.c) ?? r.c) : null,
              t(APPLIES[r.a as keyof typeof APPLIES] ?? 'appliesAll'),
              r.i ? t('intake', { month: month.format(new Date(`${r.i}-01T00:00:00Z`)) }) : null,
              r.l.map((l) => (tLevel.has(l as 'master') ? tLevel(l as 'master') : l)).join(', '),
              t('programmes', { count: r.p }),
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </li>
      ))}
    </ul>
  );
}
