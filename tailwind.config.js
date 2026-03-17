/** @type {import('tailwindcss').Config} */

// Design tokens. Everything visual in the app resolves to a name from this
// file -- components never hardcode a hex value. Adding a theme is a matter of
// changing these scales, not of touching component markup.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand: the BnBu crimson, as a full scale so hover/active/subtle
        // states are derived rather than invented per component.
        brand: {
          50: '#fff1f2',
          100: '#ffe0e2',
          200: '#ffc6ca',
          300: '#ff9ea5',
          400: '#fb6772',
          500: '#ef3c49',
          600: '#db1f2f',
          700: '#b81725',
          800: '#991722',
          900: '#7f1a22',
        },
        // Neutral base. Named by role so a reader of the markup can tell what
        // a colour is for; `ink` is text, `surface` is background, `line` is
        // a border.
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569',
          subtle: '#64748b',
          inverse: '#f8fafc',
        },
        surface: {
          DEFAULT: '#ffffff',
          sunken: '#f8fafc',
          raised: '#ffffff',
          accent: '#f1f5f9',
        },
        line: {
          DEFAULT: '#e2e8f0',
          strong: '#cbd5e1',
        },
        // Semantic tones, consumed through the status registry in
        // src/ui/statusRegistry.ts rather than directly.
        positive: { bg: '#ecfdf5', fg: '#047857', line: '#a7f3d0' },
        caution: { bg: '#fffbeb', fg: '#b45309', line: '#fde68a' },
        negative: { bg: '#fef2f2', fg: '#b91c1c', line: '#fecaca' },
        info: { bg: '#eff6ff', fg: '#1d4ed8', line: '#bfdbfe' },
        neutral: { bg: '#f1f5f9', fg: '#475569', line: '#e2e8f0' },
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // A restrained type scale -- five sizes carry the whole product.
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem' }],
        base: ['0.875rem', { lineHeight: '1.375rem' }],
        lg: ['1rem', { lineHeight: '1.5rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 3px 0 rgb(15 23 42 / 0.06)',
        raised: '0 4px 12px -2px rgb(15 23 42 / 0.10), 0 2px 4px -2px rgb(15 23 42 / 0.06)',
        overlay: '0 20px 40px -12px rgb(15 23 42 / 0.28)',
      },
      // The fixed app chrome is measured once, here, instead of being repeated
      // as magic `top-16` values across the layout components.
      spacing: {
        header: '3.5rem',
        sidebar: '15rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(2px)' },
          to: { opacity: '1', transform: 'none' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out',
        shimmer: 'shimmer 1.4s infinite',
      },
    },
  },
  plugins: [],
};
