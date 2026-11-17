// Visits to a copy of the site running on someone's own computer (`next dev`, `next start`, `opennextjs-cloudflare
// preview`) are checks by the owner or by Claude, not visitors. They are not saved (see api/track), so they no longer
// show up in the admin's visit statistics. On the live site the address is always www.yourhei.com and the visitor's
// address comes from Cloudflare, which is never one of the addresses below, so real visits are never dropped.

/**
 * An address that exists only inside one computer or one home / office network: the computer itself (127.x.x.x, ::1),
 * a private network (10.x, 172.16-31.x, 192.168.x, fc00::/7), a link-local one (169.254.x, fe80::/10) or "any" (0.x, ::).
 */
function isPrivateAddress(address: string): boolean {
  let a = address.trim().toLowerCase();
  if (a.startsWith('[') && a.endsWith(']')) a = a.slice(1, -1);
  const zone = a.indexOf('%'); // fe80::1%eth0
  if (zone >= 0) a = a.slice(0, zone);
  if (a.startsWith('::ffff:')) a = a.slice(7); // an IPv4 address written as IPv6 (::ffff:127.0.0.1)

  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(a);
  if (v4) {
    const [first, second] = [Number(v4[1]), Number(v4[2])];
    return (
      first === 127 ||
      first === 10 ||
      first === 0 ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 169 && second === 254)
    );
  }
  if (!a.includes(':')) return false;
  // the first group has all four digits: "fd12:..." is private, "fd::1" (= 00fd::1) is not
  return a === '::1' || a === '::' || /^f[cd][0-9a-f]{2}:/.test(a) || /^fe[89ab][0-9a-f]:/.test(a);
}

/**
 * Whether a request to api/track comes from a copy of the site running locally. Pure function.
 * @param hostname the site's address as the server sees it (request.nextUrl.hostname), e.g. "localhost" or "www.yourhei.com"
 * @param ip the visitor's address (Cloudflare's, or the one the local server saw), or null when unknown
 */
export function isLocalVisit(hostname: string | null | undefined, ip: string | null | undefined): boolean {
  const host = (hostname ?? '').trim().toLowerCase().replace(/\.$/, '');
  if (host === 'localhost' || host.endsWith('.localhost') || (host !== '' && isPrivateAddress(host))) return true;
  return !!ip && isPrivateAddress(ip);
}
