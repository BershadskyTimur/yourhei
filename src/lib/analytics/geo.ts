// Where a visit comes from, as the hosting network (Cloudflare) sees it: country, region, city, time zone and the network
// that owns the address (the internet provider or company, e.g. "Kazakhtelecom JSC"). The IP address itself is never
// stored or sent anywhere. Only recorded for visitors who pressed "Accept all" in the cookie banner (see api/track).

export interface VisitGeo {
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  asn: number | null;
  asOrg: string | null;
}

export const NO_GEO: VisitGeo = { country: null, region: null, city: null, timezone: null, asn: null, asOrg: null };

/** A short text without control characters, or null. */
function text(v: unknown, max: number): string | null {
  if (typeof v !== 'string') return null;
  const t = v.replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return t ? t.slice(0, max) : null;
}

/**
 * Turns Cloudflare's request properties (request.cf) and, when they are missing, the country header into checked values.
 * Pure function: everything about the place of a visit that reaches the database goes through here.
 */
export function geoFromCloudflare(cf: Record<string, unknown> | undefined | null, countryHeader: string | null): VisitGeo {
  const c = cf ?? {};
  const country = (text(c.country, 2) ?? text(countryHeader, 2))?.toUpperCase() ?? null;
  const asn = typeof c.asn === 'number' && Number.isInteger(c.asn) && c.asn > 0 && c.asn < 2 ** 32 ? c.asn : null;
  const timezone = text(c.timezone, 60);
  return {
    // "XX" (unknown) and "T1" (Tor) are Cloudflare's codes for "no country"
    country: country && /^[A-Z]{2}$/.test(country) && country !== 'XX' && country !== 'T1' ? country : null,
    region: text(c.region, 80),
    city: text(c.city, 80),
    timezone: timezone && /^[A-Za-z_]+(\/[A-Za-z0-9_+\-]+){0,2}$/.test(timezone) ? timezone : null,
    asn,
    asOrg: text(c.asOrganization, 120),
  };
}
