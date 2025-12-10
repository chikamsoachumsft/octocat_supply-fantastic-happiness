/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    coverage: {
      // Include json-summary so CI can read api/coverage/coverage-summary.json
      reporter: ['text', 'json', 'json-summary', 'html'],
      exclude: [
        // Default exclusions
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__x00__*',
        '**/\x00*',
        'cypress/**',
        'test{,s}/**',
        'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
        // Custom exclusions for entry points and scripts
        'src/index.ts',
        'src/init-db.ts',
        'src/seedData.ts',
        'src/db/seed.ts',
        // Exclude TypeScript model interfaces (no executable code)
        'src/models/**/*.ts',
        // Exclude config files
        'eslint.config.mjs',
        '*.config.ts',
        '*.config.js',
        '*.config.mjs',
      ],
    },
  },
});
