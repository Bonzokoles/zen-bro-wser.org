---
sidebar_position: 2
---

# MCP Tools Reference

ZENO Browser provides 6 MCP (Model Context Protocol) tools that AI models can use.

## Available Tools

### 1. `web_search`

Search the web using the Tavily API.

```json
{
  "name": "web_search",
  "arguments": {
    "query": "ZENO Browser features",
    "max_results": 5
  }
}
```

### 2. `navigate`

Navigate the browser to a URL.

```json
{
  "name": "navigate",
  "arguments": {
    "url": "https://example.com"
  }
}
```

### 3. `scrape_page`

Extract content from a web page.

```json
{
  "name": "scrape_page",
  "arguments": {
    "url": "https://example.com",
    "selector": "article"
  }
}
```

### 4. `take_screenshot`

Capture a screenshot of the current page.

```json
{
  "name": "take_screenshot",
  "arguments": {
    "fullPage": true
  }
}
```

### 5. `bookmark_manager`

Manage browser bookmarks.

```json
{
  "name": "bookmark_manager",
  "arguments": {
    "action": "add",
    "url": "https://example.com",
    "title": "Example",
    "tags": ["example", "test"]
  }
}
```

### 6. `page_summarizer`

Summarize web page content using AI.

```json
{
  "name": "page_summarizer",
  "arguments": {
    "url": "https://example.com",
    "language": "en"
  }
}
```

## Claude Desktop Configuration

Add to `~/.claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "zeno-browser": {
      "command": "node",
      "args": ["/path/to/zeno/mcp-server/dist/index.js"],
      "env": {
        "TAVILY_API_KEY": "your-key"
      }
    }
  }
}
```
