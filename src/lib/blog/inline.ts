// The little markup allowed inside a paragraph of an article: **bold** and [text](address).
// An address must be a page of this site ("/catalog") or an https address; anything else is shown as plain text.

export type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'bold'; text: string }
  | { kind: 'link'; text: string; href: string; external: boolean };

const TOKEN = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function linkKind(href: string): 'internal' | 'external' | null {
  if (/^\/(?!\/)/.test(href)) return 'internal';
  try {
    return new URL(href).protocol === 'https:' ? 'external' : null;
  } catch {
    return null;
  }
}

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push({ kind: 'text', text: text.slice(last, at) });
    if (m[1] !== undefined) out.push({ kind: 'bold', text: m[1] });
    else {
      const kind = linkKind(m[3]);
      out.push(kind ? { kind: 'link', text: m[2], href: m[3], external: kind === 'external' } : { kind: 'text', text: m[2] });
    }
    last = at + m[0].length;
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) });
  return out;
}

/** The text without the markup (for the reading time and the feed). */
export function plainText(text: string): string {
  return parseInline(text).map((i) => i.text).join('');
}
