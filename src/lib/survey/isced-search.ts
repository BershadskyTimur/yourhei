import keywordData from '../../../data/reference/isced-keywords.json';
import { normalizeSearch } from '../institutions/filter';
import { ISCED, type IscedEntry } from './references';

// Search for a field of study. The official classification (ISCED-F 2013) names fields in the language of statisticians
// ("Political sciences and civics"), but people type "diplomacy" or "international relations". Everyday words (English and
// Russian) are kept in data/reference/isced-keywords.json and lead to the right code.

type Keywords = { en?: string[]; ru?: string[] };
const KEYWORDS = keywordData as unknown as Record<string, Keywords>;
const WORDS: Map<string, string[]> = new Map(Object.entries(KEYWORDS).filter(([k]) => /^\d+$/.test(k)).map(([code, w]) => [code, [...(w.en ?? []), ...(w.ru ?? [])]]));

export interface IscedMatch {
  entry: IscedEntry;
  /** the everyday word that led here, when the name itself did not match */
  via: string | null;
}

const name = (e: IscedEntry, locale: string): string => (e as unknown as Record<string, string>)[locale] ?? e.en;

/** The best matches for what the person typed (names in the site language and in English, plus everyday words). */
export function searchIsced(query: string, locale: string, limit = 14): IscedMatch[] {
  const q = normalizeSearch(query);
  if (q.length < 2) return [];
  const scored: { entry: IscedEntry; score: number; via: string | null }[] = [];
  for (const entry of ISCED) {
    const names = [normalizeSearch(name(entry, locale)), normalizeSearch(entry.en)];
    let score = 0;
    let via: string | null = null;
    if (names.some((n) => n === q)) score = 100;
    else if (names.some((n) => n.startsWith(q))) score = 80;
    else if (names.some((n) => n.split(/[\s,()/-]+/).some((w) => w.startsWith(q)))) score = 60;
    else if (names.some((n) => n.includes(q))) score = 40;
    for (const word of WORDS.get(entry.c) ?? []) {
      const w = normalizeSearch(word);
      const s = w === q ? 95 : w.startsWith(q) ? 75 : w.split(/[\s,()/-]+/).some((p) => p.startsWith(q)) ? 55 : w.includes(q) && q.length >= 3 ? 35 : 0;
      if (s > score) {
        score = s;
        via = s > 0 && !names.some((n) => n.includes(q)) ? word : null;
      }
    }
    if (score > 0) scored.push({ entry, score: score + (entry.c.length === 4 ? 5 : 0), via });
  }
  scored.sort((a, b) => b.score - a.score || a.entry.c.localeCompare(b.entry.c));
  return scored.slice(0, limit).map(({ entry, via }) => ({ entry, via }));
}

/** Directions most people look for, with the plain name shown on the button (English and Russian; other languages show the official name). */
export const POPULAR_FIELDS: { code: string; en: string; ru: string }[] = [
  { code: '0613', en: 'Computer science & AI', ru: 'Информатика и ИИ' },
  { code: '0912', en: 'Medicine', ru: 'Медицина' },
  { code: '0421', en: 'Law', ru: 'Право' },
  { code: '0413', en: 'Business & management', ru: 'Бизнес и менеджмент' },
  { code: '0311', en: 'Economics', ru: 'Экономика' },
  { code: '0412', en: 'Finance & banking', ru: 'Финансы и банки' },
  { code: '0312', en: 'International relations & politics', ru: 'Международные отношения и политика' },
  { code: '0414', en: 'Marketing', ru: 'Маркетинг' },
  { code: '0313', en: 'Psychology', ru: 'Психология' },
  { code: '0321', en: 'Journalism & media', ru: 'Журналистика и медиа' },
  { code: '0212', en: 'Design', ru: 'Дизайн' },
  { code: '0731', en: 'Architecture', ru: 'Архитектура' },
  { code: '0732', en: 'Civil engineering', ru: 'Строительство' },
  { code: '0715', en: 'Mechanical engineering', ru: 'Машиностроение' },
  { code: '0714', en: 'Electronics & robotics', ru: 'Электроника и робототехника' },
  { code: '0713', en: 'Energy', ru: 'Энергетика' },
  { code: '0232', en: 'Languages & translation', ru: 'Языки и перевод' },
  { code: '0511', en: 'Biology', ru: 'Биология' },
  { code: '0916', en: 'Pharmacy', ru: 'Фармация' },
  { code: '1015', en: 'Tourism', ru: 'Туризм' },
  { code: '1013', en: 'Hospitality & culinary', ru: 'Гостеприимство и кулинария' },
  { code: '1041', en: 'Logistics & transport', ru: 'Логистика и транспорт' },
  { code: '0111', en: 'Education', ru: 'Педагогика' },
  { code: '0215', en: 'Music & performing arts', ru: 'Музыка и театр' },
];

export function popularLabel(p: { en: string; ru: string }, locale: string): string {
  return locale === 'ru' ? p.ru : p.en;
}
