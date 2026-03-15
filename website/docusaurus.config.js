// @ts-check
import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'ZENO Browser',
  tagline: 'AI-Powered Browser with MCP Integration',
  favicon: 'img/favicon.ico',
  url: 'https://Bonzokoles.github.io',
  baseUrl: '/zen-bro-wser.org/',
  organizationName: 'Bonzokoles',
  projectName: 'zen-bro-wser.org',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: { defaultLocale: 'en', locales: ['en', 'pl'] },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/Bonzokoles/zen-bro-wser.org/tree/main/website/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: { type: ['rss', 'atom'], xslt: true },
        },
        theme: { customCss: './src/css/custom.css' },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/zeno-social-card.png',
      navbar: {
        title: 'ZENO Browser',
        logo: { alt: 'ZENO Browser Logo', src: 'img/logo.svg' },
        items: [
          { type: 'docSidebar', sidebarId: 'tutorialSidebar', position: 'left', label: 'Docs' },
          { to: '/blog', label: 'Blog', position: 'left' },
          { href: 'https://github.com/Bonzokoles/zen-bro-wser.org', label: 'GitHub', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              { label: 'Getting Started', to: '/docs/intro' },
              { label: 'MCP Tools', to: '/docs/mcp-tools' },
              { label: 'API Reference', to: '/docs/api' },
            ],
          },
          {
            title: 'Community',
            items: [
              { label: 'GitHub', href: 'https://github.com/Bonzokoles/zen-bro-wser.org' },
              { label: 'Issues', href: 'https://github.com/Bonzokoles/zen-bro-wser.org/issues' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} ZENO Browser. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['typescript', 'python', 'bash', 'yaml'],
      },
      colorMode: { defaultMode: 'dark', respectPrefersColorScheme: true },
    }),
};

export default config;
