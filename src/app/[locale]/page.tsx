import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AdSlot } from '@/components/AdSlot';
import { HeroSample } from '@/components/HeroSample';
import { InstitutionExplorer } from '@/components/InstitutionExplorer';
import { GlobeIcon, MapIcon, ShieldIcon, SparkIcon } from '@/components/icons';
import { LOCALES } from '@/config/locales';
import { Link } from '@/i18n/navigation';
import { getMapInstitutions } from '@/lib/institutions/get';

// The list of institutions is refreshed at most once an hour.
export const revalidate = 3600;

const primary =
  'inline-flex h-14 items-center justify-center rounded-lg bg-accent px-8 text-base font-medium text-on-accent hover:opacity-90';
const secondary =
  'inline-flex h-14 items-center justify-center rounded-lg border border-line-strong px-8 text-base font-medium text-text hover:bg-surface-strong';
const sectionTitle = 'text-3xl font-medium tracking-tight text-text sm:text-4xl';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const { items: all, error } = await getMapInstitutions();
  // The map needs only the names in the visitor's language (plus English and the original) and no website:
  // with thousands of institutions this keeps the page small.
  const keep = new Set(['original', 'en', locale]);
  const only = (t: Record<string, string | undefined>) => Object.fromEntries(Object.entries(t).filter(([k]) => keep.has(k)));
  const items = all.map((i) => ({ ...i, names: only(i.names), city: only(i.city), website: null, foundedYear: null }));

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
        <div className="mx-auto grid max-w-[1500px] items-center gap-12 px-4 py-14 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-20 lg:py-24">
          <div>
            <p className="text-base font-medium text-accent-text">{t('hero.badge')}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-normal leading-[1.05] tracking-[-0.03em] text-text sm:text-6xl lg:text-7xl">
              {t('map.title')}
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
              {t('hero.subtitle', { count: items.length })}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <Link href="/register" className={primary}>{t('how.cta')}</Link>
              <a href="#map" className="border-b border-gold pb-1 text-lg font-medium text-text hover:opacity-80">
                {t('hero.ctaMap')}
              </a>
            </div>
            <ul className="mt-12 flex max-w-xl flex-wrap gap-x-10 gap-y-3 border-t border-line pt-5 text-base text-muted">
              {[
                t('stats.institutions', { count: items.length }),
                t('stats.countries', { count: perCountry.size }),
                t('stats.languages', { count: LOCALES.length }),
                t('stats.free'),
              ].map((s) => (
                <li key={s} className="font-serif text-lg text-text">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <HeroSample />
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

      <section aria-labelledby="why-title" className="mx-auto mt-24 max-w-[1500px] px-4">
        <h2 id="why-title" className={sectionTitle}>{t('why.title')}</h2>
        <ul className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.title} className="border-t border-text pt-5">
              <span className="text-gold-text">{f.icon}</span>
              <h3 className="mt-4 text-xl font-medium">{f.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-title" className="mx-auto mt-24 max-w-[1500px] px-4">
        <h2 id="how-title" className={sectionTitle}>{t('how.title')}</h2>
        <ol className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-3">
          {steps.map((s, idx) => (
            <li key={s.title} className="border-t border-text pt-5">
              <span aria-hidden="true" className="font-serif text-5xl font-normal text-gold-text">
                {idx + 1}
              </span>
              <h3 className="mt-4 text-xl font-medium">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {countries.length > 0 && (
        <section aria-labelledby="countries-title" className="mx-auto mt-24 max-w-[1500px] px-4">
          <h2 id="countries-title" className={sectionTitle}>{t('countries.title')}</h2>
          <p className="mt-4 text-lg text-muted">{t('countries.text')}</p>
          <ul className="mt-8 flex flex-wrap gap-2">
            {countries.map(([code, count]) => (
              <li key={code} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm">
                {regionNames.of(code) ?? code}
                <span className="ms-2 text-xs text-muted">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="band-dark mx-4 mt-24 overflow-hidden rounded-lg border border-line xl:mx-auto xl:max-w-[1500px]">
        <div className="flex flex-col items-start gap-6 px-6 py-12 sm:px-12 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-normal tracking-tight text-text sm:text-4xl">{t('cta.title')}</h2>
            <p className="mt-3 max-w-2xl text-lg text-muted">{t('cta.text')}</p>
          </div>
          <Link href="/register" className={primary}>{t('how.cta')}</Link>
        </div>
      </section>
    </>
  );
}
