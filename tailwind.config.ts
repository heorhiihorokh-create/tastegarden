import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          deep: 'rgb(var(--ink-deep) / <alpha-value>)',
          soft: 'rgb(var(--ink-soft) / <alpha-value>)',
          raise: 'rgb(var(--ink-raise) / <alpha-value>)',
        },
        crimson: {
          DEFAULT: 'rgb(var(--crimson) / <alpha-value>)',
          deep: 'rgb(var(--crimson-deep) / <alpha-value>)',
          bright: 'rgb(var(--crimson-bright) / <alpha-value>)',
        },
        ember: {
          DEFAULT: 'rgb(var(--ember) / <alpha-value>)',
          soft: 'rgb(var(--ember-soft) / <alpha-value>)',
          deep: 'rgb(var(--ember-deep) / <alpha-value>)',
        },
        cream: {
          DEFAULT: 'rgb(var(--cream) / <alpha-value>)',
          dim: 'rgb(var(--cream-dim) / <alpha-value>)',
        },
        muted: 'rgb(var(--muted) / <alpha-value>)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        eyebrow: '0.32em',
      },
      maxWidth: {
        content: '76rem',
      },
      boxShadow: {
        glow: '0 0 60px -12px rgba(193, 39, 45, 0.55)',
        ember: '0 0 50px -10px rgba(216, 162, 74, 0.45)',
        lift: '0 30px 60px -28px rgba(0, 0, 0, 0.85)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'in-out-soft': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'scroll-cue': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '40%': { opacity: '1' },
          '100%': { transform: 'translateY(12px)', opacity: '0' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.4s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'scroll-cue': 'scroll-cue 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
