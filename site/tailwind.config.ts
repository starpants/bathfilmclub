import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bfc-brand': {
          accent: '#8C3646',
          bg: '#15262E',
          fg: '#FFF7D6',
        },
        'bfc-tier': {
          selected: '#674967',
          shortlisted: '#175A70',
          nominatedorig: '#647A85',
          nominated: '#4C685E',
          event: '#2A8476',
        },
        'bfc-status': {
          selected: '#22C55E',
          shortlisted: '#EABB16',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        test: '#2A8476',
      },
      fontFamily: {
        heading: ['Barlow Semi Condensed', 'sans-serif'],
        display: ['Notable', 'sans-serif'],
        body: ['Barlow Semi Condensed', 'sans-serif'],
      },
      maxWidth: {
        site: '1200px',
      },
    },
  },
  plugins: [],
} satisfies Config;
