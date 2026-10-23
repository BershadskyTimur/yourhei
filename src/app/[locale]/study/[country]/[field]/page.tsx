import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound, permanentRedirect } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { COUNTRY_CODES } from '@/lib/countries';
import { pickLocalized } from '@/lib/institutions/localized';
import { codeOfSlug, comboOf, fieldSlug } from '@/lib/study/combos';
import { getStudyInstitutions } from '@/lib/study/get';
import { iscedEntry, labelFor } from '@/lib/survey/references';

// Rebuilt once a day; no page is built in advance (each one is built on the first visit and cached).
export const revalidate = 86400;
export function generateStaticParams() {
  return [];
}

type Params = Promise<{ locale: string; country: string; field: string }>;

function resolve(country: string, field: string) {
  const code = codeOfSlug(field);
  const cc = country.toUpperCase();
  if (!code || !COUNTRY_CODES.has(cc)) return null;
  const combo = comboOf(cc, code);
  const entry = iscedEntry(code);
  return combo && entry ? { combo, entry, cc, code } : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, country, field } = await params;
  const r = resolve(country, field);
  if (!hasLocale(routing.locales, locale) || !r) return {};
  const t = await getTranslations({ locale, namespace: 'Study' });
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(r.cc) ?? r.cc;
  const label = labelFor(r.entry, locale);
  return {
    title: t('pageTitle', { field: label, country: name }),
    description: t('pageIntro', { programmes: r.combo.programmes, institutions: r.combo.institutions }),
    alternates: { canonical: `/${locale}/study/${country.toLowerCase()}/${fieldSlug(r.code)}` },
  };
}

/** "Study <field> in <country>": the institutions that teach the field, with how many programmes each has. */
export default async function StudyFieldPage({ params }: { params: Params }) {
  const { locale, country, field } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const r = resolve(country, field);
  if (!r) notFound();
  // one address per page: an old or short address goes to the full one
  if (field !== fieldSlug(r.code)) permanentRedirect(`/${locale}/study/${country.toLowerCase()}/${fieldSlug(r.code)}`);
  setRequestLocale(locale);

  const t = await getTranslations('Study');
  const tCountries = await getTranslations('Countries');
  const tInst = await getTranslations('Institution');
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(r.cc) ?? r.cc;
  const label = labelFor(r.entry, locale);
  const institutions = await getStudyInstitutions(r.cc, r.code);
  // a database failure is an error (not cached), not a missing page
  if (institutions === null) throw new Error('study page: the database could not be read');
  if (institutions.length === 0) notFound();

  return (
    <PageShell title={t('pageTitle', { field: label, country: name })}>
      <p>{t('pageIntro', { programmes: r.combo.programmes, institutions: r.combo.institutions })}</p>

      <section aria-labelledby="inst-title">
        <h2 id="inst-title" className="text-xl font-semibold text-text">{t('institutionsTitle', { field: label })}</h2>
        <ul className="mt-3 space-y-3 text-base">
          {institutions.map((i) => {
            const city = pickLocalized(i.city, locale).text;
            return (
              <li key={i.slug} className="rounded-lg border border-line bg-surface px-4 py-3">
                <Link href={`/institutions/${r.cc.toLowerCase()}/${i.slug}`} className="font-semibold text-accent-text underline underline-offset-4">
                  {pickLocalized(i.names, locale).text}
                </Link>
                <p className="text-sm text-muted">{[city, t('programmesCount', { count: i.n })].filter(Boolean).join(' · ')}</p>
                {i.sample.length > 0 && (
                  <p className="mt-1 text-sm">
                    {t('examples')} {i.sample.join('; ')}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <p className="flex flex-wrap gap-x-6 gap-y-2 text-base">
        <Link href={`/study/${r.cc.toLowerCase()}`} className="font-semibold text-accent-text underline underline-offset-4">{t('allFields', { country: name })}</Link>
        <Link href="/catalog" className="font-semibold text-accent-text underline underline-offset-4">{tCountries('catalogLink')}</Link>
        <Link href="/methodology" className="underline underline-offset-4">{tInst('methodologyLinkShort')}</Link>
      </p>
    </PageShell>
  );
}
