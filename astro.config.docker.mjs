// @ts-check
// Docker-specific config (static output, no adapter needed)

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
    site: 'http://localhost:4321',
    output: 'static', // Static build for Docker
    server: {
        port: 5173,
        host: '0.0.0.0'
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
            noExternal: ['crypto-js', 'webamp']
        },
        resolve: {
            alias: {
                'http': 'rollup-plugin-node-polyfills/polyfills/http',
                'https': 'rollup-plugin-node-polyfills/polyfills/https',
            },
        },
    },
});
