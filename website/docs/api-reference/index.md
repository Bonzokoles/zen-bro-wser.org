---
sidebar_position: 1
title: API Reference
description: ZENO Browser API documentation
---

# 📡 API Reference

ZENO Browser exposes several APIs for plugins, integrations, and automation.

---

## MCP Tools API

All MCP tools follow the [Model Context Protocol](https://modelcontextprotocol.io) specification.

### Tool Call Format

```json
{
  "tool": "tool_name",
  "parameters": {
    "param1": "value1",
    "param2": "value2"
  }
}
```

### Built-in Tools

#### `web_search`

Search the web using the Tavily API.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | Search query |
| `max_results` | number | ❌ | Max results (default: 5) |
| `search_depth` | string | ❌ | `basic` or `advanced` |

**Example:**
```json
{
  "tool": "web_search",
  "parameters": {
    "query": "latest AI news",
    "max_results": 10
  }
}
```

#### `content_analysis`

Analyze the content of the current page or a URL.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ❌ | URL to analyze (default: current page) |
| `type` | string | ❌ | `summary` \| `keywords` \| `links` \| `full` |

#### `bookmark_manager`

Manage bookmarks.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `action` | string | ✅ | `add` \| `remove` \| `list` \| `search` |
| `url` | string | ❌ | URL for add/remove |
| `title` | string | ❌ | Title for add |
| `query` | string | ❌ | Search query for list/search |

#### `page_summarizer`

Summarize a web page.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ❌ | URL to summarize (default: current page) |
| `length` | string | ❌ | `short` \| `medium` \| `long` |
| `language` | string | ❌ | Target language (e.g., `en`, `pl`) |

#### `link_extractor`

Extract links from a page.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ❌ | URL to extract from (default: current page) |
| `filter` | string | ❌ | Filter pattern (regex) |
| `type` | string | ❌ | `all` \| `internal` \| `external` \| `media` |

#### `web_navigation`

Navigate the browser programmatically.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | ✅ | URL to navigate to |
| `new_tab` | boolean | ❌ | Open in new tab |

---

## Agent API

### Execute an Agent Task

```typescript
// Via IPC (Electron)
const result = await window.zeno.agents.execute({
  agentId: 'researcher',  // 'researcher' | 'coder' | 'planner'
  task: 'Research the latest developments in quantum computing',
  context: {
    currentUrl: window.location.href,
    pageContent: document.body.innerText.substring(0, 5000),
  },
  options: {
    maxSteps: 10,
    timeout: 60000,
  }
});
```

### Agent Response Format

```typescript
interface AgentResult {
  success: boolean;
  output: string;
  steps: AgentStep[];
  toolsUsed: string[];
  duration: number;
  error?: string;
}

interface AgentStep {
  type: 'thought' | 'tool_call' | 'tool_result' | 'final';
  content: string;
  tool?: string;
  parameters?: Record<string, unknown>;
}
```

---

## Auto-Updater IPC

When running as an Electron app, the auto-updater is accessible via IPC:

```typescript
// Check for updates
await window.electronAPI.invoke('updater:check');

// Get current status
const status = await window.electronAPI.invoke('updater:status');

// Download available update
await window.electronAPI.invoke('updater:download');

// Install downloaded update (will restart app)
await window.electronAPI.invoke('updater:install');

// Get current version
const version = await window.electronAPI.invoke('updater:getVersion');

// Listen for status changes
window.electronAPI.on('updater:status', (status) => {
  console.log('Update status:', status);
});
```

### UpdateStatus Type

```typescript
interface UpdateStatus {
  state: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  currentVersion: string;
  progress?: {
    percent: number;
    transferred: number;
    total: number;
    bytesPerSecond: number;
  };
  error?: string;
}
```

---

## REST API (Cloudflare Workers)

When deployed on Cloudflare Workers, ZENO Browser exposes a REST API:

### Base URL
```
https://zeno-browser-api.your-subdomain.workers.dev
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/ai/chat` | Send AI chat message |
| `POST` | `/api/tools/execute` | Execute MCP tool |
| `GET` | `/api/bookmarks` | List bookmarks |
| `POST` | `/api/bookmarks` | Add bookmark |
| `DELETE` | `/api/bookmarks/:id` | Remove bookmark |
| `POST` | `/api/agents/execute` | Execute agent task |

### Authentication

Include your API key in the `Authorization` header:

```bash
curl https://zeno-browser-api.workers.dev/api/ai/chat \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "provider": "gemini"}'
```

---

## TypeScript Types

Full TypeScript type definitions are available in the `@zeno-browser/sdk` package (coming soon).

```bash
npm install @zeno-browser/sdk
```

```typescript
import type {
  ZenoPlugin,
  PluginContext,
  MCPTool,
  AgentConfig,
  UpdateStatus,
} from '@zeno-browser/sdk';
```
