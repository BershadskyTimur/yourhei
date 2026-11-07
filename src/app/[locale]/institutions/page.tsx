import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { PageShell } from '@/components/PageShell';
import { Link } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { getListCountries } from '@/lib/institutions/country-list';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import { breadcrumbList } from '@/lib/seo/structured';

export const revalidate = 86400;

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'InstitutionsList' });
  return seoMetadata({ locale, path: '/institutions', title: t('indexSeoTitle'), description: trimDescription(t('indexIntro')) });
}

/** The countries that have a list of institutions, with how many institutions each has. */
export default async function InstitutionsIndexPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('InstitutionsList');
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  const collator = new Intl.Collator(locale);
  const countries = (await getListCountries())
    .map((c) => ({ ...c, name: names.of(c.country) ?? c.country }))
    .sort((a, b) => collator.compare(a.name, b.name));
  // the sitemap list could not be read: an error (not cached), not an empty page
  if (countries.length === 0) throw new Error('institutions index: the list of institutions could not be read');
  return (
    <PageShell title={t('indexTitle')}>
      <JsonLd data={breadcrumbList(locale, [{ name: 'YourHEI', path: '' }, { name: t('indexTitle'), path: '/institutions' }])} />
      <p>{t('indexIntro')}</p>
      <ul className="grid gap-3 text-base sm:grid-cols-2">
        {countries.map((c) => (
          <li key={c.country}>
            <Link href={`/institutions/${c.country.toLowerCase()}`} className="block rounded-lg border border-line bg-surface px-4 py-3 hover:bg-surface-strong">
              <span className="font-semibold text-text">{c.name}</span>
              <span className="block text-sm text-muted">{t('count', { count: c.count })}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
