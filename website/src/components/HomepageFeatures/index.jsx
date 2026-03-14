import React from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: '🤖 Multi-Model AI',
    description: (
      <>
        Integrates with Gemini, GPT-4, Claude, and 8+ OpenRouter models.
        Switch between AI providers seamlessly in a single chat interface.
      </>
    ),
  },
  {
    title: '🔧 MCP Tools',
    description: (
      <>
        Built-in Model Context Protocol tools: web search, content analysis,
        bookmark manager, page summarizer, link extractor, and web navigation.
      </>
    ),
  },
  {
    title: '🧠 Agent System',
    description: (
      <>
        BIELIK agent system with specialized Researcher, Coder, and Planner agents
        that can autonomously complete complex tasks using AI and web tools.
      </>
    ),
  },
  {
    title: '🔒 Privacy First',
    description: (
      <>
        API keys secured via Cloudflare Workers proxy. No keys stored in browser.
        Supports local LLMs via Ollama for fully offline AI assistance.
      </>
    ),
  },
  {
    title: '🌐 Cloudflare Integration',
    description: (
      <>
        Deployed on Cloudflare Pages with Workers API. Supports WebTunnels
        for secure proxying and D1 database for persistent knowledge storage.
      </>
    ),
  },
  {
    title: '🔌 Extensible',
    description: (
      <>
        Plugin system for extending ZENO Browser with custom tools, AI providers,
        and UI panels. TypeScript-first plugin API with hot reloading.
      </>
    ),
  },
];

function Feature({ title, description }) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md" style={{ marginBottom: '2rem' }}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
