# Zen Browser - Gateway & WebSocket Infrastructure

## 📍 Lokalizacja Plików

Wszystkie gateway i websockets znajdują się w: **`U:\The_yellow_hub\zen-bro-wser.org\.cloudflare\gateways\`**

### Struktura Katalogów

```
U:\The_yellow_hub\zen-bro-wser.org\.cloudflare\gateways\
├── local/                           # 4 Local Gateway Workers
│   ├── api-gateway.ts              # REST API routing, CORS, rate limiting
│   ├── static-gateway.ts           # CDN dla plików statycznych z R2
│   ├── auth-gateway.ts             # Autentykacja JWT, OAuth2
│   └── metrics-gateway.ts          # Analytics, monitoring, logging
│
├── ai/                              # 3 AI Gateway Workers
│   ├── deepseek-gateway.ts         # DeepSeek R1 via OpenRouter
│   ├── mcp-gateway.ts              # Model Context Protocol integration
│   └── rag-gateway.ts              # Vector search, semantic search
│
└── ../websockets/                   # 3 WebSocket Workers
    ├── chat-ws.ts                   # Real-time chat (Durable Objects)
    ├── collab-ws.ts                 # Collaborative editing (OT)
    └── notifications-ws.ts          # Push notifications, alerts

📋 Pliki konfiguracyjne:
├── wrangler.gateways.toml          # Konfiguracja wszystkich workers
└── setup-infrastructure.ps1         # Skrypt setup (D1, KV, R2, Vectorize)
```

## 🚀 Szybki Start

### 1. Inicjalizacja Infrastruktury

```powershell
cd U:\The_yellow_hub\zen-bro-wser.org\.cloudflare\gateways
.\setup-infrastructure.ps1
```

To utworzy:
- ✅ D1 Database (`zen-browser-db`)
- ✅ KV Namespaces (CACHE, SESSIONS, METRICS)
- ✅ R2 Bucket (`zen-static-assets`)
- ✅ Vectorize Index (`zen-rag-index`, 768 dims, cosine)
- ✅ Schematy tabel SQL

### 2. Konfiguracja Secrets

```powershell
npx wrangler secret put OPENROUTER_API_KEY --config wrangler.gateways.toml --env deepseek-gateway
npx wrangler secret put DEEPSEEK_API_KEY --config wrangler.gateways.toml --env deepseek-gateway
npx wrangler secret put JWT_SECRET --config wrangler.gateways.toml --env auth-gateway
```

### 3. Deployment

**Deploy wszystkich workers:**
```powershell
# Local Gateways
npx wrangler deploy --config wrangler.gateways.toml --env api-gateway
npx wrangler deploy --config wrangler.gateways.toml --env static-gateway
npx wrangler deploy --config wrangler.gateways.toml --env auth-gateway
npx wrangler deploy --config wrangler.gateways.toml --env metrics-gateway

# AI Gateways
npx wrangler deploy --config wrangler.gateways.toml --env deepseek-gateway
npx wrangler deploy --config wrangler.gateways.toml --env mcp-gateway
npx wrangler deploy --config wrangler.gateways.toml --env rag-gateway

# WebSockets
npx wrangler deploy --config wrangler.gateways.toml --env chat-ws
npx wrangler deploy --config wrangler.gateways.toml --env collab-ws
npx wrangler deploy --config wrangler.gateways.toml --env notifications-ws
```

**Deploy pojedynczego workera:**
```powershell
npx wrangler deploy --config wrangler.gateways.toml --env api-gateway
```

## 🌐 Endpoints

### Local Gateways

| Endpoint | URL | Funkcja |
|----------|-----|---------|
| **API Gateway** | `api.zen-bro-wser.org` | REST API, routing, CORS, rate limiting |
| **Static Gateway** | `static.zen-bro-wser.org` | CDN dla JS/CSS/images z R2 |
| **Auth Gateway** | `auth.zen-bro-wser.org` | JWT auth, login, register, refresh tokens |
| **Metrics Gateway** | `metrics.zen-bro-wser.org` | Analytics Engine, real-time metrics |

### AI Gateways

| Endpoint | URL | Funkcja |
|----------|-----|---------|
| **DeepSeek AI** | `ai.zen-bro-wser.org` | Chat completion, reasoning, streaming |
| **MCP Gateway** | `mcp.zen-bro-wser.org` | MCP tools, resources, prompts |
| **RAG Gateway** | `rag.zen-bro-wser.org` | Vector search, document indexing, Q&A |

### WebSockets

| Endpoint | URL | Protokół | Funkcja |
|----------|-----|----------|---------|
| **Chat** | `chat.zen-bro-wser.org` | WSS | Real-time chat rooms (Durable Objects) |
| **Collaboration** | `collab.zen-bro-wser.org` | WSS | Collaborative editing (OT) |
| **Notifications** | `notifications.zen-bro-wser.org` | WSS | Push notifications, alerts |

## 📚 Dokumentacja API

### API Gateway - REST Endpoints

```typescript
GET  /api/v1/search?q=query          // Search documents
GET  /api/v1/content/:id             // Get document
POST /api/v1/content                 // Create document
GET  /api/v1/user                    // User endpoint
GET  /health                         // Health check
```

**Example:**
```bash
curl https://api.zen-bro-wser.org/api/v1/search?q=cloudflare
```

### Auth Gateway

```typescript
POST /auth/login                     // Login user
POST /auth/register                  // Register new user
GET  /auth/verify                    // Verify JWT token
POST /auth/refresh                   // Refresh access token
POST /auth/logout                    // Logout user
```

**Example:**
```bash
curl -X POST https://auth.zen-bro-wser.org/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### DeepSeek AI Gateway

```typescript
POST /ai/chat                        // Chat completion
POST /ai/reasoning                   // Deep reasoning with R1
POST /ai/embeddings                  // Text embeddings (TODO)
```

**Example:**
```bash
curl -X POST https://ai.zen-bro-wser.org/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Explain quantum computing"}
    ],
    "stream": false
  }'
```

### RAG Gateway

```typescript
POST /rag/search                     // Vector search
POST /rag/index                      // Index documents
POST /rag/query                      // RAG Q&A
GET  /rag/stats                      // Index statistics
```

**Example:**
```bash
# Index document
curl -X POST https://rag.zen-bro-wser.org/rag/index \
  -H "Content-Type: application/json" \
  -d '{
    "id": "doc-1",
    "content": "Cloudflare Workers are serverless...",
    "metadata": {"type": "tutorial"}
  }'

# RAG Query
curl -X POST https://rag.zen-bro-wser.org/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How do Cloudflare Workers work?"
  }'
```

### Metrics Gateway

```typescript
POST /metrics/track                  // Track event
GET  /metrics/query?metric=pageview  // Query metrics
GET  /metrics/dashboard              // Dashboard stats
GET  /metrics/export?format=csv      // Export metrics
```

### Chat WebSocket

```javascript
// Connect
const ws = new WebSocket('wss://chat.zen-bro-wser.org?room=general&user=user123&name=John');

// Receive messages
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  // msg.type: 'user_joined', 'message', 'user_left', 'user_list'
};

// Send message
ws.send(JSON.stringify({
  content: 'Hello world!'
}));
```

### Collaboration WebSocket

```javascript
// Connect to document
const ws = new WebSocket('wss://collab.zen-bro-wser.org?doc=doc-123&user=user456&name=Jane');

// Receive operations
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'operation') {
    // Apply operation to local document
    applyOperation(msg.operation);
  }
};

// Send operation
ws.send(JSON.stringify({
  type: 'operation',
  operation: {
    type: 'insert',
    position: 10,
    content: 'new text'
  }
}));

// Update cursor
ws.send(JSON.stringify({
  type: 'cursor',
  position: 25
}));
```

### Notifications WebSocket

```javascript
// Connect
const ws = new WebSocket('wss://notifications.zen-bro-wser.org?user=user789');

// Receive notifications
ws.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log(notification.title, notification.message);
};

// Send via HTTP API
fetch('https://notifications.zen-bro-wser.org/notifications/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user789',
    notification: {
      type: 'info',
      title: 'New Message',
      message: 'You have a new message',
      priority: 'medium'
    }
  })
});
```

## 🛠️ Development

### Local Testing

```powershell
# Test pojedynczego workera lokalnie
npx wrangler dev --config wrangler.gateways.toml --env api-gateway

# Test z local D1
npx wrangler dev --config wrangler.gateways.toml --env api-gateway --local

# Tail logs w produkcji
npx wrangler tail --config wrangler.gateways.toml --env api-gateway
```

### D1 Database Management

```powershell
# Execute SQL
npx wrangler d1 execute zen-browser-db --command "SELECT * FROM users LIMIT 10"

# Execute from file
npx wrangler d1 execute zen-browser-db --file=query.sql

# Backup
npx wrangler d1 export zen-browser-db --output=backup.sql
```

### KV Namespace Management

```powershell
# List keys
npx wrangler kv:key list --namespace-id=YOUR_KV_ID

# Get value
npx wrangler kv:key get "key-name" --namespace-id=YOUR_KV_ID

# Put value
npx wrangler kv:key put "key-name" "value" --namespace-id=YOUR_KV_ID
```

## 🏗️ Architektura

### Durable Objects (Persistence)

**Chat Rooms** (`ChatRoom` DO):
- Jeden DO = jeden chat room
- Utrzymuje aktywne WebSocket connections
- Broadcast messages do wszystkich uczestników
- Persystuje listę użytkowników w DO storage

**Collaboration** (`CollabDocument` DO):
- Jeden DO = jeden dokument
- Operational Transform dla conflict resolution
- Synchronizacja cursor positions
- Historia operacji (last 1000 ops)

**Notifications** (`NotificationManager` DO):
- Jeden DO = jeden użytkownik
- Queue dla offline notifications
- Heartbeat ping/pong (30s)
- Multiple concurrent connections support

### Caching Strategy

| Resource | Cache | TTL | Strategy |
|----------|-------|-----|----------|
| API responses | KV | 1h | Cache-aside |
| MCP tools list | KV | 5min | Cache-aside |
| Static files | Cloudflare CDN | 1 year | Immutable assets |
| AI chat results | KV | 1h | Hash-based dedup |
| User sessions | KV | 30 days | Refresh tokens |

### Rate Limiting

- **API Gateway**: 100 req/min per IP (KV-based)
- **AI Gateway**: Depends on OpenRouter limits
- **WebSockets**: No hard limit, monitored

## 🔐 Security Best Practices

### Implementowane:
✅ CORS headers na wszystkich endpoints  
✅ JWT authentication z refresh tokens  
✅ Rate limiting per IP  
✅ Security headers (X-Frame-Options, CSP, etc.)  
✅ ETag dla conditional requests  
✅ HTTPS only (wymuszane przez Cloudflare)  

### TODO:
⚠️ Password hashing: Zamienić placeholder na bcrypt/argon2  
⚠️ CSRF protection dla state-changing operations  
⚠️ Input validation schemas (Zod)  
⚠️ API key rotation mechanism  

## 📊 Monitoring

### Metrics Collected

```sql
-- Analytics Engine
- Pageviews (per day)
- Unique visitors (session-based)
- Top pages
- Average session duration
- API endpoint usage

-- D1 Tables
- All events archived for long-term analysis
- Query by type, user, date range
- Export to CSV
```

### Dashboard

```
GET https://metrics.zen-bro-wser.org/metrics/dashboard
```

Zwraca:
- Today's pageviews & unique visitors
- Last hour real-time stats
- Top pages list

## 🚨 Troubleshooting

### Worker nie deployuje się

```powershell
# Sprawdź nazwę workera
npx wrangler whoami

# Sprawdź limity konta
npx wrangler deployments list --config wrangler.gateways.toml --env api-gateway

# Force deploy
npx wrangler deploy --config wrangler.gateways.toml --env api-gateway --force
```

### D1 Database nie odpowiada

```powershell
# Sprawdź status
npx wrangler d1 info zen-browser-db

# Test connection
npx wrangler d1 execute zen-browser-db --command "SELECT 1"
```

### WebSocket disconnect issues

- Sprawdź czy Durable Object jest poprawnie zbindowany
- Verify heartbeat implementation (30s ping/pong)
- Check browser console for errors
- Tail logs: `npx wrangler tail --env chat-ws`

## 📖 Dalsze Zasoby

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Durable Objects Guide](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/)
- [WebSocket API](https://developers.cloudflare.com/workers/runtime-apis/websockets/)
- [D1 Database](https://developers.cloudflare.com/d1/)
- [Vectorize](https://developers.cloudflare.com/vectorize/)

## 📝 Changelog

**2026-02-01** - Initial infrastructure setup
- ✅ 4 Local Gateways (API, Static, Auth, Metrics)
- ✅ 3 AI Gateways (DeepSeek, MCP, RAG)
- ✅ 3 WebSockets (Chat, Collaboration, Notifications)
- ✅ D1, KV, R2, Vectorize configuration
- ✅ Setup automation script
