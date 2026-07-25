/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0B1120',
        'ink-surface': '#131B2E',
        'ink-line': '#223049',
        paper: '#F5F7FA',
        'paper-surface': '#FFFFFF',
        'paper-line': '#E2E8F0',
        pulse: {
          DEFAULT: '#2DD4BF',
          soft: '#5EEAD4',
          dim: '#0F766E',
        },
        volt: {
          DEFAULT: '#7C5CFC',
          soft: '#A78BFA',
        },
        warn: '#F59E0B',
        danger: '#FB4B67',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        pulseLine: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'pulse-line': 'pulseLine 2.4s ease-in-out infinite',
        'fade-up': 'fadeUp 0.5s ease-out both',
        glow: 'glow 2.2s ease-in-out infinite',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(11, 17, 32, 0.28)',
      },
    },
  },
  plugins: [],
};
