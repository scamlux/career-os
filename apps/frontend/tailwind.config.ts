import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.25rem'
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        bg: 'hsl(var(--bg) / <alpha-value>)',
        panel: 'hsl(var(--panel) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        line: 'hsl(var(--line) / <alpha-value>)',
        text: 'hsl(var(--text) / <alpha-value>)',
        accent: 'hsl(var(--accent) / <alpha-value>)',
        success: 'hsl(var(--success) / <alpha-value>)',
        danger: 'hsl(var(--danger) / <alpha-value>)',
        warning: 'hsl(var(--warning) / <alpha-value>)'
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.8s linear infinite'
      }
    }
  },
  plugins: []
};

export default config;
