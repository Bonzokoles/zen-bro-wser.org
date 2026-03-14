---
sidebar_position: 3
---

# API Reference

## REST API Endpoints

ZENO Browser exposes REST API endpoints for integration.

### Health Check

```http
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "version": "0.2.0",
  "services": {
    "mcp": "running",
    "ai": "active",
    "search": "ready"
  }
}
```

### MCP Tool Execution

```http
POST /api/mcp
Content-Type: application/json

{
  "tool": "web_search",
  "args": {
    "query": "example search"
  }
}
```

### Proxy (CORS Bypass)

```http
GET /api/proxy?url=https://example.com
```

### AI Chat

```http
POST /api/chat
Content-Type: application/json

{
  "provider": "gemini",
  "messages": [
    { "role": "user", "content": "Hello!" }
  ],
  "model": "gemini-pro"
}
```

## WebSocket Events

Connect to `ws://localhost:4378/ws` for real-time events:

```javascript
const ws = new WebSocket('ws://localhost:4378/ws');
ws.onmessage = (event) => {
  const { type, payload } = JSON.parse(event.data);
  // handle event
};
```

Events: `navigate`, `load`, `error`, `ai_message`, `mcp_result`
