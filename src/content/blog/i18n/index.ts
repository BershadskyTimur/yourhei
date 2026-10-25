import type { BlogLang, Translations } from '@/lib/blog/types';
import { es } from './es';
import { fr } from './fr';
import { ka } from './ka';
import { zh } from './zh';

// Machine translations of the English articles (by the address of the article). They are marked as such on the page and are not
// offered to search engines until a person has read them: to open a language, add its code to INDEXED_LOCALES in src/config/seo.ts.
export const TRANSLATIONS: Partial<Record<BlogLang, Translations>> = { zh, es, fr, ka };
