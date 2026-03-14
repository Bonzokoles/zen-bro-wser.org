import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHero() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started">
            🚀 Get Started — 5 min ⏱️
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            to="/download"
            style={{ marginLeft: '1rem' }}>
            ⬇️ Download
          </Link>
        </div>
        <div className={styles.platformBadges}>
          <span>🪟 Windows</span>
          <span>🍎 macOS</span>
          <span>🐧 Linux</span>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - AI-Powered Browser`}
      description="ZENO Browser: AI-powered browsing with Gemini, GPT-4, Claude, and local model support. MCP tools, BIELIK agents, and Cloudflare integration.">
      <HomepageHero />
      <main>
        <HomepageFeatures />

        <section style={{ padding: '3rem 0', background: 'var(--ifm-background-surface-color)' }}>
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2 text--center">
                <Heading as="h2">Quick Install</Heading>
                <p>Download the installer for your platform or run from source.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link className="button button--primary button--lg" to="/docs/installation/windows">
                    🪟 Windows
                  </Link>
                  <Link className="button button--primary button--lg" to="/docs/installation/macos">
                    🍎 macOS
                  </Link>
                  <Link className="button button--primary button--lg" to="/docs/installation/linux">
                    🐧 Linux
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
