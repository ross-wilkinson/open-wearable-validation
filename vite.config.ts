// `defineConfig` comes from 'vitest/config', not 'vite' — that is the variant
// whose type includes the `test` key. Importing it from 'vite' typechecks
// everything else fine and then fails on `test` alone, which reads like a
// Vitest problem rather than a wrong import.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Base URL set to '/' for root-domain SPA hosting on Vercel with clean URLs.
export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
    },
  },
});
