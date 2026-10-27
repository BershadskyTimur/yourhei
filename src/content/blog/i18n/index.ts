import type { BlogLang, Translations } from '@/lib/blog/types';
import { ar } from './ar';
import { arMore } from './ar-more';
import { arMore2 } from './ar-more2';
import { az } from './az';
import { azMore } from './az-more';
import { azMore2 } from './az-more2';
import { de } from './de';
import { deMore } from './de-more';
import { deMore2 } from './de-more2';
import { es } from './es';
import { esMore } from './es-more';
import { esMore2 } from './es-more2';
import { fr } from './fr';
import { frMore } from './fr-more';
import { frMore2 } from './fr-more2';
import { hy } from './hy';
import { hyMore } from './hy-more';
import { hyMore2 } from './hy-more2';
import { ka } from './ka';
import { kaMore } from './ka-more';
import { kaMore2 } from './ka-more2';
import { kk } from './kk';
import { kkMore } from './kk-more';
import { kkMore2 } from './kk-more2';
import { ky } from './ky';
import { kyMore } from './ky-more';
import { kyMore2 } from './ky-more2';
import { pl } from './pl';
import { plMore } from './pl-more';
import { plMore2 } from './pl-more2';
import { tr } from './tr';
import { trMore } from './tr-more';
import { trMore2 } from './tr-more2';
import { uk } from './uk';
import { ukMore } from './uk-more';
import { ukMore2 } from './uk-more2';
import { uz } from './uz';
import { uzMore } from './uz-more';
import { uzMore2 } from './uz-more2';
import { zh } from './zh';
import { zhMore } from './zh-more';
import { zhMore2 } from './zh-more2';

// Machine translations of the English articles (by the address of the article). They are marked as such on the page and are not
// offered to search engines until a person has read them: to open a language, add its code to INDEXED_LOCALES in src/config/seo.ts.
// <lang>.ts holds the first twelve articles, <lang>-more.ts and <lang>-more2.ts the ones added later.
export const TRANSLATIONS: Partial<Record<BlogLang, Translations>> = {
  zh: { ...zh, ...zhMore, ...zhMore2 },
  es: { ...es, ...esMore, ...esMore2 },
  fr: { ...fr, ...frMore, ...frMore2 },
  ka: { ...ka, ...kaMore, ...kaMore2 },
  uk: { ...uk, ...ukMore, ...ukMore2 },
  tr: { ...tr, ...trMore, ...trMore2 },
  kk: { ...kk, ...kkMore, ...kkMore2 },
  uz: { ...uz, ...uzMore, ...uzMore2 },
  az: { ...az, ...azMore, ...azMore2 },
  hy: { ...hy, ...hyMore, ...hyMore2 },
  ky: { ...ky, ...kyMore, ...kyMore2 },
  pl: { ...pl, ...plMore, ...plMore2 },
  de: { ...de, ...deMore, ...deMore2 },
  ar: { ...ar, ...arMore, ...arMore2 },
};
