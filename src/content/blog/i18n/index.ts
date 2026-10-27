import type { BlogLang, Translations } from '@/lib/blog/types';
import { ar } from './ar';
import { arMore } from './ar-more';
import { arMore2 } from './ar-more2';
import { arMore3 } from './ar-more3';
import { az } from './az';
import { azMore } from './az-more';
import { azMore2 } from './az-more2';
import { azMore3 } from './az-more3';
import { de } from './de';
import { deMore } from './de-more';
import { deMore2 } from './de-more2';
import { deMore3 } from './de-more3';
import { es } from './es';
import { esMore } from './es-more';
import { esMore2 } from './es-more2';
import { esMore3 } from './es-more3';
import { fr } from './fr';
import { frMore } from './fr-more';
import { frMore2 } from './fr-more2';
import { frMore3 } from './fr-more3';
import { hy } from './hy';
import { hyMore } from './hy-more';
import { hyMore2 } from './hy-more2';
import { hyMore3 } from './hy-more3';
import { ka } from './ka';
import { kaMore } from './ka-more';
import { kaMore2 } from './ka-more2';
import { kaMore3 } from './ka-more3';
import { kk } from './kk';
import { kkMore } from './kk-more';
import { kkMore2 } from './kk-more2';
import { kkMore3 } from './kk-more3';
import { ky } from './ky';
import { kyMore } from './ky-more';
import { kyMore2 } from './ky-more2';
import { kyMore3 } from './ky-more3';
import { pl } from './pl';
import { plMore } from './pl-more';
import { plMore2 } from './pl-more2';
import { plMore3 } from './pl-more3';
import { tr } from './tr';
import { trMore } from './tr-more';
import { trMore2 } from './tr-more2';
import { trMore3 } from './tr-more3';
import { uk } from './uk';
import { ukMore } from './uk-more';
import { ukMore2 } from './uk-more2';
import { ukMore3 } from './uk-more3';
import { uz } from './uz';
import { uzMore } from './uz-more';
import { uzMore2 } from './uz-more2';
import { uzMore3 } from './uz-more3';
import { zh } from './zh';
import { zhMore } from './zh-more';
import { zhMore2 } from './zh-more2';
import { zhMore3 } from './zh-more3';

// Machine translations of the English articles (by the address of the article). They are marked as such on the page and are not
// offered to search engines until a person has read them: to open a language, add its code to INDEXED_LOCALES in src/config/seo.ts.
// <lang>.ts holds the first twelve articles, <lang>-more.ts and <lang>-more2.ts the ones added later.
export const TRANSLATIONS: Partial<Record<BlogLang, Translations>> = {
  zh: { ...zh, ...zhMore, ...zhMore2, ...zhMore3 },
  es: { ...es, ...esMore, ...esMore2, ...esMore3 },
  fr: { ...fr, ...frMore, ...frMore2, ...frMore3 },
  ka: { ...ka, ...kaMore, ...kaMore2, ...kaMore3 },
  uk: { ...uk, ...ukMore, ...ukMore2, ...ukMore3 },
  tr: { ...tr, ...trMore, ...trMore2, ...trMore3 },
  kk: { ...kk, ...kkMore, ...kkMore2, ...kkMore3 },
  uz: { ...uz, ...uzMore, ...uzMore2, ...uzMore3 },
  az: { ...az, ...azMore, ...azMore2, ...azMore3 },
  hy: { ...hy, ...hyMore, ...hyMore2, ...hyMore3 },
  ky: { ...ky, ...kyMore, ...kyMore2, ...kyMore3 },
  pl: { ...pl, ...plMore, ...plMore2, ...plMore3 },
  de: { ...de, ...deMore, ...deMore2, ...deMore3 },
  ar: { ...ar, ...arMore, ...arMore2, ...arMore3 },
};
