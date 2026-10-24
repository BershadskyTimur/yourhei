import type { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { FUNDS_CHECKED, RULES_CHECKED, SCHOLARSHIPS_CHECKED, fundsRows, ruleRows, scholarshipsOpenTo, selectScholarships, type ScholarshipRow } from '@/lib/blog/data';
import { parseInline } from '@/lib/blog/inline';
import type { Block, BlogLang } from '@/lib/blog/types';
import { pickText } from '@/lib/institutions/localized';
import { safeHttpUrl } from '@/lib/safe-url';

// Draws the blocks of an article. Everything here is in the language of the article (not of the site): the data blocks, the labels
// and the dates, so that an English article never shows a Russian label in the middle of a table.

const linkClass = 'font-semibold text-accent-text underline underline-offset-4';
const card = 'rounded-lg border border-line bg-surface p-5';

function formatDate(day: string, lang: BlogLang): string {
  return new Intl.DateTimeFormat(lang, { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(`${day}T00:00:00Z`));
}

function formatMoney(amount: number, currency: string, lang: BlogLang): string {
  try {
    return new Intl.NumberFormat(lang, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${Math.round(amount)} ${currency}`;
  }
}

/** A paragraph with its **bold** and [links]. A link to an article that is not published yet is shown as plain text. */
export function Inline({ text, published }: { text: string; published: ReadonlySet<string> }): ReactNode {
  return parseInline(text).map((part, i) => {
    if (part.kind === 'text') return part.text;
    if (part.kind === 'bold') return <strong key={i}>{part.text}</strong>;
    if (part.external) {
      return (
        <a key={i} href={part.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {part.text}
        </a>
      );
    }
    const slug = /^\/blog\/([^/?#]+)/.exec(part.href)?.[1];
    if (slug && !published.has(slug)) return part.text;
    return (
      <Link key={i} href={part.href} className={linkClass}>
        {part.text}
      </Link>
    );
  });
}

export async function BlogBody({ blocks, lang, published }: { blocks: Block[]; lang: BlogLang; published: ReadonlySet<string> }) {
  const t = await getTranslations({ locale: lang, namespace: 'Blog' });
  const tLevel = await getTranslations({ locale: lang, namespace: 'Survey.q.level.options' });
  const tCovers = await getTranslations({ locale: lang, namespace: 'Institution.covers' });
  const regions = new Intl.DisplayNames([lang], { type: 'region' });
  const country = (code: string) => regions.of(code) ?? code;

  const official = (url: string) => (
    <a href={safeHttpUrl(url) ?? '#'} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {t('officialPage')}
    </a>
  );
  const checked = (day: string) => <p className="text-sm text-muted">{t('checked', { date: formatDate(day, lang) })}</p>;
  const meta = (s: ScholarshipRow) =>
    [s.covers && tCovers.has(s.covers as 'full') ? tCovers(s.covers as 'full') : null, s.levels.map((l) => (tLevel.has(l as 'master') ? tLevel(l as 'master') : l)).join(', ')].filter(Boolean).join(' · ');
  const scholarshipCard = (s: ScholarshipRow, key: string) => (
    <li key={key} className={card}>
      <p className="text-sm font-medium uppercase tracking-wide text-muted">{s.country ? country(s.country) : t('severalCountries')}</p>
      <h3 className="mt-1 text-lg font-semibold text-text">{pickText(s.names, lang).text}</h3>
      <p className="text-sm text-muted">{pickText(s.funder, lang).text}</p>
      {meta(s) && <p className="mt-2 text-sm font-medium">{meta(s)}</p>}
      <p className="mt-2 text-base">{pickText(s.eligibility, lang).text}</p>
      <p className="mt-2 text-base">{official(s.url)}</p>
    </li>
  );

  const out: ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const key = `b${i}`;
    switch (b.t) {
      case 'p':
        out.push(<p key={key}><Inline text={b.text} published={published} /></p>);
        break;
      case 'h2':
        out.push(<h2 key={key} id={b.id} className="mt-10 scroll-mt-28 text-2xl font-semibold tracking-tight text-text">{b.text}</h2>);
        break;
      case 'h3':
        out.push(<h3 key={key} className="mt-6 text-xl font-semibold text-text">{b.text}</h3>);
        break;
      case 'ul':
        out.push(
          <ul key={key} className="list-disc space-y-3 pl-6 marker:text-gold">
            {b.items.map((item, n) => <li key={n}><Inline text={item} published={published} /></li>)}
          </ul>,
        );
        break;
      case 'ol':
        out.push(
          <ol key={key} className="list-decimal space-y-3 pl-6 marker:font-semibold marker:text-gold-text">
            {b.items.map((item, n) => <li key={n}><Inline text={item} published={published} /></li>)}
          </ol>,
        );
        break;
      case 'note':
        out.push(<p key={key} className="rounded-lg border border-line bg-accent-soft px-4 py-3 text-base"><Inline text={b.text} published={published} /></p>);
        break;
      case 'cta': {
        // consecutive buttons stand in one row
        const group: Extract<Block, { t: 'cta' }>[] = [b];
        while (blocks[i + 1]?.t === 'cta') group.push(blocks[++i] as Extract<Block, { t: 'cta' }>);
        out.push(
          <p key={key} className="flex flex-wrap gap-3 pt-2">
            {group.map((c, n) => (
              <Link key={n} href={c.href} className="inline-flex h-12 items-center justify-center rounded-lg bg-accent px-6 text-base font-medium text-on-accent hover:opacity-90">{c.text}</Link>
            ))}
          </p>,
        );
        break;
      }
      case 'rules': {
        const rows = ruleRows(b.topic);
        out.push(
          <div key={key} className="space-y-3">
            <ul className="space-y-3">
              {rows.map((r) => (
                <li key={r.country} className={card}>
                  <h3 className="text-lg font-semibold text-text">{country(r.country)}</h3>
                  {r.block?.summary ? (
                    <p className="mt-2 text-base">{pickText(r.block.summary, lang).text}</p>
                  ) : (
                    <p className="mt-2 text-base text-muted">{t('notCollected')}</p>
                  )}
                  {r.block && <p className="mt-2 text-base">{official(r.block.url)}</p>}
                </li>
              ))}
            </ul>
            {checked(RULES_CHECKED)}
          </div>,
        );
        break;
      }
      case 'funds': {
        const rows = fundsRows();
        out.push(
          <div key={key} className="space-y-3">
            <ul className="space-y-3">
              {rows.map((r) => (
                <li key={r.country} className={card}>
                  <h3 className="text-lg font-semibold text-text">{country(r.country)} <span className="text-sm font-normal text-muted">· {r.year}</span></h3>
                  <ul className="mt-2 space-y-1">
                    {r.cities.map((c, n) => (
                      <li key={n} className="text-base">
                        {c.label && <span className="text-muted">{pickText(c.label, lang).text}: </span>}
                        <span className="font-semibold text-text">{t('perMonth', { amount: formatMoney(c.amount, r.currency, lang) })}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-base">{pickText(r.note, lang).text}</p>
                  <p className="mt-2 text-base">{official(r.url)}</p>
                </li>
              ))}
            </ul>
            {checked(FUNDS_CHECKED)}
          </div>,
        );
        break;
      }
      case 'scholarships': {
        const rows = selectScholarships({ covers: b.covers, level: b.level });
        out.push(
          <div key={key} className="space-y-3">
            <ul className="space-y-3">{rows.map((s, n) => scholarshipCard(s, `${key}-${n}`))}</ul>
            {checked(SCHOLARSHIPS_CHECKED)}
          </div>,
        );
        break;
      }
      case 'scholarshipsFor': {
        // a short list per country, and the full description of each programme once (Visegrad is open to several of the countries)
        const per = b.countries.map((code) => ({ code, rows: scholarshipsOpenTo(code) }));
        const unique = [...new Map(per.flatMap((p) => p.rows).map((s) => [s.names.en, s])).values()];
        out.push(
          <div key={key} className="space-y-6">
            {per.map(({ code, rows }) => (
              <section key={code} aria-label={country(code)}>
                <h3 className="text-xl font-semibold text-text">{t('citizensOf', { country: country(code) })}</h3>
                {rows.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {rows.map((s, n) => (
                      <li key={n} className="text-base">
                        <span className="font-semibold text-text">{pickText(s.names, lang).text}</span>
                        <span className="text-muted"> — {pickText(s.funder, lang).text}</span>
                        {meta(s) && <span className="text-muted"> · {meta(s)}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-base text-muted">{t('noneConfirmed')}</p>
                )}
              </section>
            ))}
            {unique.length > 0 && (
              <section aria-labelledby={`${key}-details`}>
                <h3 id={`${key}-details`} className="text-xl font-semibold text-text">{t('programmeDetails')}</h3>
                <ul className="mt-3 space-y-3">{unique.map((s, n) => scholarshipCard(s, `${key}-d${n}`))}</ul>
              </section>
            )}
            {checked(SCHOLARSHIPS_CHECKED)}
          </div>,
        );
        break;
      }
    }
  }
  return <>{out}</>;
}
