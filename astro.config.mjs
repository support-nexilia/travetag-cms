// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import startupCode from 'astro-startup-code';

import node from '@astrojs/node';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  
  integrations: [
    react(),
    startupCode({
      entrypoint: './src/workers/startup.ts',
    }),
  ],

  adapter: node({
    mode: 'standalone'
  }),

  vite: {
    plugins: [tailwindcss()]
  }
});
