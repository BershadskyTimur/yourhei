// Options for the server-side reads of public data (map, sitemap, institution pages).
//
// Next.js remembers the answer of every fetch in its data cache, and the Cloudflare build can bring that cache from a
// previous build. Without a time limit an old answer (for example the map list from before a database fix) came back
// in every new build. Now an answer is remembered for at most six hours, and the header changes the cache key, so
// raise DATA_VERSION by one after a change in the database that must show up at once.
const DATA_VERSION = '3';
const HOURS_6 = 21600;

const timed: typeof fetch = (input, init) => fetch(input, { ...init, next: { revalidate: HOURS_6 } });

export const publicReadOptions = {
  auth: { persistSession: false },
  global: { fetch: timed, headers: { 'x-yourhei-data': DATA_VERSION } },
};
