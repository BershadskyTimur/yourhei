import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Checks against the live database (npm run matches:check). Kept apart from `npm test`, which must work offline.
export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    include: ['scripts/live/**/*.live.test.ts'],
    environment: 'node',
    testTimeout: 120_000,
  },
});
