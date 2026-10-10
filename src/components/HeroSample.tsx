import { getLocale, getTranslations } from 'next-intl/server';

/**
 * An example of one explained match for the first screen. The programme is a real one (Study in NL, Nuffic);
 * the card is labelled "example" because the real list depends on the visitor's answers.
 */
const SAMPLE = {
  program: 'Industrial Engineering & Management',
  institution: 'University of Twente',
  country: 'NL',
  years: 3,
  language: 'en',
  tuition: { amount: 16869, currency: 'EUR' },
  deadline: new Date(Date.UTC(2027, 4, 1)),
  url: 'https://www.utwente.nl/en/education/bachelor/programmes/industrial-engineering-and-management/',
  source: 'Study in NL, Nuffic',
};

function Tick() {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" className="mt-0.5 shrink-0 text-[var(--ok,#2f7a5f)]">
      <path d="M3.5 10.5l4.2 4L16.5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function HeroSample() {
  const locale = await getLocale();
  const t = await getTranslations('Home.sample');
  const tCard = await getTranslations('Matches.card');
  const tCatalog = await getTranslations('Catalog');
  const tInst = await getTranslations('Institution');
  const tLevel = await getTranslations('Survey.q.level.options');

  const language = new Intl.DisplayNames([locale], { type: 'language' }).of(SAMPLE.language) ?? SAMPLE.language;
  const country = new Intl.DisplayNames([locale], { type: 'region' }).of(SAMPLE.country) ?? SAMPLE.country;
  const price = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: SAMPLE.tuition.currency,
    maximumFractionDigits: 0,
  }).format(SAMPLE.tuition.amount);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(SAMPLE.deadline);

  const rows = [
    { title: tCard('languages'), text: t('languageText', { language }), ok: true },
    { title: tCard('tuition'), text: tCatalog('perYear', { price }), ok: true },
    { title: tInst('deadline'), text: t('deadlineText', { date }), ok: false },
  ];

  return (
    <article className="rounded-lg border border-line bg-surface p-6 shadow-[0_40px_60px_-40px_rgb(0_0_0/0.45)] sm:p-8">
      <p className="text-sm text-muted">{t('label')}</p>
      <h2 className="mt-3 text-2xl font-medium leading-tight tracking-tight text-text sm:text-3xl">{SAMPLE.program}</h2>
      <p className="mt-2 text-muted">
        {SAMPLE.institution}, {country}
      </p>
      <ul className="mt-4 flex flex-wrap gap-2 text-sm">
        {[tLevel('bachelor'), language, tCard('years', { count: SAMPLE.years })].map((tag) => (
          <li key={tag} className="rounded-full bg-accent-soft px-3 py-1 text-text">
            {tag}
          </li>
        ))}
      </ul>
      <ul className="mt-6 border-t border-text">
        {rows.map((r) => (
          <li key={r.title} className="flex gap-4 border-b border-line py-4 last:border-b-0">
            {r.ok ? (
              <Tick />
            ) : (
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" className="mt-0.5 shrink-0 text-accent-text">
                <path d="M10 4.5v7M10 14.6v.4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            )}
            <div>
              <p className="font-medium text-text">{r.title}</p>
              <p className="mt-0.5 text-muted">{r.text}</p>
            </div>
          </li>
        ))}
      </ul>
      <a
        href={SAMPLE.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-between border-t border-line pt-4 font-medium text-text hover:underline"
      >
        {tCard('apply')}
        <svg aria-hidden="true" width="22" height="14" viewBox="0 0 22 14" className="shrink-0 rtl:-scale-x-100">
          <path d="M1 7h19M14 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </a>
      <p className="mt-3 text-xs text-muted">{t('source', { name: SAMPLE.source })}</p>
    </article>
  );
}
