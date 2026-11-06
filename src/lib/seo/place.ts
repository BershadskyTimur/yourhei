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
