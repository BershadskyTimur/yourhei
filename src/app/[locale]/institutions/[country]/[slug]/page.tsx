import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { SideAds } from '@/components/SideAds';
import { TypeDot } from '@/components/TypeDot';
import { Link } from '@/i18n/navigation';
import { getMapInstitutions } from '@/lib/institutions/get';
import { pickLocalized } from '@/lib/institutions/localized';

export const revalidate = 3600;

type Params = Promise<{ locale: string; country: string; slug: string }>;

async function findInstitution(country: string, slug: string) {
  const { items } = await getMapInstitutions();
  return items.find((i) => i.country.toLowerCase() === country.toLowerCase() && i.slug === slug);
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, country, slug } = await params;
  const institution = await findInstitution(country, slug);
  return { title: institution ? pickLocalized(institution.names, locale).text : undefined };
}

/**
 * Temporary card: only the open base data. The full card (programs, costs, admission)
 * is built at stage 4 (SPEC.md section 12).
 */
export default async function InstitutionPage({ params }: { params: Params }) {
  const { locale, country, slug } = await params;
  setRequestLocale(locale);
  const institution = await findInstitution(country, slug);
  if (!institution) notFound();

  const t = await getTranslations('Institution');
  const tTypes = await getTranslations('Types');
  const name = pickLocalized(institution.names, locale).text;
  const original = institution.names.original;
  const city = pickLocalized(institution.city, locale).text;
  const countryName = new Intl.DisplayNames([locale], { type: 'region' }).of(institution.country);

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
      {institution.foundedYear && (
        <p className="mt-1 text-muted">{t('founded', { year: institution.foundedYear })}</p>
      )}
      {institution.website && (
        <p className="mt-4">
          <a
            href={institution.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-accent-text underline underline-offset-4"
          >
            {t('officialSite')}
          </a>
        </p>
      )}
      <p className="mt-6 rounded-lg border border-line bg-accent-soft px-4 py-3 text-text">
        {t('comingSoon')}
      </p>
      <p className="mt-8">
        <Link href="/" className="font-semibold text-accent-text underline underline-offset-4">
          {t('back')}
        </Link>
      </p>
    </article>
    </SideAds>
  );
}
