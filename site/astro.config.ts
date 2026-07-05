import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://bathfilmclub.co.uk', // update to match deployed URL
  integrations: [react()],
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
