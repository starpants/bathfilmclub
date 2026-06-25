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
          alt: '#2A8476',
        },
        'bfc-tier': {
          selected: '#674967',
          shortlisted: '#175A70',
          nominated: '#253A3C',
          nominated2: '#4C685E',
        },
        'bfc-status': {
          selected: '#00A992',
          shortlisted: '#EABB16',
          nominated: '#FFF8EA',
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
      },
      fontFamily: {
        heading: ['Barlow Condensed', 'sans-serif'],
        display: ['Notable', 'sans-serif'],
        body: ['Barlow Condensed', 'sans-serif'],
      },
      maxWidth: {
        site: '1200px',
      },
    },
  },
  plugins: [],
} satisfies Config;
