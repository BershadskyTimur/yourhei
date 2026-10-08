// Anonymous usage events beyond page views. Pure code (used by the browser and by /api/track), covered by tests.
// Only a short list of fields is kept for each event, every value is checked and cut: nothing a visitor types
// can reach the database except a search phrase of at most 40 characters.

export const EVENT_NAMES = ['catalog_search', 'apply_click', 'matches_view'] as const;
export type EventName = (typeof EVENT_NAMES)[number];
export type EventMeta = Record<string, string | number | boolean>;

const code = (v: unknown, re: RegExp, max: number): string | undefined => (typeof v === 'string' && v.length <= max && re.test(v) ? v : undefined);
const count = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? Math.min(Math.max(Math.round(v), 0), 100000) : undefined);

function pick(entries: [string, string | number | boolean | undefined][]): EventMeta {
  return Object.fromEntries(entries.filter(([, v]) => v !== undefined)) as EventMeta;
}

/** The cleaned meta of an event, or null when the event is not valid. */
export function sanitizeMeta(event: unknown, raw: unknown): EventMeta | null {
  const m = typeof raw === 'object' && raw !== null && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  switch (event) {
    case 'catalog_search': {
      const results = count(m.results);
      if (results === undefined) return null;
      const q = typeof m.q === 'string' ? m.q.replace(/[^\p{L}\p{N} \-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 40) : '';
      return pick([
        ['results', results],
        ['mode', m.mode === 'institutions' ? 'institutions' : 'programs'],
        ['country', code(m.country, /^[A-Z]{2}$/, 2)],
        ['level', code(m.level, /^[a-z_]{3,20}$/, 20)],
        ['language', code(m.language, /^[a-z]{2}$/, 2)],
        ['field', code(m.field, /^\d{2}$/, 2)],
        ['type', code(m.type, /^[a-z_]{3,20}$/, 20)],
        ['free', m.free === true ? true : undefined],
        ['price', m.price === true ? true : undefined],
        ['q', q || undefined],
      ]);
    }
    case 'apply_click': {
      const kind = m.kind === 'program' || m.kind === 'scholarship' || m.kind === 'website' ? m.kind : null;
      if (!kind) return null;
      return pick([
        ['kind', kind],
        ['country', code(m.country, /^[A-Z]{2}$/, 2)],
        ['slug', code(m.slug, /^[a-z0-9-]{1,80}$/, 80)],
      ]);
    }
    case 'matches_view': {
      const passed = count(m.passed);
      if (passed === undefined) return null;
      return pick([
        ['passed', passed],
        ['safe', count(m.safe)],
        ['suitable', count(m.suitable)],
        ['ambitious', count(m.ambitious)],
      ]);
    }
    default:
      return null;
  }
}
