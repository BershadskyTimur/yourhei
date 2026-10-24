import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/PageShell';
import { Link } from '@/i18n/navigation';
import { seoMetadata, trimDescription } from '@/lib/seo/metadata';
import { routing } from '@/i18n/routing';
import { GUIDES } from '@/lib/countries-guide/guides';

type Params = Promise<{ locale: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'Countries' });
  return seoMetadata({ locale, path: '/countries', title: t('listTitle'), description: trimDescription(t('listIntro')) });
}

export default async function CountriesPage({ params }: { params: Params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Countries');
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  const collator = new Intl.Collator(locale);
  const list = GUIDES.map((g) => ({ code: g.country, name: names.of(g.country) ?? g.country })).sort((a, b) => collator.compare(a.name, b.name));
  return (
    <PageShell title={t('listTitle')}>
      <p>{t('listIntro')}</p>
      <ul className="grid gap-3 text-base sm:grid-cols-2">
        {list.map((c) => (
          <li key={c.code}>
            <Link href={`/countries/${c.code.toLowerCase()}`} className="block rounded-lg border border-line bg-surface px-4 py-3 font-semibold text-text hover:bg-surface-strong">
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </PageShell>
  );
}
