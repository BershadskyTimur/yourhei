import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// Pages built in advance are served from the static assets; no R2 bucket or KV is needed for a first test.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
