---
sidebar_position: 1
title: Getting Started
description: Get up and running with ZENO Browser in 5 minutes
---

# 🚀 Getting Started with ZENO Browser

ZENO Browser is an AI-powered browser built with Astro 5 + React 18, featuring multi-model AI integration (Gemini, GPT-4, Claude), MCP tools, and a modular agent system.

---

## What is ZENO Browser?

ZENO Browser provides:

- **Multi-tab browsing** with a modern, clean UI
- **AI Chat panel** supporting Gemini, OpenRouter (8 models), and Claude
- **MCP Tools** — 6 built-in tools: web search, content analysis, bookmarks, summarizer, link extractor, navigation
- **BIELIK Agent System** — Researcher, Coder, and Planner agents for autonomous tasks
- **Cloudflare integration** — deployed on Pages + Workers with D1 database

---

## Quick Start (5 minutes)

### Option 1: Download Installer

The easiest way to get started:

1. Go to the [Download page](/download)
2. Choose your platform (Windows/macOS/Linux)
3. Run the installer
4. Launch ZENO Browser

### Option 2: Run from Source

```bash
# 1. Clone the repository
git clone https://github.com/Bonzokoles/zen-bro-wser.org.git
cd zen-bro-wser.org

# 2. Install dependencies
cd ZENO_WEB_CORE_APP
npm install

# 3. Start the development server
npm run dev
```

Then open [http://localhost:4378](http://localhost:4378) in your browser.

---

## First Steps

### 1. Configure AI Provider

When you first launch ZENO Browser, you'll need to configure an AI provider:

1. Click the ⚙️ **Settings** icon
2. Navigate to **AI Providers**
3. Add your API key for one or more providers:
   - **Gemini**: Get a key at [aistudio.google.com](https://aistudio.google.com)
   - **OpenRouter**: Get a key at [openrouter.ai](https://openrouter.ai)
   - **Claude**: Get a key at [console.anthropic.com](https://console.anthropic.com)

:::tip Local Models (No API Key Required)
You can use local models via **Ollama** for fully offline AI assistance.
See the [Ollama setup guide](/docs/user-guide/settings#ollama).
:::

### 2. Open Your First Tab

1. Click the **+** button in the tab bar
2. Type a URL or search query in the address bar
3. Press **Enter** to navigate

### 3. Use the AI Chat

1. Click the 💬 **Chat** button in the sidebar
2. The AI panel will open on the right
3. Type your question and press **Enter**
4. The AI can help you:
   - Summarize the current page
   - Search the web
   - Answer questions
   - Write code

---

## System Requirements

| Platform | Minimum |
|----------|---------|
| Windows  | Windows 10 (64-bit) |
| macOS    | macOS 11 Big Sur |
| Linux    | Ubuntu 20.04 or equivalent |
| RAM      | 4 GB |
| Storage  | 500 MB |

---

## Next Steps

- [Installation guides](/docs/installation/windows) — detailed per-platform instructions
- [User Guide](/docs/user-guide) — learn all features
- [Plugin Development](/docs/plugin-development) — extend ZENO Browser
- [API Reference](/docs/api-reference) — technical documentation

---

## Getting Help

- 🐛 **Bug reports**: [GitHub Issues](https://github.com/Bonzokoles/zen-bro-wser.org/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Bonzokoles/zen-bro-wser.org/discussions)
- 📖 **FAQ**: [Frequently Asked Questions](/docs/faq)
