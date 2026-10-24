// A small copy of what the matches page has read, kept in the browser (IndexedDB) for a while, so that opening "My matches" again does
// not read the database again: tens of thousands of programmes are too big for localStorage, IndexedDB takes them as they are.
// Everything here is optional: without IndexedDB (private windows, old browsers, tests) it does nothing and the page reads the database.

const DB = 'yourhei-matches';
const STORE = 'reads';
/** Raise when the shape of the rows changes: older copies are then ignored. */
const VERSION_KEY = 'v1';

function open(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') return resolve(null);
    try {
      const request = indexedDB.open(DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export interface CachedRead {
  at: number;
  rows: Record<string, unknown>[];
}

export async function readCopy(key: string, maxAgeMs: number): Promise<Record<string, unknown>[] | null> {
  const db = await open();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(`${VERSION_KEY}:${key}`);
      request.onsuccess = () => {
        const value = request.result as CachedRead | undefined;
        resolve(value && Array.isArray(value.rows) && Date.now() - value.at < maxAgeMs ? value.rows : null);
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function writeCopy(key: string, rows: Record<string, unknown>[]): Promise<void> {
  const db = await open();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, 'readwrite');
      // keep only the newest few copies: each one is large
      const store = tx.objectStore(STORE);
      store.put({ at: Date.now(), rows } satisfies CachedRead, `${VERSION_KEY}:${key}`);
      const keys = store.getAllKeys();
      keys.onsuccess = () => {
        const all = keys.result as string[];
        if (all.length > 4) for (const old of all.slice(0, all.length - 4)) if (old !== `${VERSION_KEY}:${key}`) store.delete(old);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
}
