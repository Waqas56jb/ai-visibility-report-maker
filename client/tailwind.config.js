/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        paper: 'var(--color-paper)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        accent: 'var(--color-accent)',
        accent2: 'var(--color-accent-2)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
      },
      fontFamily: {
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Syne', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Times New Roman', 'Times', 'serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(79, 125, 255, 0.28)',
        'glow-sm': '0 0 24px rgba(79, 125, 255, 0.18)',
      },
      letterSpacing: {
        luxury: '0.28em',
      },
    },
  },
  plugins: [],
};
