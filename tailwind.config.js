/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',

  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════════════════════════════
        // BRAND — CYAN
        // Identidad tecnológica principal
        // ═══════════════════════════════════════════════════════════════
        brand: {
          50:  '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },

        // ═══════════════════════════════════════════════════════════════
        // ACCENT — ELECTRIC BLUE
        // Tecnología, analytics, gráficos y acciones secundarias
        // ═══════════════════════════════════════════════════════════════
        accent: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },

        // ═══════════════════════════════════════════════════════════════
        // SUCCESS — ELECTRIC LIME
        // Ventas, crecimiento, inventario saludable
        // ═══════════════════════════════════════════════════════════════
        success: {
          50:  '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
          950: '#1a2e05',
        },

        // ═══════════════════════════════════════════════════════════════
        // WARNING — AMBER
        // Gastos, alertas y stock bajo
        // ═══════════════════════════════════════════════════════════════
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

        // ═══════════════════════════════════════════════════════════════
        // DANGER — ROSE
        // Errores, eliminaciones y estados críticos
        // ═══════════════════════════════════════════════════════════════
        danger: {
          50:  '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
          800: '#9f1239',
          900: '#881337',
          950: '#4c0519',
        },

        // ═══════════════════════════════════════════════════════════════
        // SLATE — SISTEMA NEUTRAL
        // ═══════════════════════════════════════════════════════════════
        slate: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },

        // ═══════════════════════════════════════════════════════════════
        // TOKENS SEMÁNTICOS
        // ═══════════════════════════════════════════════════════════════
        bg:
          'rgb(var(--color-bg) / <alpha-value>)',

        surface:
          'rgb(var(--color-surface) / <alpha-value>)',

        'surface-2':
          'rgb(var(--color-surface-2) / <alpha-value>)',

        line:
          'rgb(var(--color-line) / <alpha-value>)',

        ink:
          'rgb(var(--color-ink) / <alpha-value>)',

        muted:
          'rgb(var(--color-muted) / <alpha-value>)',
      },

      // ═══════════════════════════════════════════════════════════════
      // SOMBRAS TECNOLÓGICAS
      // ═══════════════════════════════════════════════════════════════
      boxShadow: {
        brand:
          '0 8px 30px -10px rgb(6 182 212 / 0.45)',

        accent:
          '0 8px 30px -10px rgb(59 130 246 / 0.40)',

        success:
          '0 8px 30px -10px rgb(132 204 22 / 0.35)',

        danger:
          '0 8px 30px -10px rgb(244 63 94 / 0.35)',

        card:
          '0 1px 3px rgb(15 23 42 / 0.06), 0 0 0 1px rgb(15 23 42 / 0.04)',

        modal:
          '0 24px 60px -16px rgb(2 6 23 / 0.25)',

        glow:
          '0 0 30px rgb(6 182 212 / 0.15)',

        'glow-blue':
          '0 0 30px rgb(59 130 246 / 0.15)',
      },

      // ═══════════════════════════════════════════════════════════════
      // TIPOGRAFÍA
      // ═══════════════════════════════════════════════════════════════
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],

        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Courier New',
          'monospace',
        ],
      },

      // ═══════════════════════════════════════════════════════════════
      // FONT SIZES
      // ═══════════════════════════════════════════════════════════════
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs:    ['11px', { lineHeight: '16px' }],
        sm:    ['12px', { lineHeight: '16px' }],
        base:  ['13px', { lineHeight: '20px' }],
        md:    ['14px', { lineHeight: '20px' }],
        lg:    ['15px', { lineHeight: '22px' }],
        xl:    ['16px', { lineHeight: '24px' }],
        '2xl': ['18px', { lineHeight: '26px' }],
        '3xl': ['20px', { lineHeight: '28px' }],
        '4xl': ['24px', { lineHeight: '32px' }],
        '5xl': ['30px', { lineHeight: '36px' }],
      },

      // ═══════════════════════════════════════════════════════════════
      // BORDER RADIUS
      // ═══════════════════════════════════════════════════════════════
      borderRadius: {
        sm:    '6px',
        md:    '8px',
        lg:    '10px',
        xl:    '12px',
        '2xl': '14px',
        '3xl': '16px',
        '4xl': '20px',
        '5xl': '24px',
      },

      // ═══════════════════════════════════════════════════════════════
      // SPACING
      // ═══════════════════════════════════════════════════════════════
      spacing: {
        'safe-top':    'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        '4.5':         '18px',
        '13':          '52px',
        '15':          '60px',
        '18':          '72px',
      },

      screens: {
        xs: '380px',
      },

      // ═══════════════════════════════════════════════════════════════
      // ANIMACIONES
      // ═══════════════════════════════════════════════════════════════
      keyframes: {
        'fade-in': {
          '0%': {
            opacity: '0',
            transform: 'translateY(6px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        'slide-in': {
          '0%': {
            transform: 'translateX(100%)',
          },
          '100%': {
            transform: 'translateX(0)',
          },
        },

        pop: {
          '0%': {
            transform: 'scale(0.5)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },

        'spin-smooth': {
          to: {
            transform: 'rotate(360deg)',
          },
        },

        'brand-glow': {
          '0%, 100%': {
            boxShadow:
              '0 0 0 0 rgb(6 182 212 / 0.35)',
          },

          '50%': {
            boxShadow:
              '0 0 0 8px rgb(6 182 212 / 0)',
          },
        },

        'slide-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)',
          },

          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.96)',
          },

          '100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
      },

      animation: {
        'fade-in':
          'fade-in 0.2s ease both',

        'slide-in':
          'slide-in 0.22s ease',

        'slide-up':
          'slide-up 0.2s ease both',

        pop:
          'pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',

        'spin-smooth':
          'spin-smooth 0.7s linear infinite',

        'brand-glow':
          'brand-glow 2.4s ease-in-out infinite',

        'scale-in':
          'scale-in 0.18s ease both',
      },
    },
  },

  plugins: [],
};