import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#8C3646',
          black: '#15262E',
          white: '#FFF7D6',
          green: '#22C55E',
          mustard: '#EABB16',
          cyan: '#175A70',
          magenta: '#674967',
          yellow: '#647A85',
          orange: '#F39530',
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
        body: ['Barlow Semi Condensed', 'sans-serif'],
      },
      maxWidth: {
        site: '1200px',
      },
    },
  },
  plugins: [],
} satisfies Config;
