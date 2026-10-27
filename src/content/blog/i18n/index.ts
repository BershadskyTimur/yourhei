import type { BlogLang, Translations } from '@/lib/blog/types';
import { ar } from './ar';
import { arMore } from './ar-more';
import { az } from './az';
import { azMore } from './az-more';
import { de } from './de';
import { deMore } from './de-more';
import { es } from './es';
import { esMore } from './es-more';
import { fr } from './fr';
import { frMore } from './fr-more';
import { hy } from './hy';
import { hyMore } from './hy-more';
import { ka } from './ka';
import { kaMore } from './ka-more';
import { kk } from './kk';
import { kkMore } from './kk-more';
import { ky } from './ky';
import { kyMore } from './ky-more';
import { pl } from './pl';
import { plMore } from './pl-more';
import { tr } from './tr';
import { trMore } from './tr-more';
import { uk } from './uk';
import { ukMore } from './uk-more';
import { uz } from './uz';
import { uzMore } from './uz-more';
import { zh } from './zh';
import { zhMore } from './zh-more';

// Machine translations of the English articles (by the address of the article). They are marked as such on the page and are not
// offered to search engines until a person has read them: to open a language, add its code to INDEXED_LOCALES in src/config/seo.ts.
// <lang>.ts holds the first twelve articles, <lang>-more.ts the ones added later.
export const TRANSLATIONS: Partial<Record<BlogLang, Translations>> = {
  zh: { ...zh, ...zhMore },
  es: { ...es, ...esMore },
  fr: { ...fr, ...frMore },
  ka: { ...ka, ...kaMore },
  uk: { ...uk, ...ukMore },
  tr: { ...tr, ...trMore },
  kk: { ...kk, ...kkMore },
  uz: { ...uz, ...uzMore },
  az: { ...az, ...azMore },
  hy: { ...hy, ...hyMore },
  ky: { ...ky, ...kyMore },
  pl: { ...pl, ...plMore },
  de: { ...de, ...deMore },
  ar: { ...ar, ...arMore },
};
