import path from 'node:path';
import type { NextConfig } from 'next';

// next-intl normally does this through `createNextIntlPlugin`, but that plugin loads
// @swc/core (only needed for its optional message-extraction feature, which we do not use),
// and that native module fails to load on this Windows setup. The only thing we need from
// the plugin is the alias that tells next-intl where our request config lives.
const REQUEST_CONFIG = './src/i18n/request.ts';

const nextConfig: NextConfig = {
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
