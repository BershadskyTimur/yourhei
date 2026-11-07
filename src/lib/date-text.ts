// A date written as text ("23 октября 2026 г.") that is put into a sentence which ends with its own full stop
// ("Данные проверены {date}."). Some languages end a long date with a dot (Russian "г."), and the sentence then
// ended in "г..". The dot of the date is dropped, so the sentence's own dot finishes it.

/** The date text without a final dot, for use right before the full stop of a sentence. */
export function dateBeforeStop(text: string): string {
  return text.replace(/\.$/, '');
}
