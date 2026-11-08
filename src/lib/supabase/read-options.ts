// Options for the server-side reads of public data (map, sitemap, institution pages).
//
// Next.js remembers the answer of every fetch in its data cache, and the Cloudflare build can bring that cache from a
// previous build. Without a time limit an old answer (for example the map list from before a database fix) came back
// in every new build. Now an answer is remembered for at most a day, and the header changes the cache key, so
// raise DATA_VERSION by one after a change in the database that must show up at once.
// The limit also caps how long a page that reads the database stays cached (the shorter of the two wins): with six hours
// an institution page (revalidate = one day) was rebuilt up to four times a day (s-maxage=21600, 08.11.2026), and each
// rebuild is a slow answer for a search engine and three reads of the database.
const DATA_VERSION = '3';
const ONE_DAY = 86400;

const timed: typeof fetch = (input, init) => fetch(input, { ...init, next: { revalidate: ONE_DAY } });

export const publicReadOptions = {
  auth: { persistSession: false },
  global: { fetch: timed, headers: { 'x-yourhei-data': DATA_VERSION } },
};
