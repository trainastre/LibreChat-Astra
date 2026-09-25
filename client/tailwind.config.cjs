// const { fontFamily } = require('tailwindcss/defaultTheme');
const {
  createTailwindColors,
} = require('../packages/client/src/theme/utils/createTailwindColors.js');
const libreChatTailwindPreset = require('../packages/client/tailwind.preset.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    // Include component library files
    '../packages/client/src/**/*.{js,jsx,ts,tsx}',
  ],
  // darkMode: 'class',
  darkMode: ['class'],
  presets: [libreChatTailwindPreset],
  theme: {
    fontFamily: {
      sans: ['Inter', 'sans-serif'],
      /**
       * Roboto Mono is self-hosted (the `@font-face` block in `style.css`), so code
       * renders the same on every platform and carries real bold and italic faces
       * rather than ones the browser synthesizes by smearing and shearing.
       *
       * The tail is reached while the font loads, if it fails, and per glyph for the
       * characters the bundled latin subset omits — box drawing in terminal output
       * most visibly. It is ordered so those glyphs come from a face whose advance
       * width matches Roboto Mono's and keeps its columns: `ui-monospace` resolves
       * to SF Mono on macOS, and Cascadia Mono ships with Windows Terminal.
       * Consolas is last of the named faces because it is narrower than the rest.
       */
      mono: [
        'Roboto Mono',
        'ui-monospace',
        'SFMono-Regular',
        'Menlo',
        'Cascadia Mono',
        'Liberation Mono',
        'Consolas',
        'monospace',
      ],
    },
    // fontFamily: {
    //   sans: ['Söhne', 'sans-serif'],
    //   mono: ['Söhne Mono', 'monospace'],
    // },
    extend: {
      width: {
        authPageWidth: '370px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        /** Radix Collapsible exposes its own height variable, not the accordion one.
         *  The fade rides along so the rows dissolve instead of squashing. Opening
         *  decelerates into place; closing accelerates away, because a decelerating
         *  close stalls over its final pixels before the unmount. */
        'collapsible-down': {
          from: { height: 0, opacity: 0 },
          to: { height: 'var(--radix-collapsible-content-height)', opacity: 1 },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)', opacity: 1 },
          to: { height: 0, opacity: 0 },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-out-left': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'slide-out-right': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'shortcut-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-3px)' },
          '75%': { transform: 'translateX(3px)' },
        },
        /** Named distinctly: `blink` is already taken by keyframes in style.css. */
        'logo-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'refresh-link-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'reset-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.3s cubic-bezier(0, 0, 0.2, 1)',
        'collapsible-up': 'collapsible-up 0.2s cubic-bezier(0.4, 0, 1, 1)',
        'slide-in-right': 'slide-in-right 300ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'slide-in-left': 'slide-in-left 300ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'slide-out-left': 'slide-out-left 300ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'slide-out-right': 'slide-out-right 300ms cubic-bezier(0.25, 0.1, 0.25, 1)',
        'shortcut-shake': 'shortcut-shake 0.25s ease-in-out',
      },
      colors: {
        gray: {
          20: '#ececf1',
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#e3e3e3',
          300: '#cdcdcd',
          400: '#999696',
          500: '#595959',
          600: '#424242',
          700: '#2f2f2f',
          800: '#1a1a1a',
          850: '#171717',
          900: '#0d0d0d',
        },
        /* Palette de marque : remplace le vert LibreChat par défaut.
           On garde la clé "green" pour que toutes les classes existantes
           (bg-green-500, hover:bg-green-600, etc.) héritent automatiquement
           de la nouvelle charte sans devoir toucher chaque composant. */
        green: {
          50: '#eef3ff',
          100: '#dce7ff',
          200: '#b3c9ff',
          300: '#85a8ff',
          400: '#4d7dff',
          500: '#0050ff', // bleu signature
          550: '#0047e6',
          600: '#003ecc', // état hover
          700: '#032e94',
          800: '#0d1a4d',
          900: '#0a1128', // bleu marine (astrelya.com)
        },
        'brand-purple': 'var(--brand-purple)',
        presentation: 'var(--presentation)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-secondary-alt': 'var(--text-secondary-alt)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-warning': 'var(--text-warning)',
        'text-destructive': 'var(--text-destructive)',
        'ring-primary': 'var(--ring-primary)',
        'header-primary': 'var(--header-primary)',
        'header-hover': 'var(--header-hover)',
        'header-button-hover': 'var(--header-button-hover)',
        'surface-active': 'var(--surface-active)',
        'surface-active-alt': 'var(--surface-active-alt)',
        'surface-hover': 'var(--surface-hover)',
        'surface-hover-alt': 'var(--surface-hover-alt)',
        'surface-primary': 'var(--surface-primary)',
        'surface-primary-alt': 'var(--surface-primary-alt)',
        'surface-primary-contrast': 'var(--surface-primary-contrast)',
        'surface-secondary': 'var(--surface-secondary)',
        'surface-secondary-alt': 'var(--surface-secondary-alt)',
        'surface-tertiary': 'var(--surface-tertiary)',
        'surface-tertiary-alt': 'var(--surface-tertiary-alt)',
        'surface-dialog': 'var(--surface-dialog)',
        'surface-submit': 'var(--surface-submit)',
        'surface-submit-hover': 'var(--surface-submit-hover)',
        'surface-destructive': 'var(--surface-destructive)',
        'surface-destructive-hover': 'var(--surface-destructive-hover)',
        'surface-chat': 'var(--surface-chat)',
        'border-light': 'var(--border-light)',
        'border-medium': 'var(--border-medium)',
        'border-medium-alt': 'var(--border-medium-alt)',
        'border-heavy': 'var(--border-heavy)',
        'border-xheavy': 'var(--border-xheavy)',
        'border-destructive': 'var(--border-destructive)',
        /* These are test styles */
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ['switch-unchecked']: 'hsl(var(--switch-unchecked))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('tailwindcss-radix'),
    // require('@tailwindcss/typography'),
  ],
};