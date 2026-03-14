/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'getting-started',
    {
      type: 'category',
      label: '📥 Installation',
      collapsed: false,
      items: [
        'installation/windows',
        'installation/macos',
        'installation/linux',
      ],
    },
    {
      type: 'category',
      label: '📖 User Guide',
      items: [
        'user-guide/index',
        'user-guide/tabs',
        'user-guide/ai-chat',
        'user-guide/mcp-tools',
        'user-guide/agents',
        'user-guide/settings',
        'user-guide/keyboard-shortcuts',
      ],
    },
    {
      type: 'category',
      label: '🔌 Plugin Development',
      items: [
        'plugin-development/index',
        'plugin-development/getting-started',
        'plugin-development/api',
        'plugin-development/publishing',
      ],
    },
    {
      type: 'category',
      label: '📡 API Reference',
      items: [
        'api-reference/index',
        'api-reference/mcp-tools',
        'api-reference/agents',
        'api-reference/ai-gateway',
      ],
    },
    {
      type: 'category',
      label: '🛠️ Development',
      items: [
        'development/architecture',
        'development/contributing',
        'development/version-control',
        'development/deployment',
      ],
    },
    'faq',
    'troubleshooting',
  ],
};

module.exports = sidebars;
