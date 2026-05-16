import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core dark palette
        background:  '#08080f',
        surface:     '#0f0f1a',
        'surface-2': '#161625',
        border:      'rgba(255,255,255,0.12)',

        // Accent
        accent: {
          DEFAULT: '#6366f1',
          hover:   '#818cf8',
          muted:   'rgba(99,102,241,0.20)',
        },

        // Text hierarchy
        primary:   'rgba(255,255,255,0.92)',
        secondary: 'rgba(255,255,255,0.70)',
        muted:     'rgba(255,255,255,0.48)',
      },

      // Glassmorphism helpers
      backdropBlur: {
        glass: '16px',
        'glass-lg': '24px',
      },
      backgroundImage: {
        'glass':     'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.04) 100%)',
        'glass-card':'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
      },

      borderRadius: {
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      animation: {
        'shimmer': 'shimmer 1.8s infinite linear',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      gridTemplateColumns: {
        '12': 'repeat(12, minmax(0, 1fr))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
