/**
 * Links that come from the database (websites, application pages) are shown as clickable. Only plain
 * http(s) addresses may become links: "javascript:", "data:" and the like are dropped, so a bad value
 * in the data can never run code in a visitor's browser.
 */
export function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const text = value.trim();
  if (!text || text.length > 2048) return null;
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}
