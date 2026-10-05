import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AdSlot } from '@/components/AdSlot';
import { InstitutionExplorer } from '@/components/InstitutionExplorer';
import { CapIcon, GlobeIcon, HeroArt, MapIcon, ShieldIcon, SparkIcon } from '@/components/icons';
import { LOCALES } from '@/config/locales';
import { Link } from '@/i18n/navigation';
import { getMapInstitutions } from '@/lib/institutions/get';

// The list of institutions is refreshed at most once an hour.
export const revalidate = 3600;

const primary =
  'inline-flex h-12 items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-on-accent shadow-md hover:opacity-90';
const secondary =
  'inline-flex h-12 items-center justify-center rounded-full border border-line-strong bg-bg/70 px-8 text-base font-semibold text-text hover:bg-surface-strong';

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
      <section className="hero-bg relative overflow-hidden">
        <div className="hero-dots pointer-events-none absolute inset-y-0 end-0 w-2/3 opacity-70" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-[1500px] items-center gap-8 px-4 py-12 sm:py-16 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line-strong/50 bg-bg/70 px-4 py-1.5 text-sm font-semibold text-brand">
              <CapIcon />
              {t('hero.badge')}
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-text sm:text-5xl lg:text-6xl">
              {t('map.title')}
            </h1>
            <div className="gold-rule mt-5 w-40" aria-hidden="true" />
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
              {t('hero.subtitle', { count: items.length })}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className={primary}>{t('how.cta')}</Link>
              <a href="#map" className={secondary}>{t('hero.ctaMap')}</a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-3">
              {[
                t('stats.institutions', { count: items.length }),
                t('stats.countries', { count: perCountry.size }),
                t('stats.languages', { count: LOCALES.length }),
                t('stats.free'),
              ].map((s) => (
                <li key={s} className="rounded-full border border-line-strong/40 bg-bg/70 px-4 py-1.5 text-sm font-semibold text-text">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden justify-center lg:flex">
            <HeroArt />
          </div>
        </div>
      </section>

      <div className="mx-auto mt-6 max-w-[1500px] px-4">
        <AdSlot kind="banner" />
      </div>

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
        <h2 id="why-title" className="text-3xl font-bold text-brand">{t('why.title')}</h2>
        <div className="gold-rule mt-3 w-24" aria-hidden="true" />
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <li key={f.title} className="rounded-3xl border border-line bg-surface p-6 shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-on-accent shadow">
                {f.icon}
              </span>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-2 text-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-title" className="mx-auto mt-16 max-w-[1500px] px-4">
        <h2 id="how-title" className="text-3xl font-bold text-brand">{t('how.title')}</h2>
        <div className="gold-rule mt-3 w-24" aria-hidden="true" />
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {steps.map((s, idx) => (
            <li key={s.title} className="relative overflow-hidden rounded-3xl border border-line bg-surface p-6">
              <span aria-hidden="true" className="absolute -end-2 -top-6 text-[7rem] font-black leading-none text-gold/20">
                {idx + 1}
              </span>
              <span aria-hidden="true" className="relative flex h-10 w-10 items-center justify-center rounded-full bg-accent font-bold text-on-accent">
                {idx + 1}
              </span>
              <h3 className="relative mt-4 text-xl font-bold">{s.title}</h3>
              <p className="relative mt-2 text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mx-auto mt-12 max-w-[1500px] px-4">
        <AdSlot kind="leaderboard" />
      </div>

      {countries.length > 0 && (
        <section aria-labelledby="countries-title" className="mx-auto mt-16 max-w-[1500px] px-4">
          <h2 id="countries-title" className="text-3xl font-bold text-brand">{t('countries.title')}</h2>
          <div className="gold-rule mt-3 w-24" aria-hidden="true" />
          <p className="mt-3 text-muted">{t('countries.text')}</p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {countries.map(([code, count]) => (
              <li key={code} className="rounded-full border border-line-strong/50 bg-surface px-4 py-2 text-sm font-medium">
                {regionNames.of(code) ?? code}
                <span className="ms-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent-text">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="hero-bg mx-4 mt-16 overflow-hidden rounded-[2rem] border border-line-strong/40 xl:mx-auto xl:max-w-[1500px]">
        <div className="flex flex-col items-start gap-6 px-6 py-10 sm:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-text">{t('cta.title')}</h2>
            <p className="mt-2 max-w-2xl text-lg text-muted">{t('cta.text')}</p>
          </div>
          <Link href="/register" className={primary}>{t('how.cta')}</Link>
        </div>
      </section>
    </>
  );
}
