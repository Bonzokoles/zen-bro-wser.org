// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ZENO Browser',
  tagline: 'AI-Powered Browsing with Multi-Model Integration',
  favicon: 'img/favicon.ico',

  // Production URL of your site
  url: 'https://zenbrowsers.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',

  // GitHub Pages deployment config
  organizationName: 'Bonzokoles',
  projectName: 'zen-bro-wser.org',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pl'],
    localeConfigs: {
      en: {
        label: 'English',
        htmlLang: 'en',
      },
      pl: {
        label: 'Polski',
        htmlLang: 'pl',
      },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/Bonzokoles/zen-bro-wser.org/tree/main/website/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/Bonzokoles/zen-bro-wser.org/tree/main/website/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Social card image
      image: 'img/zeno-social-card.png',

      // Announcement bar
      announcementBar: {
        id: 'beta_notice',
        content: '🚀 ZENO Browser is in beta. <a href="/docs/getting-started">Get started</a> or <a href="https://github.com/Bonzokoles/zen-bro-wser.org">star us on GitHub</a>!',
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
        isCloseable: true,
      },

      navbar: {
        title: 'ZENO Browser',
        logo: {
          alt: 'ZENO Browser Logo',
          src: 'img/logo.svg',
          srcDark: 'img/logo-dark.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'docs',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/docs/api-reference',
            label: 'API',
            position: 'left',
          },
          {
            to: '/blog',
            label: 'Blog',
            position: 'left',
          },
          {
            to: '/download',
            label: '⬇️ Download',
            position: 'left',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/Bonzokoles/zen-bro-wser.org',
            label: 'GitHub',
            position: 'right',
          },
          {
            type: 'docsVersionDropdown',
            position: 'right',
          },
        ],
      },

      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Getting Started',
                to: '/docs/getting-started',
              },
              {
                label: 'Installation',
                to: '/docs/installation/windows',
              },
              {
                label: 'User Guide',
                to: '/docs/user-guide',
              },
              {
                label: 'Plugin Development',
                to: '/docs/plugin-development',
              },
              {
                label: 'API Reference',
                to: '/docs/api-reference',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'GitHub Issues',
                href: 'https://github.com/Bonzokoles/zen-bro-wser.org/issues',
              },
              {
                label: 'GitHub Discussions',
                href: 'https://github.com/Bonzokoles/zen-bro-wser.org/discussions',
              },
              {
                label: 'Discord',
                href: 'https://discord.gg/zeno-browser',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/Bonzokoles/zen-bro-wser.org',
              },
              {
                label: 'Changelog',
                href: 'https://github.com/Bonzokoles/zen-bro-wser.org/blob/main/CHANGELOG.md',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ZENO Browser. Built with Docusaurus.`,
      },

      prism: {
        theme: require('prism-react-renderer').themes.github,
        darkTheme: require('prism-react-renderer').themes.dracula,
        additionalLanguages: [
          'bash',
          'typescript',
          'javascript',
          'json',
          'yaml',
          'toml',
          'powershell',
          'nsis',
        ],
      },

      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },

      algolia: {
        // Configure if you set up Algolia DocSearch
        // appId: 'YOUR_APP_ID',
        // apiKey: 'YOUR_SEARCH_API_KEY',
        // indexName: 'zeno-browser',
        // contextualSearch: true,
      },
    }),

  plugins: [
    [
      '@docusaurus/plugin-ideal-image',
      {
        quality: 70,
        max: 1030,
        min: 640,
        steps: 2,
        disableInDev: false,
      },
    ],
  ],
};

module.exports = config;
