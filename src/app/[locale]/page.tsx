import { setRequestLocale, getTranslations } from 'next-intl/server';
import { InstitutionExplorer } from '@/components/InstitutionExplorer';
import { Link } from '@/i18n/navigation';
import { getMapInstitutions } from '@/lib/institutions/get';

// The list of institutions is refreshed at most once an hour.
export const revalidate = 3600;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const { items, error } = await getMapInstitutions();

  const steps = [
    { title: t('how.step1Title'), text: t('how.step1Text') },
    { title: t('how.step2Title'), text: t('how.step2Text') },
    { title: t('how.step3Title'), text: t('how.step3Text') },
  ];

  return (
    <>
      <InstitutionExplorer items={items} loadError={error} />

      <section aria-labelledby="about-title" className="mx-auto max-w-3xl px-4 pt-12">
        <h2 id="about-title" className="text-2xl font-bold text-brand">
          {t('about.title')}
        </h2>
        <p className="mt-3 text-lg leading-relaxed">{t('about.text')}</p>
      </section>

      <section aria-labelledby="how-title" className="mx-auto max-w-6xl px-4 pt-12">
        <h2 id="how-title" className="text-2xl font-bold text-brand">
          {t('how.title')}
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {steps.map((s, idx) => (
            <li key={s.title} className="rounded-2xl border border-line bg-surface p-5">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-accent font-bold text-on-accent"
              >
                {idx + 1}
              </span>
              <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1 text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Link
            href="/register"
            className="inline-flex h-12 items-center rounded-full bg-accent px-8 text-base font-semibold text-on-accent hover:opacity-90"
          >
            {t('how.cta')}
          </Link>
        </div>
      </section>
    </>
  );
}
