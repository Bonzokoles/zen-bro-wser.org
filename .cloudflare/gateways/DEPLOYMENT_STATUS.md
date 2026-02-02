# Zen Browser Gateways - Deployment Status

## ✅ All 10 Workers Deployed Successfully

### Local Gateways (4)

1. **API Gateway** - REST API z routing, CORS, rate limiting
   - URL: https://zen-api-gateway.stolarnia-ams.workers.dev
   - Bindings: KV (CACHE), D1 (zen-browser-db)
   - Endpoints: `/api/v1/search`, `/api/v1/content`, `/api/v1/users`

2. **Static Gateway** - CDN dla statycznych zasobów
   - URL: https://zen-static-gateway.stolarnia-ams.workers.dev
   - Bindings: R2 (zen-static-assets)
   - Features: Compression, ETag, Cache-Control

3. **Auth Gateway** - JWT authentication
   - URL: https://zen-auth-gateway.stolarnia-ams.workers.dev
   - Bindings: KV (refresh tokens), D1 (users)
   - Endpoints: `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/verify`

4. **Metrics Gateway** - Analytics collection
   - URL: https://zen-metrics-gateway.stolarnia-ams.workers.dev
   - Bindings: Analytics Engine (METRICS), KV, D1
   - Endpoints: `/metrics/track`, `/metrics/dashboard`, `/metrics/export`

### AI Gateways (3)

5. **DeepSeek Gateway** - DeepSeek R1 via OpenRouter
   - URL: https://zen-deepseek-gateway.stolarnia-ams.workers.dev
   - Bindings: KV (cache), OpenRouter API
   - Endpoints: `/ai/chat`, `/ai/reason`, `/ai/stream`

6. **MCP Gateway** - Model Context Protocol integration
   - URL: https://zen-mcp-gateway.stolarnia-ams.workers.dev
   - Bindings: KV, D1 (mcp_executions)
   - Endpoints: `/mcp/tools`, `/mcp/execute`, `/mcp/resources`

7. **RAG Gateway** - Vector search + AI answers
   - URL: https://zen-rag-gateway.stolarnia-ams.workers.dev
   - Bindings: Vectorize (zen-rag-index), D1, OpenRouter
   - Endpoints: `/rag/search`, `/rag/index`, `/rag/query`

### WebSockets (3)

8. **Chat WebSocket** - Real-time chat z AI i użytkownikami
   - URL: wss://zen-chat-ws.stolarnia-ams.workers.dev
   - Bindings: Durable Objects (ChatRoom), KV, D1
   - Features: Message routing, presence, persistence

9. **Collaboration WebSocket** - Collaborative editing
   - URL: wss://zen-collab-ws.stolarnia-ams.workers.dev
   - Bindings: Durable Objects (CollabDocument), KV, D1
   - Features: Operational Transform, cursor sync, history

10. **Notifications WebSocket** - Push notifications
    - URL: wss://zen-notifications-ws.stolarnia-ams.workers.dev
    - Bindings: Durable Objects (NotificationManager), KV, D1
    - Features: Offline queue, heartbeat, delivery receipts

## Infrastructure Resources

### Cloudflare D1 Database
- **Name**: zen-browser-db
- **ID**: c1fd4ebf-9619-47f8-b8c3-21b084278909
- **Tables**: 7 (users, documents, chat_messages, collab_documents, notifications, mcp_executions, metrics)
- **Status**: ✅ Schema initialized

### Cloudflare KV Namespace
- **Name**: CACHE
- **ID**: cce469bb54d142ebbbce4287e450daec
- **Usage**: Rate limiting, response caching, session storage

### Cloudflare R2 Bucket
- **Name**: zen-static-assets
- **Usage**: Static files, images, fonts, CSS, JS

### Cloudflare Vectorize Index
- **Name**: zen-rag-index
- **Dimensions**: 768
- **Metric**: cosine
- **Status**: ⏳ Ready for indexing

### Cloudflare Durable Objects
- **ChatRoom** (chat-ws) - Migration tag: v1
- **CollabDocument** (collab-ws) - Migration tag: v1
- **NotificationManager** (notifications-ws) - Migration tag: v1

## Environment Variables

Set via `.env` and `wrangler.gateways.toml`:

```env
OPENROUTER_API_KEY=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
JWT_SECRET=super-secret-jwt-key-change-this-in-production
MCP_API_BASE=http://localhost:8001
DEEPSEEK_API_KEY=(optional, same as OPENROUTER)
```

## Testing Endpoints

### Quick Health Checks

```bash
# API Gateway
curl https://zen-api-gateway.stolarnia-ams.workers.dev/api/v1/search

# Auth Gateway
curl -X POST https://zen-auth-gateway.stolarnia-ams.workers.dev/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test", "password": "test123"}'

# DeepSeek AI
curl -X POST https://zen-deepseek-gateway.stolarnia-ams.workers.dev/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello!"}]}'

# Metrics
curl -X POST https://zen-metrics-gateway.stolarnia-ams.workers.dev/metrics/track \
  -H "Content-Type: application/json" \
  -d '{"type": "page_view", "path": "/", "duration": 123}'
```

### WebSocket Test (JavaScript)

```javascript
// Chat WebSocket
const ws = new WebSocket('wss://zen-chat-ws.stolarnia-ams.workers.dev?room=general&user=test');
ws.onmessage = (event) => console.log('Received:', event.data);
ws.onopen = () => ws.send(JSON.stringify({
  type: 'message',
  text: 'Hello from WebSocket!'
}));

// Notifications WebSocket
const notifWs = new WebSocket('wss://zen-notifications-ws.stolarnia-ams.workers.dev?user=user123');
notifWs.onmessage = (event) => {
  const notification = JSON.parse(event.data);
  console.log('Notification:', notification);
};
```

## Production Setup (TODO)

### Custom Domain Configuration

Currently all workers use `stolarnia-ams.workers.dev` subdomain. For production with custom domain `zen-bro-wser.org`:

1. **Add DNS Zone** in Cloudflare dashboard:
   - Add `zen-bro-wser.org` as a zone
   - Configure nameservers

2. **Uncomment routes** in `wrangler.gateways.toml`:
   ```toml
   [[env.api-gateway.routes]]
   pattern = "api.zen-bro-wser.org/*"
   zone_name = "zen-bro-wser.org"
   ```

3. **Re-deploy** with custom routes:
   ```bash
   npx wrangler deploy --config wrangler.gateways.toml --env api-gateway
   ```

### Security Checklist

- [ ] Rotate JWT_SECRET to cryptographically secure value
- [ ] Move OPENROUTER_API_KEY to Cloudflare Secrets (not vars)
- [ ] Enable rate limiting on all endpoints
- [ ] Configure CSP headers
- [ ] Set up monitoring and alerts
- [ ] Review D1 database access patterns
- [ ] Enable CORS only for trusted origins

## Deployment Date

- **Initial Deployment**: 2026-02-02
- **Workers Version**: wrangler 4.61.1
- **Cloudflare Account**: 7f490d58a478c6baccb0ae01ea1d87c3

## Next Steps

1. ✅ All 10 workers deployed
2. ⏳ Test all endpoints
3. ⏳ Index first documents in Vectorize
4. ⏳ Configure production domain
5. ⏳ Set up monitoring dashboard
6. ⏳ Integrate with Zen Browser frontend
7. ⏳ Load testing and optimization

---

**Documentation**: See [README.md](README.md) for full API reference and examples.
