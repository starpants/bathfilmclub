import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://bathfilmclub.co.uk', // update to match deployed URL
  integrations: [react(), tailwind()],
  output: 'static',
});
