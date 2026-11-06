import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { FavoriteButton } from '@/components/FavoriteButton';
import { ProgramCard, examLabel } from '@/components/ProgramCard';
import { ReportError } from '@/components/ReportError';
import { ReviewForm } from '@/components/ReviewForm';
import { TrackedLink } from '@/components/TrackedLink';
import { ClaimInstitution } from '@/components/cabinet/ClaimInstitution';
import { SideAds } from '@/components/SideAds';
import { TypeDot } from '@/components/TypeDot';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { guideOf } from '@/lib/countries-guide/guides';
import { getInstitutionDetail } from '@/lib/institutions/detail';
import { pickLocalized, pickText } from '@/lib/institutions/localized';
import { JsonLd } from '@/components/JsonLd';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import { hasPrices, institutionFacts, levelRows } from '@/lib/seo/institution-faq';
import { countryLabel, seoCity } from '@/lib/seo/place';
import { formatTuitionRange, tuitionRange } from '@/lib/seo/tuition-range';
import { breadcrumbList, faqPageLd, institutionLd, type FaqEntry } from '@/lib/seo/structured';
import { comboOf, fieldSlug, studyCountries } from '@/lib/study/combos';
import { iscedEntry, labelFor } from '@/lib/survey/references';

// The data of one institution changes rarely; a page is rebuilt at most once a day (bots visit thousands of these pages).
export const revalidate = 86400;

// No institution page is built in advance (there are thousands), but with this line each page is built on the first visit,
// kept in the page cache and rebuilt once a day (revalidate above), instead of being built again for every visitor.
export function generateStaticParams() {
  return [];
}

type Params = Promise<{ locale: string; country: string; slug: string }>;

const LEVEL_ORDER = ['school', 'college', 'foundation', 'bachelor', 'master', 'phd', 'language_course'];
const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, country, slug } = await params;
  const institution = await getInstitutionDetail(country, slug);
  if (!institution || !hasLocale(routing.locales, locale)) return { title: undefined };
  const t = await getTranslations({ locale, namespace: 'Seo' });
  const tLevel = await getTranslations({ locale, namespace: 'Survey.q.level.options' });
  const name = pickLocalized(institution.names, locale).text;
  const city = seoCity(pickLocalized(institution.city, locale).text);
  const countryName = new Intl.DisplayNames([locale], { type: 'region' }).of(institution.country) ?? institution.country;
  const levels = LEVEL_ORDER.filter((l) => institution.programs.some((p) => p.level === l)).map((l) => tLevel(l as 'bachelor'));
  // people search "<university> tuition": when the prices are known the description says them (cheapest to dearest per year)
  const range = tuitionRange(institution.programs);
  const descriptionOf = () => {
    const args = { name, place: [city, countryLabel(locale, institution.country, countryName ?? institution.country)].filter(Boolean).join(', '), count: institution.programs.length, levels: levels.join(', ') };
    if (!range) return t('institutionDescription', args);
    return t('institutionDescriptionPrice', { ...args, range: formatTuitionRange(locale, range) });
  };
  return seoMetadata({
    locale,
    path: `/institutions/${country}/${slug}`,
    title: t('institutionTitle', { name, country: countryLabel(locale, institution.country, countryName ?? institution.country) }),
    description: trimDescription(descriptionOf()),
    // A page without programmes is a thin page: keep it out of the search results (visitors can still open it).
    noindex: institution.programs.length === 0,
  });
}

export default async function InstitutionPage({ params }: { params: Params }) {
  const { locale, country, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const institution = await getInstitutionDetail(country, slug);
  if (!institution) notFound();

  const t = await getTranslations('Institution');
  const tFaq = await getTranslations('Institution.faq');
  const tTypes = await getTranslations('Types');
  const tReviews = await getTranslations('Reviews');
  const tSurvey = await getTranslations('Survey.q.level.options');
  const name = pickLocalized(institution.names, locale).text;
  const original = institution.names.original;
  const city = pickLocalized(institution.city, locale).text;
  const countryName = new Intl.DisplayNames([locale], { type: 'region' }).of(institution.country);
  const description = pickText(institution.description, locale);

  const byLevel = LEVEL_ORDER.map((level) => ({ level, items: institution.programs.filter((p) => p.level === level) })).filter((g) => g.items.length > 0);
  const checked = institution.verifiedAt
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(institution.verifiedAt))
    : null;
  const facts: [string, string][] = [];
  if (institution.ownership) facts.push([t('ownership'), t(institution.ownership)]);
  if (institution.dormitory !== null) facts.push([t('dormitory'), institution.dormitory ? t('dormitoryYes') : t('dormitoryNo')]);
  const features = institution.features.filter((f) => t.has(`features.${f}` as 'features.exchange'));

  // Structured data for search engines (an institution with its place, site and Wikidata item).
  const structured = institutionLd({ type: institution.type, name, original, website: institution.website, country: institution.country, city, foundedYear: institution.foundedYear, wikidataId: institution.wikidataId });

  const levelLabel = (level: string) => (tSurvey.has(level as 'bachelor') ? tSurvey(level as 'bachelor') : level);
  // The price table and the questions are made from the programmes read above (no further database reads).
  const priceRows = levelRows(institution.programs, LEVEL_ORDER);
  const info = institutionFacts(institution.programs, LEVEL_ORDER, new Date().toISOString().slice(0, 10));
  const numberText = new Intl.NumberFormat(locale);
  const dateText = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' });
  const langNames = new Intl.DisplayNames([locale], { type: 'language' });
  // Only the questions whose answer is known; the same texts go to the structured data.
  const faq: FaqEntry[] = [];
  if (info.tuition) {
    faq.push({ question: tFaq('tuitionQ', { name }), answer: [tFaq('tuitionA', { range: formatTuitionRange(locale, info.tuition) }), info.freeCount > 0 ? tFaq('freeNote', { count: info.freeCount }) : ''].filter(Boolean).join(' ') });
  } else if (info.programCount > 0 && info.freeCount === info.programCount) {
    faq.push({ question: tFaq('tuitionQ', { name }), answer: tFaq('allFree') });
  }
  if (info.deadlines.length > 0) {
    faq.push({ question: tFaq('deadlinesQ', { name }), answer: tFaq('deadlinesA', { dates: info.deadlines.map((d) => dateText.format(new Date(`${d}T00:00:00Z`))).join(', ') }) });
  }
  if (info.programCount > 0) {
    faq.push({ question: tFaq('programsQ', { name }), answer: tFaq('programsA', { programs: t('programsCount', { count: info.programCount }), levels: info.levels.map(levelLabel).join(', ') }) });
  }
  if (info.languages.length > 0) {
    faq.push({ question: tFaq('languagesQ', { name }), answer: tFaq('languagesA', { languages: info.languages.map((l) => langNames.of(l) ?? l).join(', ') }) });
  }
  if (info.scores.length > 0) {
    const scores = info.scores.map((s) => (s.min === s.max ? tFaq('scoreOne', { exam: examLabel(s.exam, locale), min: numberText.format(s.min) }) : tFaq('scoreRange', { exam: examLabel(s.exam, locale), min: numberText.format(s.min), max: numberText.format(s.max) })));
    faq.push({ question: tFaq('scoresQ', { name }), answer: tFaq('scoresA', { scores: scores.join('; ') }) });
  }
  if (institution.dormitory !== null) {
    faq.push({ question: tFaq('dormitoryQ', { name }), answer: institution.dormitory ? tFaq('dormitoryYes') : tFaq('dormitoryNo') });
  }
  // One question alone only repeats the programme list: the block needs at least two.
  const showFaq = faq.length >= 2;

  // The fields this institution teaches that have a page "Study <field> in <country>": a way on to the other institutions
  // of the country (and for search engines a link from every institution page to the field pages).
  const fieldCount = new Map<string, number>();
  for (const p of institution.programs) {
    const code = p.iscedF?.slice(0, 3);
    if (code && comboOf(institution.country, code) && iscedEntry(code)) fieldCount.set(code, (fieldCount.get(code) ?? 0) + 1);
  }
  const fieldLinks = [...fieldCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const hasGuide = guideOf(institution.country) !== null;

  return (
    <SideAds>
      <JsonLd data={structured} />
      {showFaq && <JsonLd data={faqPageLd(faq)} />}
      <JsonLd
        data={breadcrumbList(locale, [
          { name: 'YourHEI', path: '' },
          ...(studyCountries().includes(institution.country) ? [{ name: countryName ?? institution.country, path: `/study/${institution.country.toLowerCase()}` }] : []),
          { name, path: `/institutions/${country}/${slug}` },
        ])}
      />
      <article className="mx-auto max-w-3xl py-12">
        <p className="flex items-center gap-3 text-sm font-medium uppercase tracking-wide text-muted">
          <TypeDot type={institution.type} />
          {tTypes(institution.type)}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text">{name}</h1>
        {original && original !== name && <p className="mt-1 text-lg text-muted">{original}</p>}
        <p className="mt-3 text-lg">{[city, countryName].filter(Boolean).join(', ')}</p>
        {guideOf(institution.country) && (
          <p className="mt-1 text-sm">
            <Link href={`/countries/${institution.country.toLowerCase()}`} className="font-medium text-accent-text underline underline-offset-4">
              {t('countryGuide', { country: countryName ?? institution.country })}
            </Link>
          </p>
        )}
        {institution.foundedYear && <p className="mt-1 text-muted">{t('founded', { year: institution.foundedYear })}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          {institution.website && (
            <TrackedLink href={institution.website} meta={{ kind: 'website', country: institution.country, slug: institution.slug }} className="inline-flex h-10 items-center rounded-lg bg-accent px-4 text-sm font-medium text-on-accent hover:opacity-90">
              {t('officialSite')}
            </TrackedLink>
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

        {hasPrices(priceRows) && (
          <section className="mt-10" aria-labelledby="price-title">
            <h2 id="price-title" className="text-xl font-semibold text-text">{t('priceTitle')}</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[20rem] border-collapse text-sm">
                <thead>
                  <tr>
                    <th scope="col" className="border-b border-line p-3 text-start font-semibold text-text">{t('priceLevel')}</th>
                    <th scope="col" className="border-b border-line p-3 text-start font-semibold text-text">{t('pricePrograms')}</th>
                    <th scope="col" className="border-b border-line p-3 text-start font-semibold text-text">{t('priceYear')}</th>
                  </tr>
                </thead>
                <tbody>
                  {priceRows.map((r) => (
                    <tr key={r.level} className="align-top">
                      <th scope="row" className="border-b border-line p-3 text-start font-medium text-muted">{levelLabel(r.level)}</th>
                      <td className="border-b border-line p-3">{numberText.format(r.programs)}</td>
                      <td className="border-b border-line p-3">{r.free ? t('free') : r.tuition ? formatTuitionRange(locale, r.tuition) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">{levelLabel(g.level)}</h3>
                <ul className="mt-2 space-y-4">
                  {g.items.map((p) => (
                    <ProgramCard key={p.id} program={p} country={institution.country} slug={institution.slug} city={institution.city} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>

        {showFaq && (
          <section className="mt-10" aria-labelledby="faq-title">
            <h2 id="faq-title" className="text-xl font-semibold text-text">{tFaq('title')}</h2>
            <div className="mt-3 space-y-4">
              {faq.map((e) => (
                <div key={e.question}>
                  <h3 className="text-lg font-semibold text-text">{e.question}</h3>
                  <p className="mt-1">{e.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(fieldLinks.length > 0 || hasGuide) && (
          <section className="mt-10" aria-labelledby="more-title">
            <h2 id="more-title" className="text-xl font-semibold text-text">{t('moreTitle')}</h2>
            {fieldLinks.length > 0 && (
              <>
                <h3 className="mt-3 text-sm font-semibold uppercase tracking-wide text-muted">{t('moreFields')}</h3>
                <ul className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                  {fieldLinks.map(([code]) => (
                    <li key={code}>
                      <Link href={`/study/${institution.country.toLowerCase()}/${fieldSlug(code)}`} className="text-accent-text underline underline-offset-4">
                        {labelFor(iscedEntry(code)!, locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            {hasGuide && (
              <p className="mt-3">
                <Link href={`/countries/${institution.country.toLowerCase()}`} className="font-medium text-accent-text underline underline-offset-4">{t('moreGuide')}</Link>
              </p>
            )}
          </section>
        )}

        {institution.rankings.length > 0 && (
          <section className="mt-10" aria-labelledby="rankings-title">
            <h2 id="rankings-title" className="text-xl font-semibold text-text">{t('rankingsTitle')}</h2>
            <ul className="mt-3 space-y-1">
              {institution.rankings.map((r) => (
                <li key={`${r.name}-${r.year}`}>{t('rankingLine', { name: r.name, year: r.year, position: r.position })}</li>
              ))}
            </ul>
            {institution.rankings.some((r) => r.sourceUrl?.startsWith('https://www.wikidata.org/')) && (
              <p className="mt-2 text-sm text-muted">
                {t('rankingsSource')}{' '}
                <a href={institution.rankings.find((r) => r.sourceUrl)!.sourceUrl!} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  Wikidata
                </a>
              </p>
            )}
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

        <section className="mt-10" aria-labelledby="reviews-title">
          <h2 id="reviews-title" className="text-xl font-semibold text-text">
            {tReviews('title')}
            {institution.reviewSummary && (
              <span className="ms-2 text-base font-normal text-muted">{tReviews('summary', { rating: institution.reviewSummary.rating.toFixed(1), count: institution.reviewSummary.count })}</span>
            )}
          </h2>
          {institution.reviews.length === 0 ? (
            <p className="mt-3 text-muted">{tReviews('none')}</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {institution.reviews.map((r, i) => (
                <li key={i} className="rounded-lg border border-line bg-surface p-4">
                  <p className="text-sm text-muted">
                    <span className="text-accent-text" aria-label={tReviews('stars', { count: r.rating })}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    {' · '}
                    {tReviews.has(`relations.${r.relation}` as 'relations.student') ? tReviews(`relations.${r.relation}` as 'relations.student') : r.relation}
                    {r.createdAt ? ` · ${new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date(r.createdAt))}` : ''}
                  </p>
                  <p className="mt-1 whitespace-pre-line">{r.body}</p>
                </li>
              ))}
            </ul>
          )}
          <ReviewForm institutionId={institution.id} />
        </section>

        <ClaimInstitution institutionId={institution.id} />

        {institution.programs.length === 0 && <p className="mt-6 text-muted">{t('comingSoon')}</p>}

        <footer className="mt-10 space-y-1 border-t border-line pt-4 text-sm text-muted">
          {checked && <p>{t('checked', { date: checked })}</p>}
          <p>{t('disclaimer')}</p>
          <div>
            <ReportError
              label={t('report')}
              mailto={CONTACT ? `mailto:${CONTACT}?subject=${encodeURIComponent(`${name} (${institution.country}/${institution.slug})`)}` : undefined}
            />
          </div>
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
