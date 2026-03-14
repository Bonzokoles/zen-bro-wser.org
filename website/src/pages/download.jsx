import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const downloads = [
  {
    platform: '🪟 Windows',
    items: [
      { label: 'Windows 64-bit (Recommended)', file: 'ZENO-Browser-Setup-x64.exe', desc: 'Installer for Windows 10/11 (64-bit)' },
      { label: 'Windows 32-bit', file: 'ZENO-Browser-Setup-ia32.exe', desc: 'Installer for older 32-bit Windows' },
      { label: 'Portable (no install)', file: 'ZENO-Browser-x64.exe', desc: 'Run without installing' },
    ],
    guide: '/docs/installation/windows',
  },
  {
    platform: '🍎 macOS',
    items: [
      { label: 'macOS Apple Silicon (M1/M2/M3)', file: 'ZENO-Browser-arm64.dmg', desc: 'For Apple Silicon Macs' },
      { label: 'macOS Intel', file: 'ZENO-Browser-x64.dmg', desc: 'For Intel-based Macs' },
    ],
    guide: '/docs/installation/macos',
  },
  {
    platform: '🐧 Linux',
    items: [
      { label: 'AppImage (Universal)', file: 'ZENO-Browser-x86_64.AppImage', desc: 'Portable, works on all Linux distros' },
      { label: 'Debian/Ubuntu (.deb)', file: 'ZENO-Browser_amd64.deb', desc: 'For Debian, Ubuntu, Mint, etc.' },
      { label: 'Fedora/RHEL (.rpm)', file: 'ZENO-Browser-x86_64.rpm', desc: 'For Fedora, RHEL, openSUSE, etc.' },
    ],
    guide: '/docs/installation/linux',
  },
];

const RELEASES_URL = 'https://github.com/Bonzokoles/zen-bro-wser.org/releases/latest';

export default function Download() {
  return (
    <Layout title="Download ZENO Browser" description="Download ZENO Browser for Windows, macOS, or Linux">
      <main style={{ padding: '3rem 0' }}>
        <div className="container">
          <div className="text--center" style={{ marginBottom: '3rem' }}>
            <Heading as="h1">⬇️ Download ZENO Browser</Heading>
            <p style={{ fontSize: '1.1rem' }}>
              Choose your platform below or{' '}
              <a href={RELEASES_URL} target="_blank" rel="noreferrer">
                view all releases on GitHub
              </a>.
            </p>
          </div>

          {downloads.map((platform) => (
            <div key={platform.platform} style={{ marginBottom: '3rem' }}>
              <Heading as="h2">{platform.platform}</Heading>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {platform.items.map((item) => (
                  <a
                    key={item.file}
                    href={`${RELEASES_URL}/download/${item.file}`}
                    style={{
                      display: 'block',
                      padding: '1.25rem',
                      borderRadius: '0.75rem',
                      border: '1px solid var(--ifm-color-emphasis-300)',
                      textDecoration: 'none',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <strong>{item.label}</strong>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', opacity: 0.7 }}>{item.desc}</p>
                    <code style={{ fontSize: '0.75rem' }}>{item.file}</code>
                  </a>
                ))}
              </div>
              <p style={{ marginTop: '0.75rem' }}>
                📚 <a href={platform.guide}>Installation guide for {platform.platform.replace(/^[^\s]+ /, '')}</a>
              </p>
            </div>
          ))}

          <div style={{
            padding: '1.5rem',
            borderRadius: '0.75rem',
            background: 'var(--ifm-color-emphasis-100)',
            marginTop: '2rem',
          }}>
            <Heading as="h3">🔧 Build from Source</Heading>
            <p>Want to build ZENO Browser yourself?</p>
            <pre><code>{`git clone https://github.com/Bonzokoles/zen-bro-wser.org.git
cd zen-bro-wser.org/ZENO_WEB_CORE_APP
npm install
npm run dev`}</code></pre>
            <a href="/docs/development/contributing" className="button button--outline button--primary">
              Development Guide
            </a>
          </div>
        </div>
      </main>
    </Layout>
  );
}
