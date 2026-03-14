---
sidebar_position: 1
---

# Getting Started with ZENO Browser

**ZENO Browser** is an AI-powered web browser built with Astro 5 and React 19, featuring deep MCP (Model Context Protocol) integration.

## ✨ Features

- 🤖 **Multi-AI Integration** — Gemini, OpenAI/OpenRouter, Claude, Ollama
- 🔧 **MCP Tools** — 6 powerful tools (web_search, navigate, scrape, screenshot, bookmarks, summarize)
- 🔒 **Sandbox Security** — Secure iframe rendering with granular permissions
- 🎨 **Modern UI** — Dark theme with glass-morphism design
- ⚡ **Terminal** — Built-in terminal with MCP commands
- 🔌 **Browser Extension** — Chrome/Edge extension with AI features
- 📦 **Desktop App** — Electron-based for Windows, macOS, and Linux

## 🚀 Quick Start

### Option 1: Web App (Development)

```bash
git clone https://github.com/Bonzokoles/zen-bro-wser.org.git
cd zen-bro-wser.org/ZENO_WEB_CORE_APP
npm install
npm run dev
```

Open [http://localhost:4378](http://localhost:4378)

### Option 2: Desktop App

Download the installer from [GitHub Releases](https://github.com/Bonzokoles/zen-bro-wser.org/releases).

## 🔧 Configuration

Copy `.env.example` to `.env.local`:

```bash
cp ZENO_WEB_CORE_APP/.env.example ZENO_WEB_CORE_APP/.env.local
```

Add your API keys:

```env
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key
TAVILY_API_KEY=your_tavily_key
```

## 📚 Next Steps

- [MCP Tools Guide](./mcp-tools)
- [API Reference](./api)
- [Browser Extension Setup](./extension)
- [Sandbox WebView](./sandbox-webview)
