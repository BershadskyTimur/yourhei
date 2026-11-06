// "In <country>" for page titles. Russian needs the prepositional case and sometimes "на" instead of "в" ("в Германии",
// "на Гуаме"), which Intl.DisplayNames cannot give; the other languages use the country name as it is.
const RU: Record<string, string> = {
  AM: 'в Армении', AS: 'на Американском Самоа', AT: 'в Австрии', AU: 'в Австралии', AZ: 'в Азербайджане', BE: 'в Бельгии',
  BY: 'в Беларуси', CA: 'в Канаде', CH: 'в Швейцарии', CN: 'в Китае', CZ: 'в Чехии', DE: 'в Германии', DK: 'в Дании',
  EE: 'в Эстонии', ES: 'в Испании', FI: 'в Финляндии', FR: 'во Франции', GB: 'в Великобритании', GE: 'в Грузии',
  GU: 'на Гуаме', HU: 'в Венгрии', IE: 'в Ирландии', IT: 'в Италии', JP: 'в Японии', KG: 'в Кыргызстане', KR: 'в Южной Корее',
  KZ: 'в Казахстане', LT: 'в Литве', LV: 'в Латвии', MP: 'на Северных Марианских островах', NL: 'в Нидерландах', NO: 'в Норвегии',
  NZ: 'в Новой Зеландии', PL: 'в Польше', PR: 'в Пуэрто-Рико', PT: 'в Португалии', SE: 'в Швеции', SK: 'в Словакии',
  TR: 'в Турции', UA: 'в Украине', US: 'в США', UZ: 'в Узбекистане', VI: 'на Американских Виргинских островах',
};

// English: the countries whose name takes "the" ("in the Netherlands").
const EN_THE = new Set(['NL', 'US', 'GB', 'AE', 'PH', 'BS', 'GM', 'MV']);

/** The words for "in <country>" in Russian ("в Германии"); "the Netherlands" in English; elsewhere the country name. */
export function placeIn(locale: string, code: string, name: string): string {
  const cc = code.toUpperCase();
  if (locale === 'ru') return RU[cc] ?? `в стране «${name}»`;
  if (locale === 'en' && EN_THE.has(cc)) return `the ${name}`;
  return name;
}

/**
 * The city of an institution for search engines (page description, structured data). The source sometimes gives the county or
 * a municipality instead of the city ("Middlesex County" for Harvard); such a name is left out rather than shown as the city.
 * "Municipality" is only a word added to the real name ("Oslo Municipality"), so it is cut off.
 */
export function seoCity(city: string | null | undefined): string {
  const name = (city ?? '').trim().replace(/\s+Municipality$/i, '');
  return /\b(County|Parish)\b/i.test(name) || /(^|\s)округ(\s|$)/i.test(name) ? '' : name;
}

// Russian names people search for ("США", not "Соединённые Штаты")
const RU_SHORT: Record<string, string> = { US: 'США', GB: 'Великобритания', AE: 'ОАЭ' };

/** The country name as people write it in the language; the full name from Intl.DisplayNames otherwise. */
export function countryLabel(locale: string, code: string, name: string): string {
  return locale === 'ru' ? (RU_SHORT[code.toUpperCase()] ?? name) : name;
}
