import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AdSlot } from '@/components/AdSlot';
import { InstitutionExplorer } from '@/components/InstitutionExplorer';
import { GlobeIcon, MapIcon, ShieldIcon, SparkIcon } from '@/components/icons';
import { LOCALES } from '@/config/locales';
import { Link } from '@/i18n/navigation';
import { getMapInstitutions } from '@/lib/institutions/get';

// The list of institutions is refreshed at most once an hour.
export const revalidate = 3600;

const primary =
  'inline-flex h-12 items-center justify-center rounded-lg bg-accent px-7 text-base font-medium text-on-accent hover:opacity-90';
const secondary =
  'inline-flex h-12 items-center justify-center rounded-lg border border-line-strong px-7 text-base font-medium text-text hover:bg-surface-strong';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const { items, error } = await getMapInstitutions();

  // Institutions per country, biggest first, for the "where you can study" chips.
  const perCountry = new Map<string, number>();
  for (const i of items) perCountry.set(i.country, (perCountry.get(i.country) ?? 0) + 1);
  const regionNames = new Intl.DisplayNames([locale], { type: 'region' });
  const countries = [...perCountry.entries()].sort((a, b) => b[1] - a[1]);

  const steps = [
    { title: t('how.step1Title'), text: t('how.step1Text') },
    { title: t('how.step2Title'), text: t('how.step2Text') },
    { title: t('how.step3Title'), text: t('how.step3Text') },
  ];
  const features = [
    { icon: <MapIcon />, title: t('why.f1Title'), text: t('why.f1Text') },
    { icon: <SparkIcon />, title: t('why.f2Title'), text: t('why.f2Text') },
    { icon: <ShieldIcon />, title: t('why.f3Title'), text: t('why.f3Text') },
    { icon: <GlobeIcon />, title: t('why.f4Title'), text: t('why.f4Text', { languages: LOCALES.length }) },
  ];

  return (
    <>
      <section className="hero-bg">
        <div className="mx-auto max-w-[1500px] px-4 py-14 sm:py-20">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent-text">{t('hero.badge')}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.1] tracking-tight text-text sm:text-5xl lg:text-6xl">
              {t('map.title')}
            </h1>
            <div className="mt-6 h-px w-16 bg-gold" aria-hidden="true" />
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              {t('hero.subtitle', { count: items.length })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className={primary}>{t('how.cta')}</Link>
              <a href="#map" className={secondary}>{t('hero.ctaMap')}</a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
              {[
                t('stats.institutions', { count: items.length }),
                t('stats.countries', { count: perCountry.size }),
                t('stats.languages', { count: LOCALES.length }),
                t('stats.free'),
              ].map((s) => (
                <li key={s} className="border-s border-line-strong ps-3">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 grid max-w-[1500px] gap-4 px-4 xl:grid-cols-[160px_minmax(0,1fr)_160px]">
        <div className="hidden xl:block">
          <div className="sticky top-24"><AdSlot kind="skyscraper" /></div>
        </div>
        <InstitutionExplorer items={items} loadError={error} />
        <div className="hidden xl:block">
          <div className="sticky top-24"><AdSlot kind="skyscraper" /></div>
        </div>
      </div>

      <section aria-labelledby="why-title" className="mx-auto mt-16 max-w-[1500px] px-4">
        <h2 id="why-title" className="text-2xl font-semibold text-text">{t('why.title')}</h2>
        <div className="mt-3 h-px w-12 bg-gold" aria-hidden="true" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.title} className="rounded-lg border border-line bg-surface p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-strong text-accent-text">
                {f.icon}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-title" className="mx-auto mt-16 max-w-[1500px] px-4">
        <h2 id="how-title" className="text-2xl font-semibold text-text">{t('how.title')}</h2>
        <div className="mt-3 h-px w-12 bg-gold" aria-hidden="true" />
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map((s, idx) => (
            <li key={s.title} className="rounded-lg border border-line bg-surface p-6">
              <span aria-hidden="true" className="relative flex h-9 w-9 items-center justify-center rounded-full border border-line-strong font-medium text-accent-text">
                {idx + 1}
              </span>
              <h3 className="relative mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="relative mt-2 text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {countries.length > 0 && (
        <section aria-labelledby="countries-title" className="mx-auto mt-16 max-w-[1500px] px-4">
          <h2 id="countries-title" className="text-2xl font-semibold text-text">{t('countries.title')}</h2>
          <div className="mt-3 h-px w-12 bg-gold" aria-hidden="true" />
          <p className="mt-3 text-muted">{t('countries.text')}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {countries.map(([code, count]) => (
              <li key={code} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm">
                {regionNames.of(code) ?? code}
                <span className="ms-2 text-xs text-muted">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="band-dark mx-4 mt-12 overflow-hidden rounded-lg border border-line xl:mx-auto xl:max-w-[1500px]">
        <div className="flex flex-col items-start gap-6 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-text">{t('cta.title')}</h2>
            <p className="mt-2 max-w-2xl text-lg text-muted">{t('cta.text')}</p>
          </div>
          <Link href="/register" className={primary}>{t('how.cta')}</Link>
        </div>
      </section>
    </>
  );
}
