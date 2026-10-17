import { describe, expect, it } from 'vitest';
import { eventToRow, MAX_EVENTS_PER_REQUEST, rowsFromRequest } from './row';

const view = { path: '/ru/catalog', locale: 'ru', device: 'mobile', referrer: 'google.com', session: 's1' };

describe('eventToRow', () => {
  it('turns a page view into a row and takes the country from the network, not from the browser', () => {
    expect(eventToRow({ ...view, country: 'XX' }, 'GE')).toEqual({ event: 'page_view', path: '/ru/catalog', locale: 'ru', country: 'GE', device: 'mobile', referrer: 'google.com', session: 's1' });
  });

  it('ignores a bad address, the admin panel and unknown events', () => {
    expect(eventToRow({ path: 'https://evil.example' }, null)).toBeNull();
    expect(eventToRow({ path: '/ru/admin' }, null)).toBeNull();
    expect(eventToRow({ ...view, event: 'drop_table' }, null)).toBeNull();
    expect(eventToRow('text', null)).toBeNull();
  });

  it('cleans odd values instead of storing them', () => {
    const row = eventToRow({ ...view, device: 'toaster', referrer: 'a b<script>', session: 'x'.repeat(100) }, 'ge');
    expect(row).toMatchObject({ device: null, referrer: null, country: null });
    expect(row?.session).toHaveLength(40);
  });
});

describe('rowsFromRequest', () => {
  it('accepts one event as before', () => {
    expect(rowsFromRequest(view, null)).toHaveLength(1);
  });

  it('accepts a batch, drops the bad events and caps the size', () => {
    const batch = { events: [view, { path: 'nope' }, ...Array.from({ length: 30 }, () => view)] };
    const rows = rowsFromRequest(batch, null);
    expect(rows.length).toBeLessThanOrEqual(MAX_EVENTS_PER_REQUEST);
    expect(rows.length).toBeGreaterThan(0);
  });

  it('gives nothing for garbage', () => {
    expect(rowsFromRequest(null, null)).toEqual([]);
    expect(rowsFromRequest({ events: 'x' }, null)).toEqual([]);
  });
});
