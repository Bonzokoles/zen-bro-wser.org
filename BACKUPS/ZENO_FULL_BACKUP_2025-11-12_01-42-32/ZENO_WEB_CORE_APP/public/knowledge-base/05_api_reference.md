# ZENO Browser API Reference

## Cloudflare Worker API
- URL: https://zeno-browser-api.stolarnia-ams.workers.dev

## Endpoints

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

### GET /api/iframe/sites
Lista stron testowych iframe

**Query params:**
- `q` - wyszukiwana fraza
- `category` - kategoria (development, tools, ai, etc.)
- `iframeAllowed` - true/false (tylko strony działające w iframe)
- `page` - numer strony (pagination)
- `limit` - ilość wyników na stronę (default: 20)

**Example:**
```
GET /api/iframe/sites?q=code&category=development&iframeAllowed=true&page=1&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10,
  "total": 23,
  "page": 1,
  "pages": 3
}
```

### POST /api/admin/sites
Dodaj nową stronę

**Body:**
```json
{
  "name": "Nazwa strony",
  "url": "https://example.com",
  "category": "development",
  "description": "Opis strony",
  "iframeAllowed": true,
  "sandbox": "allow-scripts allow-same-origin",
  "height": 500,
  "tags": ["tag1", "tag2"]
}
```

### PUT /api/admin/sites/:id
Aktualizuj stronę

**Body:** Partial site object (same as POST)

### DELETE /api/admin/sites/:id
Usuń stronę

**Response:**
```json
{
  "success": true,
  "message": "Site deleted successfully"
}
```

## MCP Tools (6 narzędzi)

ZENO Browser posiada 6 zintegrowanych narzędzi MCP:

### 1. web_search
Wyszukiwanie w internecie przez Tavily API

**Używane do:** Znajdowania informacji w sieci, research, fact-checking

### 2. content_analysis
Analiza zawartości stron web

**Używane do:** Analizy struktury HTML, wyciągania metadanych, sprawdzania SEO

### 3. bookmark_manager
Zarządzanie zakładkami

**Używane do:** Dodawania, usuwania, organizowania zakładek przeglądarki

### 4. page_summarizer
Podsumowanie stron

**Używane do:** Tworzenia skrótów długich artykułów, ekstraktowania kluczowych informacji

### 5. link_extractor
Wyciąganie linków

**Używane do:** Parsowania wszystkich linków ze strony, znajdowania resourceów

### 6. web_navigation
Nawigacja przeglądarki

**Używane do:** Kontroli przeglądarki, otwierania tabów, nawigacji

## Główne Komponenty

### Browser.tsx
Główny komponent przeglądarki
- Zarządzanie tabami
- Routing
- Stan aplikacji
- Integracja z WebView

### ChatPanel.tsx
Panel czatu z AI
- Integracja z Gemini, OpenAI, Claude
- Historia rozmów
- System promptów
- Multi-provider support

### WebView.tsx
Viewer dla iframe
- Sandbox security
- Load handling
- Error states
- Full-screen support

### WelcomePage.tsx
Strona startowa
- Quick links
- Kategorie stron
- Wyszukiwarka
- Popularne strony

### Toolbar.tsx
Pasek narzędzi
- Nawigacja (back/forward)
- URL bar
- Zakładki
- Ustawienia

## AI Providers

### Google Gemini
- Model: gemini-pro, gemini-2.0-flash-exp
- Features: Text, images, thinking mode

### OpenAI
- Models: GPT-3.5, GPT-4
- Features: Chat completion, embeddings

### Anthropic Claude
- Models: Claude 3.5 Sonnet, Claude 3 Opus
- Features: Long context, function calling

### OpenRouter
8+ modeli:
- Mistral 7B Instruct (Free)
- Meta Llama 3 8B Instruct (Free)
- Google Gemma 7B (Free)
- Nous Capybara 7B (Free)
- Toppy M 7B (Free)
- Cinematika 7B (Free)
- Mythomist 7B (Free)
- MythoMax L2 13B (Free)

## Deployment

### Platform
Cloudflare Pages

### URLs
- Production: https://zeno-browser.pages.dev
- Custom domain: https://zenbrowsers.org (pending DNS)

### Worker API
- URL: https://zeno-browser-api.stolarnia-ams.workers.dev

### Cloudflare Resources
- D1 Database: zeno-browser-db (23 sites)
- KV Namespace: CACHE (5min TTL)
- Account ID: 7f490d58a478c6baccb0ae01ea1d87c3

### GitHub Actions
Automatyczny deployment na push do main:
- Build Astro app
- Deploy Worker API
- Deploy to Cloudflare Pages

## Struktura Projektu

```
ZENO_WEB_CORE_APP/
├── src/
│   ├── components/
│   │   ├── Browser.tsx           # Główna przeglądarka
│   │   ├── WebView.tsx            # Iframe viewer
│   │   ├── WelcomePage.tsx        # Strona startowa
│   │   ├── ChatPanel.tsx          # AI chat
│   │   ├── Toolbar.tsx            # Pasek narzędzi
│   │   └── Background3D.tsx       # Animowane tło
│   ├── pages/
│   │   ├── index.astro            # Główna strona
│   │   └── search-demo.astro      # Demo wyszukiwarki
│   ├── services/
│   │   ├── mcpService.ts          # MCP tools
│   │   └── aiProviders/           # AI integrations
│   │       ├── gemini.ts
│   │       ├── openai.ts
│   │       ├── anthropic.ts
│   │       └── openrouter.ts
│   └── styles/
│       └── global.css             # Główne style
├── public/
│   ├── knowledge-base/            # Dokumentacja dla RAG
│   ├── favicon.ico
│   └── apple-touch-icon.png
└── astro.config.mjs               # Konfiguracja Astro
```

## Technologie

- **Frontend:** Astro 5.14.8 + React 19.2
- **Styling:** Tailwind CSS
- **AI:** Google Gemini, OpenAI, Anthropic, OpenRouter
- **Search:** Tavily API
- **Deployment:** Cloudflare Pages + Workers
- **Database:** Cloudflare D1 (SQLite)
- **Cache:** Cloudflare KV
- **CI/CD:** GitHub Actions

## Environment Variables

```env
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=7f490d58a478c6baccb0ae01ea1d87c3
CLOUDFLARE_API_TOKEN=your-token-here

# AI Providers (server-side only)
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
TAVILY_API_KEY=tvly-...

# Build
NODE_VERSION=18
VITE_ENVIRONMENT=production
VITE_API_URL=https://zeno-browser-api.stolarnia-ams.workers.dev
```

## Useful Commands

```bash
# Development
npm run dev                 # Start dev server (port 4378)
npm run build              # Build for production
npm run preview            # Preview production build

# Deployment
git push origin main       # Auto-deploy via GitHub Actions

# Cloudflare Worker
cd .cloudflare
wrangler deploy           # Deploy Worker API
wrangler tail             # View Worker logs
wrangler d1 execute zeno-browser-db --command="SELECT * FROM sites"

# Database
wrangler d1 create zeno-browser-db
wrangler d1 execute zeno-browser-db --file=schema.sql

# KV Cache
wrangler kv:namespace create CACHE
wrangler kv:key list --binding=CACHE
```

## Common Tasks

### Dodanie nowej strony iframe
1. Otwórz Admin panel (jeśli dostępny)
2. LUB wywołaj POST /api/admin/sites
3. Podaj: name, url, category, description, iframeAllowed=true

### Deployment zmian
1. `git add .`
2. `git commit -m "opis zmian"`
3. `git push origin main`
4. GitHub Actions automatycznie deployuje

### Debug Worker API
1. `wrangler tail` w terminalu
2. Wysyłaj requesty do API
3. Zobacz logi w czasie rzeczywistym

### Testowanie lokalnie
1. `npm run dev` w ZENO_WEB_CORE_APP
2. Otwórz http://localhost:4378
3. Testuj funkcje

## Troubleshooting

### Problem: Strona nie ładuje się w iframe
**Rozwiązanie:** Sprawdź czy strona ma X-Frame-Options: DENY. Jeśli tak, ustaw iframeAllowed=false.

### Problem: AI nie odpowiada
**Rozwiązanie:** Sprawdź environment variables w Cloudflare Dashboard.

### Problem: Worker API error 500
**Rozwiązanie:** `wrangler tail` aby zobaczyć szczegóły błędu.

### Problem: Build fails
**Rozwiązanie:** `npm run build` lokalnie, sprawdź błędy TypeScript.

## Security

- API keys są server-side only (nigdy nie wysyłane do klienta)
- Cloudflare Worker jako secure proxy
- CORS headers skonfigurowane
- Sandbox dla iframe (allow-scripts allow-same-origin)
- Rate limiting przez Cloudflare

## Performance

- Cloudflare CDN (300+ lokacji globalnie)
- Edge caching (KV store, 5min TTL)
- HTTP/2 i HTTP/3 enabled
- ~50ms response times globally
- Automatyczna kompresja (Brotli/Gzip)

## License & Credits

ZENO Browser - Open source project
Built with Astro, React, Cloudflare
