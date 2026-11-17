import { describe, expect, it } from 'vitest';
import { isLocalVisit } from './local';

describe('a visit to a copy of the site on one\'s own computer', () => {
  it('is local when the site is opened as localhost or by a loopback address', () => {
    for (const host of ['localhost', 'LOCALHOST', 'localhost.', 'app.localhost', '127.0.0.1', '127.1.2.3', '[::1]', '0.0.0.0']) {
      expect(isLocalVisit(host, '203.0.113.7'), host).toBe(true);
    }
  });

  it('is local when the site is opened over the home network (a phone on the same Wi-Fi)', () => {
    for (const host of ['192.168.1.5', '10.0.0.2', '172.16.0.1', '172.31.255.255', '169.254.10.1', '[fd12:3456::1]', '[fe80::1]']) {
      expect(isLocalVisit(host, null), host).toBe(true);
    }
  });

  it('is local when the visitor is the computer itself or a device of its network', () => {
    for (const ip of ['::1', '127.0.0.1', '::ffff:127.0.0.1', '192.168.0.10', '::FFFF:192.168.0.10', 'fe80::1%eth0', 'fd00::5']) {
      expect(isLocalVisit('www.yourhei.com', ip), ip).toBe(true);
    }
  });

  it('a visit to the live site from a real address is saved', () => {
    for (const ip of ['203.0.113.7', '95.59.12.4', '2a02:2168:8f1:1::1', '172.32.0.1', '172.15.0.1', '192.169.0.1', '11.0.0.1', '128.0.0.1', 'fd::1', 'fc::1', 'fec0::1']) {
      expect(isLocalVisit('www.yourhei.com', ip), ip).toBe(false);
    }
    expect(isLocalVisit('yourhei.com', null)).toBe(false);
    expect(isLocalVisit('yourhei.example.workers.dev', 'unknown')).toBe(false);
  });

  it('a site name that only looks like an address is not local', () => {
    for (const host of ['localhost.com', 'mylocalhost', '127.0.0.1.nip.io', 'fd12.example.com', '192.168.1.5.example.com']) {
      expect(isLocalVisit(host, '203.0.113.7'), host).toBe(false);
    }
  });

  it('nothing known is not local', () => {
    expect(isLocalVisit(null, null)).toBe(false);
    expect(isLocalVisit(undefined, undefined)).toBe(false);
    expect(isLocalVisit('', '')).toBe(false);
  });
});
