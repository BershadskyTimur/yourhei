import { getTranslations } from 'next-intl/server';
import { PageShell } from './PageShell';

const SECTIONS = {
  privacy: [1, 2, 3, 4, 5, 6, 7],
  terms: [1, 2, 3, 4, 5, 6],
} as const;

/** The privacy policy / terms of use template: a title, the "needs a lawyer" banner and numbered sections. */
export async function LegalDocument({ kind }: { kind: 'privacy' | 'terms' }) {
  const tPage = await getTranslations(`Pages.${kind}`);
  const t = await getTranslations(`Legal.${kind}`);
  return (
    <PageShell title={tPage('title')} banner={tPage('banner')}>
      <p>{t('intro' as never)}</p>
      {SECTIONS[kind].map((n) => (
        <section key={n}>
          <h2 className="mt-6 text-xl font-bold text-brand">{t(`s${n}Title` as never)}</h2>
          <p className="mt-2">{t(`s${n}Text` as never)}</p>
        </section>
      ))}
    </PageShell>
  );
}
