import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ProgramCard } from '@/components/ProgramCard';
import { SideAds } from '@/components/SideAds';
import { TypeDot } from '@/components/TypeDot';
import { Link } from '@/i18n/navigation';
import { getInstitutionDetail } from '@/lib/institutions/detail';
import { pickLocalized } from '@/lib/institutions/localized';

export const revalidate = 3600;

type Params = Promise<{ locale: string; country: string; slug: string }>;

const LEVEL_ORDER = ['school', 'college', 'foundation', 'bachelor', 'master', 'phd', 'language_course'];
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, country, slug } = await params;
  const institution = await getInstitutionDetail(country, slug);
  return { title: institution ? pickLocalized(institution.names, locale).text : undefined };
}

export default async function InstitutionPage({ params }: { params: Params }) {
  const { locale, country, slug } = await params;
  setRequestLocale(locale);
  const institution = await getInstitutionDetail(country, slug);
  if (!institution) notFound();

  const t = await getTranslations('Institution');
  const tTypes = await getTranslations('Types');
  const tSurvey = await getTranslations('Survey.q.level.options');
  const name = pickLocalized(institution.names, locale).text;
  const original = institution.names.original;
  const city = pickLocalized(institution.city, locale).text;
  const countryName = new Intl.DisplayNames([locale], { type: 'region' }).of(institution.country);
  const description = pickLocalized(institution.description, locale);

  const byLevel = LEVEL_ORDER.map((level) => ({ level, items: institution.programs.filter((p) => p.level === level) })).filter((g) => g.items.length > 0);
  const checked = institution.verifiedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(institution.verifiedAt))
    : null;
  const facts: [string, string][] = [];
  if (institution.ownership) facts.push([t('ownership'), t(institution.ownership)]);
  if (institution.dormitory !== null) facts.push([t('dormitory'), institution.dormitory ? t('dormitoryYes') : t('dormitoryNo')]);
  const features = institution.features.filter((f) => t.has(`features.${f}` as 'features.exchange'));

  return (
    <SideAds>
      <article className="mx-auto max-w-3xl py-12">
        <p className="flex items-center gap-3 text-sm font-medium uppercase tracking-wide text-muted">
          <TypeDot type={institution.type} />
          {tTypes(institution.type)}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text">{name}</h1>
        {original && original !== name && <p className="mt-1 text-lg text-muted">{original}</p>}
        <p className="mt-3 text-lg">{[city, countryName].filter(Boolean).join(', ')}</p>
        {institution.foundedYear && <p className="mt-1 text-muted">{t('founded', { year: institution.foundedYear })}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {institution.website && (
            <a href={institution.website} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:opacity-90">
              {t('officialSite')}
            </a>
          )}
          <FavoriteButton institutionId={institution.id} />
        </div>

        {description.text && <p className="mt-6 text-lg leading-relaxed">{description.text}</p>}

        {(facts.length > 0 || features.length > 0) && (
          <section className="mt-8" aria-labelledby="facts-title">
            <h2 id="facts-title" className="text-xl font-semibold text-text">{t('factsTitle')}</h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k} className="rounded-lg border border-line bg-surface px-4 py-3">
                  <dt className="text-sm text-muted">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
              {features.length > 0 && (
                <div className="rounded-lg border border-line bg-surface px-4 py-3">
                  <dt className="text-sm text-muted">{t('featuresTitle')}</dt>
                  <dd className="font-medium">{features.map((f) => t(`features.${f}` as 'features.exchange')).join(', ')}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        <section className="mt-10" aria-labelledby="programs-title">
          <h2 id="programs-title" className="text-xl font-semibold text-text">
            {t('programsTitle')}
            {institution.programs.length > 0 && <span className="ms-2 text-base font-normal text-muted">{t('programsCount', { count: institution.programs.length })}</span>}
          </h2>
          {byLevel.length === 0 ? (
            <p className="mt-3 rounded-lg border border-line bg-accent-soft px-4 py-3">{t('noPrograms')}</p>
          ) : (
            byLevel.map((g) => (
              <div key={g.level} className="mt-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{tSurvey.has(g.level as 'bachelor') ? tSurvey(g.level as 'bachelor') : g.level}</h3>
                <ul className="mt-2 space-y-4">
                  {g.items.map((p) => (
                    <ProgramCard key={p.id} program={p} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>

        {institution.rankings.length > 0 && (
          <section className="mt-10" aria-labelledby="rankings-title">
            <h2 id="rankings-title" className="text-xl font-semibold text-text">{t('rankingsTitle')}</h2>
            <ul className="mt-3 space-y-1">
              {institution.rankings.map((r) => (
                <li key={`${r.name}-${r.year}`}>{t('rankingLine', { name: r.name, year: r.year, position: r.position })}</li>
              ))}
            </ul>
          </section>
        )}

        {institution.scholarships.length > 0 && (
          <section className="mt-10" aria-labelledby="scholarships-title">
            <h2 id="scholarships-title" className="text-xl font-semibold text-text">{t('scholarshipsTitle')}</h2>
            <ul className="mt-3 space-y-2">
              {institution.scholarships.map((s, i) => (
                <li key={i}>
                  {s.url ? (
                    <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent-text underline underline-offset-4">{pickLocalized(s.names, locale).text}</a>
                  ) : (
                    <span className="font-medium">{pickLocalized(s.names, locale).text}</span>
                  )}
                  {s.covers && t.has(`covers.${s.covers}` as 'covers.full') && <span className="text-muted"> — {t(`covers.${s.covers}` as 'covers.full')}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {institution.programs.length === 0 && <p className="mt-6 text-muted">{t('comingSoon')}</p>}

        <footer className="mt-10 space-y-1 border-t border-line pt-4 text-sm text-muted">
          {checked && <p>{t('checked', { date: checked })}</p>}
          <p>{t('disclaimer')}</p>
          {CONTACT && (
            <p>
              <a href={`mailto:${CONTACT}?subject=${encodeURIComponent(`${name} (${institution.country}/${institution.slug})`)}`} className="underline underline-offset-4">
                {t('report')}
              </a>
            </p>
          )}
        </footer>

        <p className="mt-8">
          <Link href="/" className="font-semibold text-accent-text underline underline-offset-4">
            {t('back')}
          </Link>
        </p>
      </article>
    </SideAds>
  );
}
