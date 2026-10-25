import type { BlogLang, Translations } from '@/lib/blog/types';
import { az } from './az';
import { es } from './es';
import { fr } from './fr';
import { hy } from './hy';
import { ka } from './ka';
import { kk } from './kk';
import { ky } from './ky';
import { tr } from './tr';
import { uk } from './uk';
import { uz } from './uz';
import { zh } from './zh';

// Machine translations of the English articles (by the address of the article). They are marked as such on the page and are not
// offered to search engines until a person has read them: to open a language, add its code to INDEXED_LOCALES in src/config/seo.ts.
export const TRANSLATIONS: Partial<Record<BlogLang, Translations>> = { zh, es, fr, ka, uk, tr, kk, uz, az, hy, ky };
