import { getLocale, getTranslations } from 'next-intl/server';
import { pickLocalized } from '@/lib/institutions/localized';
import type { Money, ProgramDetail, TuitionLine } from '@/lib/institutions/detail';
import { profileDocType } from '@/lib/documents';
import { PriceInMyCurrency } from './PriceInMyCurrency';
import { TrackedLink } from './TrackedLink';
import { visibleDeadlines } from '@/lib/institutions/deadlines';
import { CERTIFICATES, EXAMS, labelFor } from '@/lib/survey/references';

const fmtMoney = (m: Money, locale: string): string => {
  if (m.amount === null) return '—';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: m.currency, maximumFractionDigits: 0 }).format(m.amount);
  } catch {
    return `${m.amount} ${m.currency}`;
  }
};

export function examLabel(id: string, locale: string): string {
  const e = CERTIFICATES.find((c) => c.id === id) ?? EXAMS.find((x) => x.id === id);
  return e ? labelFor(e.label, locale) : id.toUpperCase();
}

/** One programme: name, basic facts, price, requirements, deadlines and the link to apply. */
export async function ProgramCard({ program, country, slug, city }: { program: ProgramDetail; country: string; slug: string; city: Partial<Record<string, string>> }) {
  const locale = await getLocale();
  const t = await getTranslations('Institution');
  const tCard = await getTranslations('Matches.card');
  const tDocs = await getTranslations('Register.documents.items');
  const tSurvey = await getTranslations('Survey.q.level.options');
  const langNames = new Intl.DisplayNames([locale], { type: 'language' });
  const monthName = (m: string) => new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, Number(m) - 1, 1)));
  const name = pickLocalized(program.names, locale).text;
  const original = program.names.original;
  const docLabel = (d: string) => {
    const key = profileDocType(d);
    return tDocs.has(key as 'passport') ? tDocs(key as 'passport') : d;
  };

  const priceLine = (l: TuitionLine) => `${fmtMoney(l, locale)} ${t(`per.${l.period}` as 'per.year')} (${t(`for.${l.appliesTo}` as 'for.all')})`;
  const level = tSurvey.has(program.level as 'bachelor') ? tSurvey(program.level as 'bachelor') : program.level;

  const hasReq = program.minScores.length > 0 || program.documents.length > 0 || program.entrance;

  return (
    <li className="rounded-lg border border-line bg-surface p-5">
      <h3 className="text-lg font-semibold text-text">{name}</h3>
      {program.byInstitution && <p className="mt-0.5 text-xs font-medium text-accent-text">{t('byInstitution')}</p>}
      {original && original !== name && <p className="text-sm text-muted">{original}</p>}
      <p className="mt-1 text-sm text-muted">
        {[
          level,
          program.durationYears ? tCard('years', { count: program.durationYears }) : null,
          program.languages.length ? `${tCard('languages')}: ${program.languages.map((l) => langNames.of(l) ?? l).join(', ')}` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
      </p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-semibold text-text">{t('tuitionTitle')}</dt>
          <dd className="mt-1 text-sm">
            {program.free ? (
              t('free')
            ) : program.tuition.length === 0 || program.tuition.every((x) => x.amount === null) ? (
              <span className="text-muted">{tCard('tuitionUnknown')}</span>
            ) : (
              <ul className="space-y-0.5">
                {program.tuition.filter((x) => x.amount !== null).map((x, i) => (
                  <li key={i}>{priceLine(x)}</li>
                ))}
              </ul>
            )}
            {!program.free && program.tuition.some((x) => x.amount !== null) && (
              <PriceInMyCurrency tuition={program.tuition} durationYears={program.durationYears} free={program.free} country={country} city={city} />
            )}
            {program.applicationFee?.amount != null && (
              <p className="mt-1 text-muted">
                {t('applicationFee')}: {fmtMoney(program.applicationFee, locale)}
              </p>
            )}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-semibold text-text">{t('requirementsTitle')}</dt>
          <dd className="mt-1 text-sm">
            {hasReq ? (
              <ul className="space-y-0.5">
                {program.minScores.map((s) => (
                  <li key={s.exam}>{t('minScore', { exam: examLabel(s.exam, locale), score: s.min })}</li>
                ))}
                {program.entrance && <li>{t('entranceTitle')}: {program.entrance}</li>}
                {program.documents.length > 0 && <li>{t('documentsTitle')}: {program.documents.map(docLabel).join(', ')}</li>}
              </ul>
            ) : (
              <span className="text-muted">{t('noRequirements')}</span>
            )}
          </dd>
        </div>
      </dl>

      {(program.intakes.length > 0 || visibleDeadlines(program.deadlines).length > 0) && (
        <p className="mt-3 text-sm">
          {program.intakes.length > 0 && (
            <span>
              <span className="font-semibold">{t('intake')}:</span> {program.intakes.map(monthName).join(', ')}.{' '}
            </span>
          )}
          {visibleDeadlines(program.deadlines).map((d) => (
            <span key={`${d.intake}-${d.appliesTo}-${d.date}`}>
              <span className="font-semibold">{t('deadline')}:</span>{' '}
              {new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${d.date}T00:00:00Z`))}.{' '}
            </span>
          ))}
        </p>
      )}

      {program.applicationUrl && (
        <TrackedLink href={program.applicationUrl} meta={{ kind: 'program', country, slug }} className="mt-4 inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:opacity-90">
          {tCard('apply')}
        </TrackedLink>
      )}
    </li>
  );
}
