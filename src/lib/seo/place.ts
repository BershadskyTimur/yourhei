// "In <country>" for page titles. Russian needs the prepositional case and sometimes "на" instead of "в" ("в Германии",
// "на Гуаме"), which Intl.DisplayNames cannot give; French needs "en / au / aux / à", German and Spanish an article for some names.
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

// German and Spanish: the countries whose name takes an article after "in" / "en" ("in den Niederlanden", "en el Reino Unido").
const DE: Record<string, string> = {
  NL: 'den Niederlanden', TR: 'der Türkei', US: 'den Vereinigten Staaten', GB: 'dem Vereinigten Königreich', CH: 'der Schweiz',
  SK: 'der Slowakei', UA: 'der Ukraine', AE: 'den Vereinigten Arabischen Emiraten', PH: 'den Philippinen', IR: 'dem Iran',
  MP: 'den Nördlichen Marianen', VI: 'den Amerikanischen Jungferninseln', AS: 'Amerikanisch-Samoa',
};
const ES: Record<string, string> = { NL: 'los Países Bajos', GB: 'el Reino Unido', AE: 'los Emiratos Árabes Unidos' };

// French: the whole "in <country>" ("en Allemagne", "au Canada", "aux Pays-Bas", "à Guam"). Not in the table: "en" for a name that
// ends in "e" or starts with a vowel (feminine or elided), "au" otherwise.
const FR: Record<string, string> = {
  NL: 'aux Pays-Bas', US: 'aux États-Unis', GB: 'au Royaume-Uni', AE: 'aux Émirats arabes unis', PH: 'aux Philippines',
  GU: 'à Guam', PR: 'à Porto Rico', MP: 'aux Îles Mariannes du Nord', VI: 'aux Îles Vierges des États-Unis', AS: 'aux Samoa américaines',
  MX: 'au Mexique', KH: 'au Cambodge', MZ: 'au Mozambique', ZW: 'au Zimbabwe', SG: 'à Singapour', HK: 'à Hong Kong', MO: 'à Macao',
  CY: 'à Chypre', MT: 'à Malte', IL: 'en Israël', IQ: 'en Irak', IR: 'en Iran',
};

/**
 * The words for "in <country>" that the page titles put in {place}: Russian with the preposition and case ("в Германии", "на Гуаме");
 * French with the preposition ("en Allemagne", "aux Pays-Bas"); English, German and Spanish the name with its article where it takes
 * one (the templates say "in" / "en"); elsewhere the country name.
 */
export function placeIn(locale: string, code: string, name: string): string {
  const cc = code.toUpperCase();
  if (locale === 'ru') return RU[cc] ?? `в стране «${name}»`;
  if (locale === 'en') return EN_THE.has(cc) ? `the ${name}` : name;
  if (locale === 'de') return DE[cc] ?? name;
  if (locale === 'es') return ES[cc] ?? name;
  if (locale === 'fr') return FR[cc] ?? (/e$/i.test(name) || /^[aeiouyéèêâîôûh]/i.test(name) ? `en ${name}` : `au ${name}`);
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
