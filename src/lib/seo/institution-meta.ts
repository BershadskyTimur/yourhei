// The title and the description of an institution page in the search results. The rule (SEO audit of 9 Nov 2026): the title
// promises only what the page has. With a known price it says "tuition <year of the prices>"; without one it says "programmes and
// how to apply" and never "tuition". The texts come from messages/<language>.json (namespace Seo); here they are only put together.

/** A message of the Seo namespace with its values (the page passes next-intl's `t`). */
export type SeoText = (key: string, values?: Record<string, string | number>) => string;

/** The original name next to the name in the language of the page, when it says something more: "Университет Бентли (Bentley University)". */
export function nameWithOriginal(name: string, original: string | null | undefined): string | null {
  const first = (original ?? '').split(';')[0].trim();
  if (!first) return null;
  const plain = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  if (plain(first) === plain(name) || plain(name).includes(plain(first))) return null;
  return `${name} (${first})`;
}

export interface TitleInput {
  name: string;
  original: string | null | undefined;
  /** the city, or the country when the city is not known */
  place: string;
  /** a yearly price for students from abroad is known */
  fee: boolean;
  /** the short academic year of the prices ("2025/26"); null when the programmes do not say it */
  year: string | null;
}

/**
 * The titles to try, the most complete first; `fitTitle` keeps the first that fits in 60 characters. The name with the original
 * name (people search both) in the full and the short form, then the name alone. With a price: "стоимость обучения {year}", then
 * "стоимость {year}". Without a price: "программы и поступление" with the place, then without it, at last "{name}: программы".
 */
export function institutionTitleCandidates(t: SeoText, input: TitleInput): string[] {
  const full = nameWithOriginal(input.name, input.original);
  const names = full ? [full, input.name] : [input.name];
  // a missing year leaves no gap ("стоимость обучения" instead of "стоимость обучения ")
  const text = (key: string, values: Record<string, string>) => t(key, values).replace(/\s+/g, ' ').trim();
  if (input.fee) {
    const year = input.year ?? '';
    return names.flatMap((name) => [text('institutionTitleFee', { name, year }), text('institutionTitleFeeShort', { name, year })]);
  }
  return [
    ...names.flatMap((name) => [...(input.place ? [text('institutionTitleProgrammes', { name, place: input.place })] : []), text('institutionTitleProgrammesShort', { name })]),
    text('institutionTitleProgrammesShortest', { name: input.name }),
  ];
}

/** The length a description is filled up to: search engines show about 155-160 characters. */
export const DESCRIPTION_TARGET = 155;

/**
 * A description from sentences, the most important first: the first one always, each next one only while the whole stays within
 * `max` characters (a sentence that does not fit is skipped, a shorter one after it may still fit). Empty sentences are left out.
 */
export function composeDescription(sentences: readonly (string | null | undefined | false)[], max = DESCRIPTION_TARGET): string {
  const [first, ...rest] = sentences.filter((s): s is string => typeof s === 'string' && s.trim() !== '').map((s) => s.trim());
  if (first === undefined) return '';
  let text = first;
  for (const s of rest) if (text.length + 1 + s.length <= max) text = `${text} ${s}`;
  return text;
}
