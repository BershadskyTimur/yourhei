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

describe('who is visiting', () => {
  const client = { ip: '203.0.113.7', userAgent: 'Mozilla/5.0 test', browser: 'Chrome 130', os: 'Windows 10/11', fallbackSession: 'h123' };

  it('adds the address and browser the server saw, and what the browser says about itself', () => {
    const row = eventToRow({ ...view, lang: 'ru-RU', screen: '1920x1080', ip: '1.1.1.1', browser: 'Fake' }, 'GE', client);
    expect(row).toMatchObject({ ip: '203.0.113.7', user_agent: 'Mozilla/5.0 test', browser: 'Chrome 130', os: 'Windows 10/11', lang: 'ru-RU', screen: '1920x1080', session: 's1' });
  });

  it('gives a visit without a browser id the id made by the server', () => {
    expect(eventToRow({ path: '/ru' }, null, client)?.session).toBe('h123');
  });

  it('drops a bad address, language and screen', () => {
    const row = eventToRow({ ...view, lang: '<b>', screen: 'huge' }, null, { ...client, ip: 'not an ip' });
    expect(row).not.toHaveProperty('ip');
    expect(row).not.toHaveProperty('lang');
    expect(row).not.toHaveProperty('screen');
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
