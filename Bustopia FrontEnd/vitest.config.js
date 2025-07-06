/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    css: true,
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/setupTests.js',
      ],
    },
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'forks',
    maxConcurrency: 1,
    maxWorkers: 1,
    minWorkers: 1,
    teardownTimeout: 5000,
    slowTestThreshold: 2000,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
  },
});
