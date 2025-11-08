// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://zeno-browser.pages.dev',
  output: 'server',
  adapter: cloudflare({
    mode: 'directory',
    platformProxy: {
      enabled: true
    }
  }),
  server: {
    port: 4366,
    host: true
  },
  integrations: [mdx(), sitemap(), react(), tailwind({
    applyBaseStyles: false,
  })],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pl', 'de', 'es', 'fr'],
  },
  vite: {
    ssr: {
      external: ['node:async_hooks'],
      noExternal: ['crypto-js']
    },
    resolve: {
      alias: {
        'http': 'rollup-plugin-node-polyfills/polyfills/http',
        'https': 'rollup-plugin-node-polyfills/polyfills/https',
      },
    },
  },
});