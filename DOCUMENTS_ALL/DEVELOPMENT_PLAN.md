# ZENO Development Plan

## Current State

**Status:** ~60% complete, functional prototype
**Code:** ~3,500 lines TypeScript/React/Astro
**Stack:** Astro 5.14.8 + React 18.3.1 + TypeScript + Tailwind CSS
**AI Integration:** Gemini, OpenRouter (8 models), Tavily search

## Critical Issues (Fix First)

### 1. API Key Security
**Problem:** Keys stored in localStorage → XSS vulnerability
**Time:** 1 week

**Implementation:**
```
/api
├── proxy.ts                 - Main API router
├── providers/
│   ├── gemini-proxy.ts     - Gemini API proxy
│   ├── openrouter-proxy.ts - OpenRouter proxy
│   └── tavily-proxy.ts     - Tavily proxy
└── middleware/
    ├── auth.ts             - API key validation
    └── rate-limit.ts       - Request throttling
```

**Steps:**
1. Create Express server in `/api`
2. Move API calls from client to server
3. Store keys in `.env` file
4. Add rate limiting (100 req/hour per IP)
5. Update client to call `/api/*` endpoints

---

### 2. Complete MCP Tools
**Problem:** 5/6 tools defined but not implemented
**Time:** 2-3 weeks

**Tools to implement:**

#### a) `content_analysis`
```typescript
// src/services/tools/content-analysis.ts
async function analyzeContent(url: string, provider: AIProvider) {
  const content = await fetchPageContent(url);
  const analysis = await provider.analyze({
    prompt: "Analyze this webpage",
    content: content
  });
  return {
    summary: analysis.summary,
    topics: analysis.topics,
    sentiment: analysis.sentiment,
    keyPoints: analysis.keyPoints
  };
}
```

#### b) `bookmark_manager`
```typescript
// src/services/tools/bookmark-manager.ts
interface Bookmark {
  id: string;
  title: string;
  url: string;
  category: string;
  tags: string[];
  created: Date;
}

async function addBookmark(data: Omit<Bookmark, 'id' | 'created'>) {
  // Save to IndexedDB or localStorage
}

async function searchBookmarks(query: string) {
  // Full-text search through bookmarks
}
```

#### c) `page_summarizer`
```typescript
// src/services/tools/page-summarizer.ts
async function summarizePage(url: string, length: 'short' | 'medium' | 'long') {
  const content = await fetchPageContent(url);
  const summary = await aiProvider.summarize(content, {
    maxLength: length === 'short' ? 100 : length === 'medium' ? 300 : 500
  });
  return summary;
}
```

#### d) `link_extractor`
```typescript
// src/services/tools/link-extractor.ts
async function extractLinks(url: string, filters?: {
  internal?: boolean;
  external?: boolean;
  type?: 'all' | 'navigation' | 'resources';
}) {
  const html = await fetch(url).then(r => r.text());
  const dom = new DOMParser().parseFromString(html, 'text/html');
  const links = Array.from(dom.querySelectorAll('a'))
    .map(a => ({
      url: a.href,
      text: a.textContent,
      type: categorizeLink(a)
    }));
  return applyFilters(links, filters);
}
```

#### e) `web_navigation` (enhance existing)
```typescript
// Add to existing navigation:
- Back/forward navigation
- Tab duplication
- Tab pinning
- Tab grouping
- Session save/restore
```

---

### 3. Claude Provider
**Problem:** Planned but not implemented
**Time:** 3-5 days

```typescript
// src/services/aiProviders/claude.ts
import Anthropic from '@anthropic-ai/sdk';

export class ClaudeProvider implements AIProvider {
  private client: Anthropic;

  async chat(messages: Message[]): Promise<Response> {
    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });
    return response.content[0].text;
  }

  async analyzeWebPage(url: string, content: string): Promise<Analysis> {
    // Similar to Gemini implementation
  }
}
```

**Add to package.json:**
```json
"@anthropic-ai/sdk": "^0.32.0"
```

---

## Phase 1: Core Stability (4-6 weeks)

### Testing Suite
**Time:** 2-3 weeks

```
/tests
├── unit/
│   ├── services/
│   │   ├── mcpService.test.ts
│   │   ├── toolExecutionService.test.ts
│   │   └── aiProviders/
│   │       ├── gemini.test.ts
│   │       ├── openrouter.test.ts
│   │       └── claude.test.ts
│   └── utils/
├── integration/
│   ├── browser-flow.test.ts
│   ├── chat-flow.test.ts
│   └── bookmark-flow.test.ts
└── e2e/
    ├── basic-navigation.spec.ts
    ├── ai-chat.spec.ts
    └── multi-tab.spec.ts
```

**Setup:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright
```

**vitest.config.ts:**
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 75
      }
    }
  }
});
```

---

### State Management
**Time:** 1-2 weeks
**Why:** Component state doesn't scale, need centralized store

```bash
npm install zustand immer
```

**Store structure:**
```typescript
// src/store/index.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface BrowserStore {
  // Tabs
  tabs: Tab[];
  activeTabId: string;
  addTab: (tab: Tab) => void;
  closeTab: (id: string) => void;

  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;

  // History
  history: HistoryEntry[];
  addToHistory: (entry: HistoryEntry) => void;

  // Chat
  chatMessages: Message[];
  addMessage: (message: Message) => void;
  clearChat: () => void;
}

export const useBrowserStore = create<BrowserStore>()(
  persist(
    immer((set) => ({
      tabs: [],
      activeTabId: '',
      addTab: (tab) => set((state) => {
        state.tabs.push(tab);
      }),
      // ... rest of actions
    })),
    {
      name: 'zeno-browser-storage',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        history: state.history
      })
    }
  )
);
```

---

### Web Content Rendering
**Time:** 2-3 weeks
**Problem:** WebView might be placeholder

**Option 1: iframe (simple, sandboxed)**
```typescript
// src/components/WebView.tsx
function WebView({ url }: { url: string }) {
  return (
    <iframe
      src={url}
      sandbox="allow-scripts allow-same-origin"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
```

**Option 2: Proxy + iframe (better for CORS)**
```typescript
// /api/proxy-page.ts
app.get('/proxy', async (req, res) => {
  const { url } = req.query;
  const response = await fetch(url);
  const html = await response.text();

  // Inject CSP headers, sanitize
  res.setHeader('Content-Security-Policy', "...");
  res.send(html);
});

// Client
<iframe src={`/api/proxy?url=${encodeURIComponent(url)}`} />
```

**Option 3: Electron (best, full control)**
- See Phase 2 below

---

## Phase 2: Enhanced Features (6-10 weeks)

### Desktop App (Electron)
**Time:** 3-4 weeks
**Why:** Full web rendering, native features, no CORS issues

**Setup:**
```bash
npm install -D electron electron-builder
```

**Structure:**
```
/electron
├── main.ts              - Main process
├── preload.ts           - Bridge API
└── services/
    ├── browser.ts       - BrowserView management
    └── ipc-handlers.ts  - IPC communication
```

**main.ts:**
```typescript
import { app, BrowserWindow, BrowserView } from 'electron';

let mainWindow: BrowserWindow;
let browserView: BrowserView;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Load Astro app
  mainWindow.loadURL('http://localhost:4321');

  // Create browser view for web content
  browserView = new BrowserView();
  mainWindow.setBrowserView(browserView);
  browserView.setBounds({ x: 0, y: 100, width: 1200, height: 700 });
}

// IPC handlers for tab management
ipcMain.handle('navigate', (event, url) => {
  browserView.webContents.loadURL(url);
});
```

**package.json scripts:**
```json
{
  "scripts": {
    "electron:dev": "concurrently \"npm run dev\" \"electron .\"",
    "electron:build": "electron-builder"
  },
  "build": {
    "appId": "com.zeno.browser",
    "files": ["dist/**/*", "electron/**/*"]
  }
}
```

---

### Advanced Bookmarks
**Time:** 2-3 weeks

**Features:**
1. **Full-text search**
```typescript
// Use Fuse.js for fuzzy search
import Fuse from 'fuse.js';

const fuse = new Fuse(bookmarks, {
  keys: ['title', 'url', 'tags', 'notes'],
  threshold: 0.3
});

const results = fuse.search(query);
```

2. **Import/Export**
```typescript
// Import from Chrome/Firefox
async function importBookmarks(file: File) {
  const json = await file.text();
  const parsed = parseBookmarkJSON(json); // Chrome format
  return parsed.map(convertToZenoFormat);
}

// Export
function exportBookmarks(format: 'json' | 'html') {
  if (format === 'html') {
    return generateNetscapeHTML(bookmarks);
  }
  return JSON.stringify(bookmarks);
}
```

3. **AI Auto-tagging**
```typescript
async function autoTagBookmark(bookmark: Bookmark) {
  const content = await fetchPageContent(bookmark.url);
  const tags = await aiProvider.extractTags(content);
  return { ...bookmark, tags };
}
```

4. **Cloud Sync** (optional)
```typescript
// Using Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

async function syncBookmarks() {
  const local = await getLocalBookmarks();
  const remote = await supabase.from('bookmarks').select('*');

  const merged = mergeBookmarks(local, remote);
  await saveToCloud(merged);
  await saveToLocal(merged);
}
```

---

### Extension System
**Time:** 3-4 weeks
**Why:** Extensibility, community plugins

**Architecture:**
```
/extensions
├── api/
│   ├── extension-api.ts      - Public API
│   ├── manifest-schema.ts    - Extension manifest
│   └── sandbox.ts            - Isolated execution
├── built-in/
│   ├── translator/
│   │   ├── manifest.json
│   │   ├── index.ts
│   │   └── ui.tsx
│   ├── reader-mode/
│   └── screenshot/
└── loader/
    └── extension-loader.ts   - Dynamic loading
```

**Extension manifest:**
```json
{
  "name": "Page Translator",
  "version": "1.0.0",
  "permissions": ["page_content", "ai_access"],
  "tools": [
    {
      "id": "translate_page",
      "name": "Translate Page",
      "handler": "./translate.js"
    }
  ],
  "ui": {
    "toolbar_button": true,
    "context_menu": true
  }
}
```

**Extension API:**
```typescript
// extensions/api/extension-api.ts
export interface ExtensionAPI {
  // Page access
  getCurrentPageContent(): Promise<string>;
  getCurrentPageUrl(): string;

  // AI access
  callAI(prompt: string): Promise<string>;

  // UI
  showNotification(message: string): void;
  addToolbarButton(config: ButtonConfig): void;

  // Storage
  storage: {
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
  };
}
```

**Example extension:**
```typescript
// extensions/built-in/translator/index.ts
export default class TranslatorExtension {
  async onActivate(api: ExtensionAPI) {
    api.addToolbarButton({
      icon: 'translate',
      label: 'Translate',
      onClick: async () => {
        const content = await api.getCurrentPageContent();
        const translated = await api.callAI(
          `Translate to English: ${content}`
        );
        api.showNotification('Translated!');
      }
    });
  }
}
```

---

## Phase 3: Advanced AI (6-8 weeks)

### Multi-Agent System
**Time:** 4-6 weeks

**Agent types:**
```typescript
// src/agents/base-agent.ts
abstract class BaseAgent {
  abstract name: string;
  abstract capabilities: string[];

  abstract execute(task: Task): Promise<Result>;
}

// src/agents/research-agent.ts
class ResearchAgent extends BaseAgent {
  name = 'Research';
  capabilities = ['web_search', 'content_analysis', 'summarization'];

  async execute(task: Task) {
    // 1. Search web
    const searchResults = await this.tools.webSearch(task.query);

    // 2. Analyze top results
    const analyses = await Promise.all(
      searchResults.slice(0, 5).map(r =>
        this.tools.analyzeContent(r.url)
      )
    );

    // 3. Synthesize findings
    const synthesis = await this.ai.synthesize(analyses);

    return { summary: synthesis, sources: searchResults };
  }
}

// src/agents/coding-agent.ts
class CodingAgent extends BaseAgent {
  capabilities = ['code_analysis', 'debugging', 'generation'];

  async execute(task: Task) {
    if (task.type === 'debug') {
      return await this.debugCode(task.code);
    } else if (task.type === 'generate') {
      return await this.generateCode(task.spec);
    }
  }
}

// src/agents/orchestrator.ts
class AgentOrchestrator {
  agents: Map<string, BaseAgent>;

  async handleTask(task: Task) {
    // Determine which agent(s) needed
    const agents = this.selectAgents(task);

    if (agents.length === 1) {
      return await agents[0].execute(task);
    } else {
      // Coordinate multiple agents
      return await this.coordinateAgents(agents, task);
    }
  }

  private selectAgents(task: Task): BaseAgent[] {
    // AI-powered agent selection
    const prompt = `Which agents needed for: ${task.description}`;
    const selection = await this.ai.selectAgents(prompt, this.agents);
    return selection;
  }
}
```

**Usage in chat:**
```typescript
// User: "Research best practices for React state management"
// System selects ResearchAgent
// Agent searches → analyzes → summarizes → returns to user
```

---

### Knowledge Base
**Time:** 6-8 weeks

**Architecture:**
```
/knowledge-base
├── indexer/
│   ├── content-indexer.ts    - Index web pages
│   ├── embedding-service.ts  - Generate embeddings
│   └── chunker.ts            - Split content into chunks
├── storage/
│   ├── vector-db.ts          - Vector storage (Pinecone/local)
│   └── metadata-db.ts        - Metadata (SQLite/Supabase)
├── retrieval/
│   ├── semantic-search.ts    - Vector similarity search
│   └── keyword-search.ts     - Traditional search
└── ui/
    ├── KnowledgeGraph.tsx    - Visual graph view
    └── SearchInterface.tsx   - Search UI
```

**Implementation:**

1. **Content Indexing**
```typescript
// knowledge-base/indexer/content-indexer.ts
async function indexPage(url: string) {
  // Fetch and parse
  const content = await fetchPageContent(url);
  const chunks = chunkContent(content, { maxTokens: 512 });

  // Generate embeddings
  const embeddings = await Promise.all(
    chunks.map(c => embeddingService.embed(c.text))
  );

  // Store in vector DB
  await vectorDB.upsert(
    chunks.map((chunk, i) => ({
      id: `${url}#${i}`,
      vector: embeddings[i],
      metadata: {
        url,
        title: content.title,
        chunkIndex: i,
        text: chunk.text
      }
    }))
  );
}
```

2. **Semantic Search**
```typescript
// knowledge-base/retrieval/semantic-search.ts
async function search(query: string, limit = 10) {
  // Embed query
  const queryEmbedding = await embeddingService.embed(query);

  // Vector search
  const results = await vectorDB.query({
    vector: queryEmbedding,
    topK: limit,
    includeMetadata: true
  });

  // Re-rank with AI
  const reranked = await aiProvider.rerank(query, results);

  return reranked;
}
```

3. **Knowledge Graph**
```typescript
// knowledge-base/ui/KnowledgeGraph.tsx
import { ForceGraph2D } from 'react-force-graph';

function KnowledgeGraph({ nodes, links }) {
  return (
    <ForceGraph2D
      graphData={{ nodes, links }}
      nodeLabel="title"
      nodeAutoColorBy="category"
      linkDirectionalParticles={2}
      onNodeClick={node => openPage(node.url)}
    />
  );
}
```

**Database:** Local (SQLite + FAISS) or Cloud (Supabase + Pinecone)

---

## Phase 4: Quality & Polish (3-4 weeks)

### CI/CD Pipeline
**Time:** 3-5 days

**.github/workflows/ci.yml:**
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit
      - run: npm run test:integration

      - name: E2E Tests
        run: npx playwright test

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v4

  deploy-preview:
    needs: test
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm run build
      - uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_TOKEN }}
```

---

### Monitoring
**Time:** 1 week

```bash
npm install @sentry/react plausible-tracker
```

**Sentry setup:**
```typescript
// src/monitoring/sentry.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

**Analytics:**
```typescript
// src/monitoring/analytics.ts
import Plausible from 'plausible-tracker';

const plausible = Plausible({
  domain: 'zeno-browser.com',
  trackLocalhost: false
});

export function trackEvent(name: string, props?: object) {
  plausible.trackEvent(name, { props });
}

// Usage
trackEvent('ai_query', { provider: 'gemini', model: 'pro' });
trackEvent('bookmark_added', { category: 'research' });
```

---

### Documentation
**Time:** 1 week

**Create:**
```
/docs
├── README.md              - Overview
├── INSTALLATION.md        - Setup guide
├── ARCHITECTURE.md        - Technical architecture
├── API.md                 - Extension API reference
├── CONTRIBUTING.md        - Contribution guide
└── examples/
    ├── custom-extension.md
    └── ai-workflows.md
```

**JSDoc comments:**
```typescript
/**
 * Analyzes webpage content using AI
 * @param url - Page URL to analyze
 * @param options - Analysis options
 * @returns Analysis results with summary, topics, and sentiment
 * @throws {Error} If URL is invalid or fetch fails
 * @example
 * ```ts
 * const analysis = await analyzeContent('https://example.com', {
 *   provider: 'gemini',
 *   depth: 'detailed'
 * });
 * console.log(analysis.summary);
 * ```
 */
export async function analyzeContent(
  url: string,
  options: AnalysisOptions
): Promise<AnalysisResult> {
  // ...
}
```

---

## Built-in Extensions (Ideas)

### 1. Page Translator
```typescript
// Translate current page to any language
tools: ['translate_page', 'translate_selection']
ai: true
permissions: ['page_content']
```

### 2. Reader Mode
```typescript
// Clean reading experience
tools: ['extract_article', 'adjust_typography']
ai: false
permissions: ['page_content', 'css_injection']
```

### 3. Screenshot & Annotate
```typescript
// Capture and annotate pages
tools: ['capture_screenshot', 'capture_selection', 'annotate']
ai: false
permissions: ['capture_visible_tab']
```

### 4. Code Highlighter
```typescript
// Auto-detect and highlight code blocks
tools: ['detect_code', 'highlight_syntax']
ai: false
permissions: ['page_content', 'css_injection']
```

### 5. Smart Summarizer
```typescript
// AI-powered page summaries
tools: ['summarize_article', 'extract_key_points', 'generate_toc']
ai: true
permissions: ['page_content', 'ai_access']
```

### 6. Link Analyzer
```typescript
// Analyze and categorize page links
tools: ['extract_links', 'check_broken_links', 'categorize_links']
ai: true
permissions: ['page_content', 'network_access']
```

---

## Performance Optimization

### Bundle Size
**Current:** Unknown, likely >2MB with all AI SDKs

**Optimizations:**
1. **Code splitting**
```typescript
// astro.config.mjs
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'ai-providers': ['@google/generative-ai', 'openai'],
            'react-vendor': ['react', 'react-dom'],
            'utils': ['./src/utils']
          }
        }
      }
    }
  }
});
```

2. **Lazy load AI providers**
```typescript
// Only load when selected
const loadGemini = () => import('./aiProviders/gemini');
const loadOpenRouter = () => import('./aiProviders/openrouter');

// In ProviderSettings
const provider = await (selectedProvider === 'gemini'
  ? loadGemini()
  : loadOpenRouter());
```

3. **Image optimization**
```astro
---
import { Image } from 'astro:assets';
---
<Image src={favicon} width={16} height={16} format="webp" />
```

**Target:** <500KB initial, <2MB total

---

### Caching
```typescript
// Service worker for offline
// public/sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('zeno-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/app.js'
      ]);
    })
  );
});

// AI response caching
const cache = new Map<string, {result: any, timestamp: number}>();

async function cachedAICall(prompt: string) {
  const cached = cache.get(prompt);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.result;
  }

  const result = await aiProvider.call(prompt);
  cache.set(prompt, { result, timestamp: Date.now() });
  return result;
}
```

---

## Timeline Summary

**Month 1:** Security + MCP tools + Claude
**Month 2:** Testing + State management
**Month 3:** Web rendering + Desktop app start
**Month 4:** Desktop app complete + Advanced bookmarks
**Month 5:** Extension system
**Month 6:** Multi-agent AI
**Month 7-8:** Knowledge base
**Month 9:** Polish + CI/CD + Monitoring

**Total:** ~9 months to feature-complete v2.0

---

## Tech Debt to Address

1. **Error handling** - Add proper error boundaries
2. **Logging** - Structured logging (Winston/Pino)
3. **Type safety** - Add runtime validation (Zod)
4. **Accessibility** - ARIA labels, keyboard nav
5. **Internationalization** - i18n support (optional)
6. **Performance metrics** - Web Vitals tracking
7. **Security headers** - CSP, CORS, XSS protection
8. **Rate limiting** - Protect API endpoints
9. **Input validation** - Sanitize all user inputs
10. **Code documentation** - JSDoc for all public APIs

---

## Dependencies to Add

**Phase 1:**
```json
{
  "zustand": "^4.5.0",
  "immer": "^10.0.3",
  "vitest": "^1.0.0",
  "@testing-library/react": "^14.0.0",
  "playwright": "^1.40.0",
  "express": "^4.18.2",
  "@anthropic-ai/sdk": "^0.32.0"
}
```

**Phase 2:**
```json
{
  "electron": "^28.0.0",
  "electron-builder": "^24.9.0",
  "fuse.js": "^7.0.0",
  "@supabase/supabase-js": "^2.39.0"
}
```

**Phase 3:**
```json
{
  "langchain": "^0.1.0",
  "pinecone-client": "^2.0.0",
  "react-force-graph": "^1.44.0"
}
```

**Phase 4:**
```json
{
  "@sentry/react": "^7.90.0",
  "plausible-tracker": "^0.3.9",
  "winston": "^3.11.0"
}
```

---

## File Structure (Final)

```
ZENO_WEB_CORE/
├── src/
│   ├── components/        - React components
│   ├── pages/             - Astro pages
│   ├── layouts/           - Page layouts
│   ├── services/          - Business logic
│   │   ├── aiProviders/   - AI integrations
│   │   ├── tools/         - MCP tools
│   │   └── agents/        - AI agents
│   ├── store/             - Zustand state
│   ├── extensions/        - Extension system
│   ├── knowledge-base/    - KB system
│   ├── utils/             - Utilities
│   └── types/             - TypeScript types
├── api/                   - Express backend
│   ├── proxy.ts
│   ├── providers/
│   └── middleware/
├── electron/              - Electron app
│   ├── main.ts
│   └── preload.ts
├── tests/                 - Test suite
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                  - Documentation
├── public/                - Static assets
└── dist/                  - Build output
```
