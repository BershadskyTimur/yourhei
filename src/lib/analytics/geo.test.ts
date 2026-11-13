import { describe, expect, it } from 'vitest';
import { geoFromCloudflare, NO_GEO } from './geo';
import { rowsFromRequest } from './row';

describe('place of a visit (Cloudflare)', () => {
  it('takes country, region, city, time zone and the network owner', () => {
    expect(
      geoFromCloudflare({ country: 'KZ', region: 'Almaty', city: 'Almaty', timezone: 'Asia/Almaty', asn: 9198, asOrganization: 'JSC Kazakhtelecom', latitude: '43.25667', longitude: '76.92861', postalCode: '050000' }, null),
    ).toEqual({ country: 'KZ', region: 'Almaty', city: 'Almaty', timezone: 'Asia/Almaty', asn: 9198, asOrg: 'JSC Kazakhtelecom', postal: '050000', lat: 43.257, lon: 76.929 });
  });

  it('falls back to the country header, and knows nothing without either', () => {
    expect(geoFromCloudflare(undefined, 'ge').country).toBe('GE');
    expect(geoFromCloudflare(undefined, null)).toEqual(NO_GEO);
  });

  it('drops odd values instead of storing them', () => {
    const g = geoFromCloudflare({ country: 'XX', city: 'a\u0000b'.repeat(100), timezone: 'not a zone!', asn: -5, asOrganization: 42, latitude: '999', longitude: 'east' }, 'T1');
    expect(g.lat).toBeNull();
    expect(g.lon).toBeNull();
    expect(g.country).toBeNull();
    expect(g.city!.length).toBeLessThanOrEqual(80);
    expect(g.city).not.toContain('\u0000');
    expect(g.timezone).toBeNull();
    expect(g.asn).toBeNull();
    expect(g.asOrg).toBeNull();
  });

  it('every row of a request gets the same place', () => {
    const geo = geoFromCloudflare({ country: 'AM', city: 'Yerevan', asn: 12297, asOrganization: 'Ucom' }, null);
    const rows = rowsFromRequest({ events: [{ path: '/ru' }, { path: '/en/catalog' }] }, geo);
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.country === 'AM' && r.city === 'Yerevan' && r.as_org === 'Ucom' && r.asn === 12297)).toBe(true);
  });
});
