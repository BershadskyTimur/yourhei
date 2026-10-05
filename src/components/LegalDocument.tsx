import { getTranslations } from 'next-intl/server';
import { PageShell } from './PageShell';

const SECTIONS = {
  privacy: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  terms: [1, 2, 3, 4, 5, 6, 7, 8],
} as const;

/** The date of the last change of the texts below. Update it whenever the texts change. */
export const LEGAL_UPDATED = new Date(Date.UTC(2026, 9, 5));

/** The privacy policy / terms of use: a title, the date of the last update and numbered sections. */
export async function LegalDocument({ kind, locale }: { kind: 'privacy' | 'terms'; locale: string }) {
  const tPage = await getTranslations(`Pages.${kind}`);
  const t = await getTranslations(`Legal.${kind}`);
  const tLegal = await getTranslations('Legal');
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(LEGAL_UPDATED);
  return (
    <PageShell title={tPage('title')}>
      <p className="text-sm text-muted">{tLegal('updated', { date })}</p>
      {SECTIONS[kind].map((n) => (
        <section key={n}>
          <h2 className="mt-6 text-xl font-bold text-brand">{t(`s${n}Title` as never)}</h2>
          <p className="mt-2">{t(`s${n}Text` as never)}</p>
        </section>
      ))}
    </PageShell>
  );
}
