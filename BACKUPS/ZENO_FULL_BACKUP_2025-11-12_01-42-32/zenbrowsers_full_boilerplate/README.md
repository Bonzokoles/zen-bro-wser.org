# 🚀 ZENO Browser - Deployment Configuration

**Lokalizacja:** `V:\PROTO_TYpy\ZENO_web_CORE\zenbrowsers_full_boilerplate\`  
**Data utworzenia:** 2025-11-04  
**Przeznaczenie:** Konfiguracja deployment dla Cloudflare Pages + Workers

---

## 📋 Zawartość

```
zenbrowsers_full_boilerplate/
├── backend/                    # Backend API (Node.js/Express)
│   ├── agents/                # AI agents
│   │   └── simpleAgent.ts
│   ├── api/                   # API endpoints
│   │   └── sites.ts
│   ├── services/              # Business logic
│   │   ├── classifierService.ts
│   │   └── storageService.ts
│   ├── orchestrator.ts        # Redis orchestrator
│   └── server.ts              # Express server
├── frontend/                   # Frontend (Astro/React)
│   └── src/
│       └── components/
│           ├── OrchestratorDashboard.tsx
│           └── SiteSearch.tsx
├── docker-compose.yml         # Docker setup (Postgres + Redis)
└── README.md                  # Ta dokumentacja
```

---

## 🎯 Opcje Deployment

### **Opcja 1: Cloudflare Pages (Statyczna)**
**Najlepsza dla:** Frontend Astro z API Routes

**Lokalizacja aplikacji:** `V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\`

**Kroki:**
1. Build aplikacji:
   ```bash
   cd V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP
   npm run build
   ```

2. Deploy na Cloudflare Pages:
   ```bash
   # Zainstaluj Wrangler CLI
   npm install -g wrangler
   
   # Login do Cloudflare
   wrangler login
   
   # Deploy
   wrangler pages deploy dist --project-name=zeno-browser
   ```

3. Konfiguracja:
   - Build command: `npm run build`
   - Build output: `dist`
   - Framework: Astro
   - Node.js version: 18+

---

### **Opcja 2: Cloudflare Workers (API Backend)**
**Najlepsza dla:** Backend API z PostgreSQL (D1) + Redis (KV/Durable Objects)

**Struktura:**
```
backend/
├── wrangler.toml              # Cloudflare Workers config
├── src/
│   ├── index.ts               # Worker entry point
│   ├── api/                   # API routes
│   └── services/              # Business logic
└── package.json
```

**Kroki:**
1. Utwórz `wrangler.toml`:
   ```toml
   name = "zeno-browser-api"
   main = "src/index.ts"
   compatibility_date = "2024-01-01"
   
   [env.production]
   routes = [
     { pattern = "api.zeno-browser.com/*", zone_name = "zeno-browser.com" }
   ]
   
   [[d1_databases]]
   binding = "DB"
   database_name = "zeno-browser-db"
   database_id = "your-database-id"
   
   [[kv_namespaces]]
   binding = "CACHE"
   id = "your-kv-id"
   ```

2. Deploy Worker:
   ```bash
   cd backend
   wrangler deploy
   ```

---

### **Opcja 3: Docker Compose (Full Stack)**
**Najlepsza dla:** Development lokalny lub self-hosting (VPS)

**Usługi:**
- **PostgreSQL 15** - Database (port 5432)
- **Redis 7** - Cache/Queue (port 6379)
- **Backend** - Express API (port 5000)
- **Frontend** - Astro dev server (port 3000)

**Kroki:**
```bash
cd V:\PROTO_TYpy\ZENO_web_CORE\zenbrowsers_full_boilerplate

# Start wszystkich usług
docker-compose up -d

# Sprawdź status
docker-compose ps

# Logi
docker-compose logs -f backend

# Stop
docker-compose down
```

**URLs:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## 🔧 Konfiguracja dla Cloudflare

### **1. Cloudflare Pages + Workers (Hybrid)**

**Frontend (Astro) → Cloudflare Pages**  
**Backend (API) → Cloudflare Workers**

#### **Frontend Setup:**

1. Utwórz `functions/_middleware.ts` w `ZENO_WEB_CORE_APP/`:
   ```typescript
   // Proxy API requests to Worker
   export async function onRequest(context) {
     const { request } = context;
     const url = new URL(request.url);
     
     if (url.pathname.startsWith('/api/')) {
       // Forward to Worker
       const workerUrl = `https://api.zeno-browser.workers.dev${url.pathname}`;
       return fetch(workerUrl, request);
     }
     
     return context.next();
   }
   ```

2. Deploy frontend:
   ```bash
   cd ZENO_WEB_CORE_APP
   npm run build
   wrangler pages deploy dist --project-name=zeno-browser
   ```

#### **Backend Worker:**

1. Utwórz `backend/src/index.ts`:
   ```typescript
   export default {
     async fetch(request: Request, env: Env): Promise<Response> {
       const url = new URL(request.url);
       
       // CORS headers
       const corsHeaders = {
         'Access-Control-Allow-Origin': '*',
         'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
         'Access-Control-Allow-Headers': 'Content-Type',
       };
       
       if (request.method === 'OPTIONS') {
         return new Response(null, { headers: corsHeaders });
       }
       
       // Routes
       if (url.pathname === '/api/admin/sites') {
         return handleSites(request, env);
       }
       
       if (url.pathname === '/api/iframe/sites') {
         return handleSearch(request, env);
       }
       
       return new Response('Not Found', { status: 404 });
     },
   };
   
   async function handleSites(request: Request, env: Env) {
     const { DB } = env;
     
     if (request.method === 'GET') {
       const sites = await DB.prepare('SELECT * FROM sites').all();
       return Response.json({ success: true, data: sites.results });
     }
     
     if (request.method === 'POST') {
       const body = await request.json();
       await DB.prepare('INSERT INTO sites (name, url, category) VALUES (?, ?, ?)')
         .bind(body.name, body.url, body.category)
         .run();
       return Response.json({ success: true }, { status: 201 });
     }
     
     return new Response('Method Not Allowed', { status: 405 });
   }
   
   async function handleSearch(request: Request, env: Env) {
     const { DB } = env;
     const url = new URL(request.url);
     const q = url.searchParams.get('q') || '';
     const category = url.searchParams.get('category');
     
     let query = 'SELECT * FROM sites WHERE 1=1';
     const params = [];
     
     if (q) {
       query += ' AND (name LIKE ? OR description LIKE ?)';
       params.push(`%${q}%`, `%${q}%`);
     }
     
     if (category) {
       query += ' AND category = ?';
       params.push(category);
     }
     
     const stmt = DB.prepare(query).bind(...params);
     const sites = await stmt.all();
     
     return Response.json({
       success: true,
       data: sites.results,
       total: sites.results.length,
     });
   }
   ```

2. Deploy Worker:
   ```bash
   cd backend
   wrangler deploy
   ```

---

### **2. Database Setup (Cloudflare D1)**

**D1 = SQL database dla Workers**

```bash
# Utwórz database
wrangler d1 create zeno-browser-db

# Output:
# database_id = "abc123..."

# Utwórz tabele
wrangler d1 execute zeno-browser-db --file=./schema.sql
```

**schema.sql:**
```sql
CREATE TABLE sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  description TEXT,
  sandbox TEXT,
  height INTEGER,
  iframe_allowed INTEGER DEFAULT 1,
  added_at TEXT DEFAULT CURRENT_TIMESTAMP,
  test_count INTEGER DEFAULT 0,
  tags TEXT
);

CREATE INDEX idx_category ON sites(category);
CREATE INDEX idx_iframe_allowed ON sites(iframe_allowed);

-- Przykładowe dane
INSERT INTO sites (name, url, category, description, iframe_allowed, test_count, tags)
VALUES
  ('Wikipedia', 'https://en.wikipedia.org', 'reference', 'Free encyclopedia', 1, 234, '["wiki","reference"]'),
  ('CodePen', 'https://codepen.io', 'development', 'Online code editor', 1, 567, '["code","editor"]'),
  ('YouTube Player', 'https://www.youtube.com/embed/', 'video', 'Video player API', 1, 892, '["video","api"]');
```

---

### **3. Environment Variables**

**Cloudflare Pages:**
```bash
# W dashboard Cloudflare Pages → Settings → Environment variables
VITE_API_URL=https://api.zeno-browser.workers.dev
VITE_GEMINI_API_KEY=your-gemini-key
```

**Cloudflare Workers:**
```bash
# W wrangler.toml [vars]
[vars]
ENVIRONMENT = "production"

# Secrets (encrypted)
wrangler secret put GEMINI_API_KEY
wrangler secret put OPENAI_API_KEY
```

---

## 📦 Deployment Scripts

### **build-deploy.ps1** (PowerShell)
```powershell
# V:\PROTO_TYpy\ZENO_web_CORE\scripts\build-deploy.ps1

param(
    [ValidateSet("pages", "workers", "all")]
    [string]$Target = "all"
)

Push-Location "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP"

if ($Target -eq "pages" -or $Target -eq "all") {
    Write-Host "`n🔨 Building frontend..." -ForegroundColor Cyan
    npm run build
    
    Write-Host "`n🚀 Deploying to Cloudflare Pages..." -ForegroundColor Green
    wrangler pages deploy dist --project-name=zeno-browser
}

if ($Target -eq "workers" -or $Target -eq "all") {
    Write-Host "`n🔨 Building backend..." -ForegroundColor Cyan
    Push-Location "../zenbrowsers_full_boilerplate/backend"
    npm run build
    
    Write-Host "`n🚀 Deploying Worker..." -ForegroundColor Green
    wrangler deploy
    
    Pop-Location
}

Pop-Location
Write-Host "`n✅ Deployment complete!" -ForegroundColor Green
```

**Użycie:**
```bash
# Deploy tylko frontend
.\scripts\build-deploy.ps1 -Target pages

# Deploy tylko backend
.\scripts\build-deploy.ps1 -Target workers

# Deploy wszystko
.\scripts\build-deploy.ps1 -Target all
```

---

## 🔍 Migracja z Docker do Cloudflare

### **PostgreSQL → D1**
```bash
# Export z Postgres
pg_dump -U zenbrowsers zenbrowsersdb > dump.sql

# Convert do SQLite format
# (D1 używa SQLite syntax)

# Import do D1
wrangler d1 execute zeno-browser-db --file=dump.sql
```

### **Redis → KV/Durable Objects**

**Redis KV operations → Cloudflare KV:**
```typescript
// Redis
await redis.set('key', 'value');
const val = await redis.get('key');

// Cloudflare KV
await env.CACHE.put('key', 'value');
const val = await env.CACHE.get('key');
```

**Redis Lists/Queues → Durable Objects:**
```typescript
// backend/src/queue.ts
export class Queue {
  state: DurableObjectState;
  
  async fetch(request: Request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/push') {
      const body = await request.json();
      await this.state.storage.put(`item-${Date.now()}`, body);
      return Response.json({ success: true });
    }
    
    if (url.pathname === '/pop') {
      const items = await this.state.storage.list({ limit: 1 });
      if (items.size === 0) return Response.json({ data: null });
      
      const [[key, value]] = items;
      await this.state.storage.delete(key);
      return Response.json({ data: value });
    }
  }
}
```

---

## 📊 Monitoring & Logs

**Cloudflare Dashboard:**
- Analytics: https://dash.cloudflare.com/analytics
- Logs: `wrangler tail` (real-time)
- Metrics: Workers Analytics

**Commands:**
```bash
# Real-time logs
wrangler tail --format=pretty

# Specific Worker
wrangler tail zeno-browser-api

# Pages logs
wrangler pages deployment tail
```

---

## 🛠️ Development Workflow

**Local development:**
```bash
# Frontend (Astro)
cd ZENO_WEB_CORE_APP
npm run dev # localhost:4378

# Backend (Worker local)
cd backend
wrangler dev # localhost:8787
```

**Testing przed deploy:**
```bash
# Build lokalny
npm run build

# Preview
wrangler pages dev dist

# Test Worker
wrangler dev --remote
```

---

## 📝 Checklist Deployment

### **Przed pierwszym deploy:**
- [ ] Zainstaluj Wrangler CLI: `npm install -g wrangler`
- [ ] Login Cloudflare: `wrangler login`
- [ ] Utwórz D1 database: `wrangler d1 create zeno-browser-db`
- [ ] Utwórz KV namespace: `wrangler kv:namespace create CACHE`
- [ ] Skonfiguruj domain w Cloudflare
- [ ] Ustaw environment variables
- [ ] Skopiuj API keys (Gemini, OpenAI, etc.)

### **Każdy deploy:**
- [ ] Build lokalny: `npm run build`
- [ ] Test lokalnie: `wrangler pages dev dist`
- [ ] Sprawdź API keys w Secrets
- [ ] Deploy: `wrangler pages deploy dist`
- [ ] Verify: otwórz URL i sprawdź funkcjonalność
- [ ] Sprawdź logi: `wrangler tail`

---

## 🔗 Przydatne Linki

- **Cloudflare Pages:** https://pages.cloudflare.com
- **Cloudflare Workers:** https://workers.cloudflare.com
- **Wrangler Docs:** https://developers.cloudflare.com/workers/wrangler
- **D1 Database:** https://developers.cloudflare.com/d1
- **KV Storage:** https://developers.cloudflare.com/kv
- **Astro Cloudflare Adapter:** https://docs.astro.build/en/guides/integrations-guide/cloudflare

---

## 📧 Support

**Issues:** https://github.com/Bonzokoles/zen-bro-wser.org/issues  
**Docs:** `V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\PROJECT_STRUCTURE.md`

---

**Ostatnia aktualizacja:** 2025-11-04  
**Status:** ✅ Gotowe do deployment
