/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],

  corePlugins: {
    preflight: false,
  },

  theme: {
    extend: {
      colors: {
        // ── Color de marca: Emerald ────────────────────────────────────────
        // Fresco, moderno, asociado con crecimiento y dinero — perfecto
        // para una app de gestión de panadería con ventas e inventario.
        brand: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },

        // ── Peligro / error ────────────────────────────────────────────────
        danger: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },

        // ── Advertencia / gastos ───────────────────────────────────────────
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },

        // ── Acento secundario: violet ──────────────────────────────────────
        // Para reportes, exportar, acciones secundarias — contrasta
        // bien con emerald sin competir con él.
        accent: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },

        // ── Tokens semánticos — se adaptan a dark mode via CSS vars ───────
        bg:        'rgb(var(--color-bg)       / <alpha-value>)',
        surface:   'rgb(var(--color-surface)   / <alpha-value>)',
        'surface-2':'rgb(var(--color-surface-2)/ <alpha-value>)',
        line:      'rgb(var(--color-line)      / <alpha-value>)',
        ink:       'rgb(var(--color-ink)       / <alpha-value>)',
        muted:     'rgb(var(--color-muted)     / <alpha-value>)',
      },

      boxShadow: {
        brand:   '0 8px 24px -8px rgb(16 185 129 / 0.4)',
        accent:  '0 8px 24px -8px rgb(139 92 246 / 0.4)',
        danger:  '0 8px 24px -8px rgb(239 68 68  / 0.35)',
        card:    '0 1px 4px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.08)',
        modal:   '0 8px 32px rgba(0,0,0,0.12)',
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },

      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs:    ['11px', { lineHeight: '16px' }],
        sm:    ['12px', { lineHeight: '16px' }],
        base:  ['13px', { lineHeight: '20px' }],
        md:    ['14px', { lineHeight: '20px' }],
        lg:    ['15px', { lineHeight: '22px' }],
        xl:    ['16px', { lineHeight: '24px' }],
        '2xl': ['18px', { lineHeight: '28px' }],
        '3xl': ['20px', { lineHeight: '28px' }],
        '4xl': ['22px', { lineHeight: '32px' }],
      },

      borderRadius: {
        sm:   '6px',
        md:   '8px',
        lg:   '10px',
        xl:   '12px',
        '2xl':'14px',
        '3xl':'16px',
        '4xl':'20px',
      },

      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        '4.5': '18px',
        '13':  '52px',
        '15':  '60px',
        '18':  '72px',
      },

      screens: {
        xs: '380px',
      },

      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pop': {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '100%': { transform: 'scale(1)',   opacity: '1' },
        },
        'spin-smooth': {
          to: { transform: 'rotate(360deg)' },
        },
        'brand-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgb(16 185 129 / 0.35)' },
          '50%':      { boxShadow: '0 0 0 8px rgb(16 185 129 / 0)' },
        },
        'slide-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },

      animation: {
        'fade-in':     'fade-in 0.2s ease both',
        'slide-in':    'slide-in 0.22s ease',
        'slide-up':    'slide-up 0.2s ease both',
        'pop':         'pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spin-smooth': 'spin-smooth 0.7s linear infinite',
        'brand-glow':  'brand-glow 2.4s ease-in-out infinite',
      },
    },
  },

  plugins: [],
};