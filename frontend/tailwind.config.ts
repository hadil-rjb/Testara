type AddComponentsFn = (components: Record<string, unknown>) => void;
type AddUtilitiesFn = (utilities: Record<string, unknown>) => void;
interface PluginAPI {
  addComponents: AddComponentsFn;
  addUtilities: AddUtilitiesFn;
}

/* ── Brand palette ── */
const brand = {
  primary: {
    DEFAULT: '#654CDE',
    light: '#8B83FF',
    dark: '#5A42C9',
    50: '#F0EEFF',
    100: '#E0DDFF',
    200: '#C1BBFF',
  },
  success: '#22C55E',
  error: '#EF4444',
  warning: '#F59E0B',
} as const;

/* ── Semantic tokens that point at CSS variables (runtime theme swap) ── */
const semantic = {
  surface: {
    DEFAULT: 'var(--bg-primary)',
    secondary: 'var(--bg-secondary)',
    tertiary: 'var(--bg-tertiary)',
    card: 'var(--card-bg)',
    input: 'var(--input-bg)',
    sidebar: 'var(--sidebar-bg)',
  },
  content: {
    DEFAULT: 'var(--text-primary)',
    secondary: 'var(--text-secondary)',
    tertiary: 'var(--text-tertiary)',
  },
  line: {
    DEFAULT: 'var(--border-color)',
    light: 'var(--border-light)',
  },
} as const;

const config = {
  content: [
    './src/app/**/*.{ts,tsx,mdx}',
    './src/components/**/*.{ts,tsx}',
    './src/messages/**/*.json',
  ],

  darkMode: ['class', '[data-theme="dark"]'],

  theme: {
    extend: {
      /* ── Colors ── */
      colors: {
        primary: brand.primary,
        success: brand.success,
        error: brand.error,
        warning: brand.warning,
        surface: semantic.surface,
        content: semantic.content,
        line: semantic.line,
      },

      /* ── Typography ── */
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        body: ['var(--font-body)'],
        heading: ['var(--font-heading)'],
        display: ['var(--font-bricolage)', 'serif'],
        landing: ['var(--font-urbanist)', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
      },

      letterSpacing: {
        'tighter-2': '-0.02em',
        'tighter-1': '-0.015em',
      },

      /* ── Spacing / sizing ── */
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
      },

      boxShadow: {
        card: 'var(--card-shadow)',
        'card-hover': 'var(--card-shadow-hover)',
        'focus-ring': '0 0 0 3px var(--focus-ring)',
      },

      /* ── Animation ── */
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 180ms ease-out both',
        'slide-up': 'slide-up 220ms ease-out both',
        'scale-in': 'scale-in 180ms ease-out both',
        shimmer: 'shimmer 1.6s linear infinite',
      },

      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },

      backgroundImage: {
        'auth-gradient': 'var(--auth-gradient)',
        'brand-gradient':
          'linear-gradient(135deg, var(--color-primary, #654CDE) 0%, var(--color-primary-light, #8B83FF) 100%)',
      },
    },
  },

  plugins: [
    /**
     * Design-system component classes.
     *
     * Registering them as components (not utilities) means:
     *   - They can be overridden with a plain utility in markup
     *     (e.g. `<a className="nav-item bg-transparent">`)
     *   - They're kept together in the generated stylesheet
     */
    function ({ addComponents, addUtilities }: PluginAPI) {
      addComponents({
        /* ── Surface helpers ── */
        '.surface-primary': { backgroundColor: 'var(--bg-primary)' },
        '.surface-secondary': { backgroundColor: 'var(--bg-secondary)' },
        '.surface-tertiary': { backgroundColor: 'var(--bg-tertiary)' },
        '.surface-card': { backgroundColor: 'var(--card-bg)' },
        '.surface-input': { backgroundColor: 'var(--input-bg)' },

        /* ── Text helpers ── */
        '.text-heading': { color: 'var(--text-primary)' },
        '.text-body': { color: 'var(--text-secondary)' },
        '.text-muted': { color: 'var(--text-tertiary)' },

        /* ── Border helpers ── */
        '.border-theme': { borderColor: 'var(--border-color)' },
        '.border-theme-light': { borderColor: 'var(--border-light)' },

        /* ── Alert surfaces ── */
        '.alert-error': {
          backgroundColor: 'var(--alert-error-bg)',
          color: 'var(--alert-error-text)',
        },
        '.alert-success': {
          backgroundColor: 'var(--alert-success-bg)',
          color: 'var(--alert-success-text)',
        },

        /* ── Sidebar nav item ── */
        '.nav-item': {
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.625rem 1rem',
          borderRadius: '0.75rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: 'var(--text-secondary)',
          transition:
            'background-color 180ms ease, color 180ms ease, transform 180ms ease',
          WebkitTapHighlightColor: 'transparent',

          '&:hover': {
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 3px var(--focus-ring)',
          },
          '&:active': { transform: 'scale(0.985)' },
          '&[data-active="true"]': {
            backgroundColor:
              'color-mix(in srgb, var(--color-primary) 10%, transparent)',
            color: 'var(--color-primary)',
            fontWeight: '600',
          },
          '&[data-active="true"]::before': {
            content: '""',
            position: 'absolute',
            left: '-0.75rem',
            top: '25%',
            bottom: '25%',
            width: '3px',
            borderRadius: '0 3px 3px 0',
            backgroundColor: 'var(--color-primary)',
          },
          '&[data-collapsed="true"]': {
            justifyContent: 'center',
            paddingLeft: '0.625rem',
            paddingRight: '0.625rem',
          },
          '&[data-collapsed="true"][data-active="true"]::before': {
            display: 'none',
          },
        },

        /* ── Soft icon button ── */
        '.icon-btn': {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: '0.625rem',
          color: 'var(--text-secondary)',
          transition:
            'background-color 180ms ease, color 180ms ease, transform 120ms ease',
          WebkitTapHighlightColor: 'transparent',

          '&:hover': {
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
          },
          '&:focus-visible': {
            outline: 'none',
            boxShadow: '0 0 0 3px var(--focus-ring)',
          },
          '&:active': { transform: 'scale(0.94)' },
        },
      });

      addUtilities({
        /* Styled scrollbar utility — opt-in with `scrollbar-thin` class */
        '.scrollbar-thin': {
          '&::-webkit-scrollbar': { width: '6px', height: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--border-color)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'var(--text-tertiary)',
          },
        },
      });
    },
  ],
};

export default config;
