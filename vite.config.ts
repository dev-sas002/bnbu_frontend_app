/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// One config for both the app and the tests. There used to be a separate
// vitest.config.ts, and because it takes precedence over this file its test
// runs had no '@' alias -- so anything importing '@/assets/...' failed to
// resolve and the suite could not run.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Route-level `lazy()` splits the pages; this splits the vendor half,
    // which is the larger of the two and almost never changes. Without it the
    // chart library and the markdown renderer end up in whichever route chunk
    // happens to import them first, and a one-line app change invalidates the
    // whole download.
    rollupOptions: {
      output: {
        manualChunks: {
          // 'react/jsx-runtime' must be listed explicitly. It is a separate
          // entry point from 'react', so without it Rollup left it to be
          // absorbed by whichever vendor chunk reached it first -- which was
          // vendor-markdown. That put the 118 kB markdown renderer on the
          // critical path of every route, because the entry chunk imported
          // `jsx` from it.
          'vendor-react': ['react', 'react/jsx-runtime', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-charts': ['recharts'],
          'vendor-markdown': ['react-markdown'],
          'vendor-forms': ['formik', 'yup', 'react-datepicker', 'react-dropzone'],
        },
      },
    },
    // The largest remaining chunk is the React + Redux vendor bundle at a bit
    // over 300 kB raw. Anything past 400 kB is a regression worth a warning.
    chunkSizeWarningLimit: 400,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
});
