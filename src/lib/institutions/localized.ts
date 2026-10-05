import { FALLBACK_ORDER } from '@/config/locales';
import type { LocalizedText } from './types';

export interface PickedText {
  text: string;
  /** true when the text is not in the requested language (show "translation unavailable"). */
  isFallback: boolean;
}

/**
 * Picks the text for the site language; if missing falls back to English, then Russian,
 * then the original (SPEC.md section 4).
 */
export function pickLocalized(value: LocalizedText | undefined, locale: string): PickedText {
  const direct = value?.[locale];
  if (direct) return { text: direct, isFallback: false };
  for (const code of [...FALLBACK_ORDER, 'original']) {
    const v = value?.[code];
    if (v) return { text: v, isFallback: true };
  }
  return { text: '', isFallback: true };
}
