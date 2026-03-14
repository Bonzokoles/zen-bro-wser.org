---
sidebar_position: 1
title: User Guide
description: Complete guide to using ZENO Browser features
---

# 📖 User Guide

Welcome to the ZENO Browser User Guide. This section covers all features and capabilities of ZENO Browser.

---

## Core Features

### Multi-Tab Browsing

ZENO Browser supports multiple tabs with a familiar interface:

- **Open new tab**: Click **+** or press `Ctrl+T` (Windows/Linux) / `Cmd+T` (macOS)
- **Close tab**: Click **×** on the tab or press `Ctrl+W`
- **Switch tabs**: Click a tab or use `Ctrl+1–9` for direct access
- **Reopen closed tab**: `Ctrl+Shift+T`

### Address Bar

The smart address bar handles both URLs and searches:

- Type a full URL (e.g., `https://example.com`) to navigate
- Type a search query to search with the configured search engine
- Supports common shortcuts: `g query` (Google), `ddg query` (DuckDuckGo)

---

## AI Features

### AI Chat Panel

The floating AI chat panel gives you instant access to AI assistance:

1. Click the 💬 chat icon or press `Ctrl+Space`
2. Select your AI provider from the dropdown
3. Type your message and press Enter

**Supported providers:**
| Provider | Models |
|----------|--------|
| Google Gemini | gemini-2.0-flash, gemini-1.5-pro |
| OpenRouter | GPT-4o, Claude 3.5, Mistral, Llama 3, and more |
| Anthropic | Claude 3.5 Sonnet, Claude 3 Haiku |
| Local (Ollama) | Any Ollama-compatible model |

### Page Context

The AI chat automatically has access to the current page content. You can ask:
- "Summarize this page"
- "What are the main points?"
- "Find all links on this page"
- "Translate this to Polish"

---

## MCP Tools

ZENO Browser includes 6 built-in [Model Context Protocol](https://modelcontextprotocol.io) tools:

| Tool | Description |
|------|-------------|
| 🔍 `web_search` | Search the web via Tavily |
| 📊 `content_analysis` | Analyze page content and extract data |
| 🔖 `bookmark_manager` | Save and manage bookmarks |
| 📄 `page_summarizer` | Summarize any webpage |
| 🔗 `link_extractor` | Extract and analyze page links |
| 🧭 `web_navigation` | Navigate to URLs programmatically |

To use a tool, type in the AI chat:
```
Use web_search to find the latest news about AI
```

---

## BIELIK Agents

The BIELIK agent system provides specialized AI agents:

### Available Agents

| Agent | Role | Capabilities |
|-------|------|-------------|
| 🔬 Researcher | Expert Researcher | Web search, content synthesis, data analysis |
| 💻 Coder | Expert Coder | Code generation, debugging, code review |
| 📋 Planner | Strategic Planner | Task decomposition, project planning |

### Using Agents

1. Open the **Agents Panel** (robot icon in sidebar)
2. Select an agent
3. Describe your task
4. The agent will autonomously use tools to complete it

---

## Settings

Access settings via the ⚙️ gear icon or `Ctrl+,`.

### AI Providers
Configure API keys and default models for each provider.

### Search Engine
Choose your default search engine (Google, DuckDuckGo, Bing, Brave).

### Appearance
- Light / Dark / System theme
- Font size
- Zoom level

### Privacy
- Clear browsing data
- Cookie settings
- Do Not Track

### Advanced
- Developer tools
- Network proxy settings
- Update settings

---

## Keyboard Shortcuts

| Action | Windows/Linux | macOS |
|--------|--------------|-------|
| New tab | `Ctrl+T` | `Cmd+T` |
| Close tab | `Ctrl+W` | `Cmd+W` |
| Open AI chat | `Ctrl+Space` | `Cmd+Space` |
| Address bar | `Ctrl+L` | `Cmd+L` |
| Find in page | `Ctrl+F` | `Cmd+F` |
| Settings | `Ctrl+,` | `Cmd+,` |
| Developer tools | `F12` | `Cmd+Opt+I` |
| Zoom in | `Ctrl++` | `Cmd++` |
| Zoom out | `Ctrl+-` | `Cmd+-` |
| Reset zoom | `Ctrl+0` | `Cmd+0` |
| Reload | `F5` or `Ctrl+R` | `Cmd+R` |
| Back | `Alt+←` | `Cmd+[` |
| Forward | `Alt+→` | `Cmd+]` |
