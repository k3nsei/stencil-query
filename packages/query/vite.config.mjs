/// <reference types="vitest/config" />
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @see https://vite.dev/config/
 * @type {import('vite').UserConfig}
 */
const config = defineConfig({
  plugins: [
    dts({
      tsconfigPath: './tsconfig.lib.json',
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      name: 'StencilQuery',
      fileName: 'stencil-query',
      formats: ['es', 'umd'],
      entry: resolve(__dirname, 'src/index.ts'),
    },
  },
  test: {
    globals: true,
    silent: true,
    watch: !process.env.CI,
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: !!process.env.CI,
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
    include: ['src/**/*.spec.ts'],
    reporters: !!process.env.CI ? ['default', 'github-actions'] : ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: resolve(__dirname, 'coverage'),
    },
  },
});

export default config;
