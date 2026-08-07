// `defineConfig` comes from 'vitest/config', not 'vite' — that is the variant
// whose type includes the `test` key. Importing it from 'vite' typechecks
// everything else fine and then fails on `test` alone, which reads like a
// Vitest problem rather than a wrong import.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// `base` must match the GitHub Pages project-page path, i.e. the repository
// name: <user>.github.io/validation-study-designer/. Getting it wrong is the
// classic "works on localhost, blank page on Pages" failure — every asset URL
// Vite emits carries this prefix.
export default defineConfig({
  base: '/validation-study-designer/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
    },
  },
});
