// To add a language: add a line here and a messages/<code>.json file.
// `dir` is "rtl" for right-to-left languages (Arabic).
export const LOCALES = [
  { code: 'ru', label: 'Русский', dir: 'ltr' },
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'ka', label: 'ქართული', dir: 'ltr' },
  { code: 'es', label: 'Español', dir: 'ltr' },
  { code: 'zh', label: '简体中文', dir: 'ltr' },
  { code: 'uk', label: 'Українська', dir: 'ltr' },
  { code: 'hy', label: 'Հայերեն', dir: 'ltr' },
  { code: 'kk', label: 'Қазақша', dir: 'ltr' },
  { code: 'tr', label: 'Türkçe', dir: 'ltr' },
  { code: 'az', label: 'Azərbaycanca', dir: 'ltr' },
  { code: 'uz', label: 'Oʻzbekcha', dir: 'ltr' },
  { code: 'ky', label: 'Кыргызча', dir: 'ltr' },
  { code: 'pl', label: 'Polski', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'de', label: 'Deutsch', dir: 'ltr' },
] as const;

export type LocaleCode = (typeof LOCALES)[number]['code'];

export const LOCALE_CODES = LOCALES.map((l) => l.code) as unknown as readonly LocaleCode[];
export const DEFAULT_LOCALE: LocaleCode = 'en';

// Order in which a missing translation falls back (SPEC.md section 4).
export const FALLBACK_ORDER = ['en', 'ru'] as const;
