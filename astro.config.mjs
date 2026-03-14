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
    platformProxy: { enabled: true },
    cloudflareModules: true,
    imageService: 'compile', // Fix: passthrough nie działa w Cloudflare SSR
    // Uwaga: domyślnie adapter oczekuje KV o nazwie 'SESSION'. Dodaj binding w Pages lub zmień nazwę przez sessionKVBindingName.
  }),
  server: {
    port: 4367,
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
    server: {
      proxy: {
        '/api/cayd': {
          target: 'http://localhost:6040',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cayd/, '/api')
        }
      }
    },
    ssr: {
      external: ['node:async_hooks', 'webamp'],
      noExternal: ['crypto-js']
    },
  },
});