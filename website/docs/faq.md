---
sidebar_position: 10
title: FAQ
description: Frequently Asked Questions about ZENO Browser
---

# ❓ Frequently Asked Questions

## General

### What is ZENO Browser?

ZENO Browser is an AI-powered web browser built with Astro 5 + React 18. It combines standard browsing capabilities with deep AI integration, supporting multiple AI providers (Gemini, GPT-4, Claude, local models) and an autonomous agent system.

### Is ZENO Browser free?

Yes, ZENO Browser is open-source and free. The source code is available on [GitHub](https://github.com/Bonzokoles/zen-bro-wser.org) under the MIT license.

### What AI providers are supported?

| Provider | Status | Notes |
|----------|--------|-------|
| Google Gemini | ✅ Supported | Requires API key |
| OpenRouter | ✅ Supported | 8+ models, one API key |
| Anthropic Claude | ✅ Supported | Requires API key |
| Ollama (local) | ✅ Supported | No API key, fully offline |

### Do I need API keys to use ZENO Browser?

For AI features, yes. However:
- You can browse the web without any API keys
- For free/cheap AI, use **Ollama** with local models
- Google Gemini has a generous free tier

### Is my browsing data private?

- Browsing history is stored locally on your device
- AI requests go directly to the AI provider you choose
- API keys are secured via Cloudflare Workers proxy (not stored in browser localStorage)
- No data is sent to ZENO servers

---

## Installation

### Why does Windows SmartScreen block the installer?

The installer is not yet signed with a paid Authenticode certificate. This is common for open-source projects. To install:

1. Click **More info** in the SmartScreen dialog
2. Click **Run anyway**

Or verify the file's SHA-256 checksum matches the one in the GitHub Release.

### Why does macOS say "ZENO Browser is damaged"?

Apple's Gatekeeper requires notarized apps. To bypass:

```bash
xattr -cr /Applications/ZENO\ Browser.app
```

Then right-click → Open.

### Can I use ZENO Browser alongside other browsers?

Yes! ZENO Browser installs independently and doesn't affect other browsers.

---

## AI Features

### How do I add my API key?

Go to **Settings** → **AI Providers** and add your key. Keys are encrypted and sent through a secure Cloudflare Workers proxy.

### Can I use ZENO Browser completely offline?

Yes! Install [Ollama](https://ollama.ai) and pull a model:

```bash
ollama pull llama3
```

Then in ZENO Browser Settings, configure Ollama as your AI provider. No internet needed for AI features.

### Why is the AI response slow?

- Check your internet connection
- Try a faster model (e.g., Gemini Flash instead of Gemini Pro)
- For local models, response speed depends on your hardware

---

## Technical

### What is MCP?

[Model Context Protocol (MCP)](https://modelcontextprotocol.io) is an open standard for connecting AI models to external tools and data sources. ZENO Browser implements 6 built-in MCP tools.

### What is the BIELIK agent system?

BIELIK is ZENO Browser's autonomous agent system with three specialized agents:
- **Researcher** — web research and data synthesis
- **Coder** — code generation and debugging
- **Planner** — task decomposition and project planning

### Can I build plugins for ZENO Browser?

Yes! See the [Plugin Development Guide](/docs/plugin-development).

### Does ZENO Browser support extensions?

Browser extensions (Chrome/Firefox extensions) are not currently supported, but a native plugin system is available. Support for Chromium extensions is planned.

---

## Getting Help

- 🐛 **Bug reports**: [GitHub Issues](https://github.com/Bonzokoles/zen-bro-wser.org/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/Bonzokoles/zen-bro-wser.org/discussions)
- 📖 **Troubleshooting**: [Troubleshooting Guide](/docs/troubleshooting)
