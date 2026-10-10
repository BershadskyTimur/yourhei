import path from 'node:path';
import type { NextConfig } from 'next';

// next-intl normally does this through `createNextIntlPlugin`, but that plugin loads
// @swc/core (only needed for its optional message-extraction feature, which we do not use),
// and that native module fails to load on this Windows setup. The only thing we need from
// the plugin is the alias that tells next-intl where our request config lives.
const REQUEST_CONFIG = './src/i18n/request.ts';

const isProd = process.env.NODE_ENV === 'production';

// Content-Security-Policy: the browser may load scripts, data and frames only from the places the site
// really uses (Supabase, the OpenFreeMap tiles, Cloudflare Turnstile, Google Analytics). Everything else
// is refused, which limits the damage if a bad script ever gets onto a page.
// "unsafe-inline" is needed by Next.js and the theme switcher for their small inline scripts.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isProd ? '' : "'unsafe-eval'"} https://challenges.cloudflare.com https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://tiles.openfreemap.org https://www.google-analytics.com https://www.googletagmanager.com",
  "font-src 'self' data: https://tiles.openfreemap.org",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://tiles.openfreemap.org https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com${isProd ? '' : ' ws://localhost:* http://localhost:*'}`,
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  'frame-src https://challenges.cloudflare.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  ...(isProd ? ['upgrade-insecure-requests'] : []),
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  ...(isProd ? [{ key: 'Content-Security-Policy', value: csp }] : []),
];
const nextConfig: NextConfig = {
  // Do not tell everybody which framework the site runs on.
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  turbopack: {
    resolveAlias: { 'next-intl/config': REQUEST_CONFIG },
  },
  webpack(config) {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    config.resolve.alias['next-intl/config'] = path.resolve(config.context, REQUEST_CONFIG);
    return config;
  },
};

export default nextConfig;
