// Which interface texts are sent to the browser.
//
// The whole translation file (60-100 KB) used to be written into the HTML of every page, because the components that run
// in the browser ("use client") read their texts from it. Most of a page is drawn on the server and needs none of that in
// the browser, so only the named groups are sent: the ones below on every page, and each page adds its own with
// <ClientMessages namespaces={[…]}>. The test client-messages.test.ts fails when a page forgets a group.

/** Groups used by the browser components of every page: the header, the cookie banner, the notice, the error page. */
export const SHARED_CLIENT_NAMESPACES: readonly string[] = ['Common', 'Header', 'Consent', 'ErrorPage'];

type Messages = Record<string, unknown>;

const isObject = (v: unknown): v is Messages => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Only the named groups of the messages ("Catalog", or a group inside a group: "Survey.q.level.options"). */
export function pickMessages(messages: Messages, namespaces: readonly string[]): Messages {
  const out: Messages = {};
  // a part of a group that is picked whole ("Survey.ui" next to "Survey") adds nothing
  const wanted = namespaces.filter((ns) => !namespaces.some((other) => other !== ns && isCovered(ns, [other])));
  for (const ns of wanted) {
    const parts = ns.split('.');
    let from: unknown = messages;
    for (const p of parts) from = isObject(from) ? from[p] : undefined;
    if (from === undefined) continue;
    let to = out;
    for (const p of parts.slice(0, -1)) {
      const next = to[p];
      to = isObject(next) ? next : (to[p] = {} as Messages);
    }
    to[parts[parts.length - 1]!] = from;
  }
  return out;
}

/** Whether a group a component asks for is inside the picked ones ("Survey.ui" is inside "Survey"). */
export function isCovered(namespace: string, picked: readonly string[]): boolean {
  return picked.some((p) => namespace === p || namespace.startsWith(`${p}.`));
}
