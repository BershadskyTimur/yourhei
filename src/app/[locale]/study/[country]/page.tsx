import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { COUNTRY_CODES } from '@/lib/countries';
import { combosOfCountry, fieldSlug } from '@/lib/study/combos';
import { iscedEntry, labelFor } from '@/lib/survey/references';

export const revalidate = 86400;

type Params = Promise<{ locale: string; country: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, country } = await params;
  const code = country.toUpperCase();
  if (!hasLocale(routing.locales, locale) || !COUNTRY_CODES.has(code) || combosOfCountry(code).length === 0) return {};
  const t = await getTranslations({ locale, namespace: 'Study' });
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
  return { title: t('hubTitle', { country: name }), alternates: { canonical: `/${locale}/study/${country.toLowerCase()}` } };
}

/** Every field of study with programmes in a country. */
export default async function StudyCountryPage({ params }: { params: Params }) {
  const { locale, country } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const code = country.toUpperCase();
  const combos = combosOfCountry(code);
  if (!COUNTRY_CODES.has(code) || combos.length === 0) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Study');
  const name = new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code;
  const collator = new Intl.Collator(locale);
  const fields = combos
    .map((c) => ({ ...c, label: labelFor(iscedEntry(c.code) ?? { en: c.code }, locale) }))
    .sort((a, b) => b.programmes - a.programmes || collator.compare(a.label, b.label));
  const programmes = combos.reduce((n, c) => n + c.programmes, 0);
  return (
    <PageShell title={t('hubTitle', { country: name })}>
      <p>{t('hubIntro', { fields: combos.length, programmes })}</p>
      <ul className="grid gap-3 text-base sm:grid-cols-2">
        {fields.map((f) => (
          <li key={f.code}>
            <Link href={`/study/${code.toLowerCase()}/${fieldSlug(f.code)}`} className="block rounded-lg border border-line bg-surface px-4 py-3 hover:bg-surface-strong">
              <span className="font-semibold text-text">{f.label}</span>
              <span className="block text-sm text-muted">{t('programmesCount', { count: f.programmes })}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
