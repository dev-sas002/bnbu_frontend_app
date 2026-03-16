/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/** A `test` pattern for every file under the named packages in node_modules. */
const packages = (...names: string[]) =>
  new RegExp(`[\\\\/]node_modules[\\\\/](?:${names.join('|')})[\\\\/]`);

// One config for both the app and the tests. There used to be a separate
// vitest.config.ts, and because it takes precedence over this file its test
// runs had no '@' alias -- so anything importing '@/assets/...' failed to
// resolve and the suite could not run.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    // Route-level `lazy()` splits the pages; these groups split the vendor
    // half, which is the larger of the two and almost never changes. Without
    // them the chart library and the markdown renderer end up in whichever
    // route chunk happens to import them first, and a one-line app change
    // invalidates the whole download.
    //
    // Rolldown groups by module path, not by import graph, so each group
    // names the package's own dependencies too. A dependency left out falls
    // into a shared chunk; one claimed by the wrong group can drag that group
    // onto the critical path. `react/jsx-runtime` is the case that bit
    // before: when it landed in vendor-markdown, the entry chunk imported
    // `jsx` from there and the 118 kB renderer loaded on every route.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              priority: 50,
              // clsx and react-toastify are used by the shell itself; left
              // to the forms group, they pulled it onto the critical path.
              test: packages(
                'react',
                'react-dom',
                'scheduler',
                'react-router',
                'cookie',
                'set-cookie-parser',
                'react-toastify',
                'clsx'
              ),
            },
            {
              name: 'vendor-redux',
              priority: 40,
              test: packages(
                '@reduxjs',
                'react-redux',
                'redux',
                'redux-thunk',
                'reselect',
                'immer',
                'use-sync-external-store'
              ),
            },
            {
              name: 'vendor-charts',
              priority: 30,
              test: packages(
                'recharts',
                'recharts-scale',
                'react-smooth',
                'victory-vendor',
                'd3-[^\\\\/]+',
                'internmap',
                'decimal\\.js-light',
                'eventemitter3',
                'react-transition-group',
                'dom-helpers',
                'fast-equals'
              ),
            },
            {
              name: 'vendor-markdown',
              priority: 20,
              test: packages(
                'react-markdown',
                'remark-[^\\\\/]+',
                'unified',
                'micromark[^\\\\/]*',
                'mdast-[^\\\\/]+',
                'hast-[^\\\\/]+',
                'unist-[^\\\\/]+',
                'vfile[^\\\\/]*',
                'property-information',
                'space-separated-tokens',
                'comma-separated-tokens',
                'decode-named-character-reference',
                'character-entities[^\\\\/]*',
                'devlop',
                'bail',
                'trough',
                'is-plain-obj',
                'html-url-attributes',
                'style-to-[^\\\\/]+',
                'inline-style-parser',
                'zwitch',
                'trim-lines',
                'ccount',
                'estree-util-[^\\\\/]+',
                'extend'
              ),
            },
            {
              // Above the charts group so it owns lodash, which formik and
              // recharts share; the other way round, every form route
              // preloaded the chart library.
              name: 'vendor-forms',
              priority: 35,
              test: packages(
                'formik',
                'yup',
                'react-datepicker',
                'react-dropzone',
                'date-fns',
                '@floating-ui',
                'attr-accept',
                'file-selector',
                'deepmerge',
                'property-expr',
                'tiny-case',
                'toposort',
                'lodash',
                'lodash-es',
                'react-fast-compare'
              ),
            },
          ],
        },
      },
    },
    // The largest remaining chunk is the chart vendor bundle at a bit under
    // 400 kB raw. Anything past that is a regression worth a warning.
    chunkSizeWarningLimit: 400,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
});
