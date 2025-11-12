# Instrukcje integracji BIELIK_THE_whitie z ZENO Browser

## 📋 Kontekst projektu

**Projekt:** ZENO Browser - przeglądarka z integracją AI  
**Framework:** Astro 5.14.8 + React 19.2 + TypeScript  
**Deployment:** Cloudflare Pages  
**Lokalizacja:** `V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\`

**System agentów Bielik:** `V:\PROTO_TYpy\ZENO_web_CORE\BIELIK_THE_whitie\`

---

## 🎯 Zadanie: Integracja 3 komponentów z systemu Bielik

### **Priorytet 1: Cloudflare Worker AI Proxy (BEZPIECZEŃSTWO)** 🔒

**Problem:** Klucze API do Gemini i OpenRouter są teraz w localStorage (niebezpieczne)

**Rozwiązanie:** Cloudflare Worker jako proxy

**Pliki do utworzenia:**

#### 1. `ZENO_WEB_CORE_APP/functions/ai-proxy.ts`
```typescript
// Cloudflare Pages Function (automatycznie deploy)
// Bazuj na: V:\PROTO_TYpy\ZENO_web_CORE\BIELIK_THE_whitie\cloudflareWorkerAdapter.ts

interface Env {
  GEMINI_API_KEY: string;
  OPENROUTER_API_KEY: string;
  CLAUDE_API_KEY?: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { provider, prompt, model, options } = await context.request.json();
  
  // Rate limiting (opcjonalne)
  // const clientIP = context.request.headers.get('CF-Connecting-IP');
  
  try {
    if (provider === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': context.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            ...options
          })
        }
      );
      return new Response(await response.text(), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (provider === 'openrouter') {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${context.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://zeno-browser.pages.dev',
          'X-Title': 'ZENO Browser'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          ...options
        })
      });
      return new Response(await response.text(), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (provider === 'claude') {
      // TODO: Dodaj obsługę Claude API
      return new Response(JSON.stringify({ error: 'Claude not implemented yet' }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Unknown provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('AI Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

**Konfiguracja Cloudflare:**
```bash
# W Cloudflare Pages Dashboard:
# Settings > Environment Variables > Production

GEMINI_API_KEY = "AIza..."
OPENROUTER_API_KEY = "sk-or-v1-..."
CLAUDE_API_KEY = "sk-ant-..."
```

#### 2. Modyfikacja `src/services/aiProviders/gemini.ts`
```typescript
// USUŃ to:
const apiKey = localStorage.getItem('gemini-api-key');
if (!apiKey) throw new Error('Gemini API key not found');

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
  { /* ... */ }
);

// ZASTĄP tym:
const response = await fetch('/ai-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'gemini',
    model,
    prompt: messages[messages.length - 1].content,
    options: {
      temperature,
      maxOutputTokens: maxTokens,
      // ... inne opcje
    }
  })
});

if (!response.ok) {
  throw new Error(`Gemini proxy error: ${response.status}`);
}

const data = await response.json();
// Przetwórz odpowiedź jak dotychczas
```

#### 3. Modyfikacja `src/services/aiProviders/openrouter.ts`
```typescript
// Analogicznie zmień na:
const response = await fetch('/ai-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'openrouter',
    model,
    prompt: messages[messages.length - 1].content,
    options: { temperature, max_tokens: maxTokens }
  })
});
```

---

### **Priorytet 2: System zarządzania agentami (Agent Manager)** 🤖

**Cel:** Centralny rejestr agentów MCP z monitoringiem statusu

**Pliki do utworzenia:**

#### 4. `src/services/agentManager.ts`
```typescript
// Skopiuj i zmodyfikuj: V:\PROTO_TYpy\ZENO_web_CORE\BIELIK_THE_whitie\agents_polaczek_dyrektor.ts

export interface Agent {
  id: string;
  name: string;
  type: 'search' | 'browser' | 'ai' | 'content' | 'dashboard';
  role: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  description?: string;
  lastActivity?: number;
  callCount?: number;
}

export class ZenoAgentManager {
  private agents: Map<string, Agent> = new Map();
  private listeners: ((agents: Agent[]) => void)[] = [];

  constructor() {
    this.registerDefaultAgents();
  }

  private registerDefaultAgents() {
    // 6 narzędzi MCP z mcpService.ts
    this.registerAgent({
      id: 'web-search',
      name: 'Web Search Agent',
      type: 'search',
      role: 'tavily-search',
      status: 'active',
      description: 'Wyszukiwanie w internecie przez Tavily API',
      callCount: 0
    });

    this.registerAgent({
      id: 'content-analysis',
      name: 'Content Analysis Agent',
      type: 'content',
      role: 'content-analyzer',
      status: 'active',
      description: 'Analiza zawartości stron web',
      callCount: 0
    });

    this.registerAgent({
      id: 'bookmark-manager',
      name: 'Bookmark Manager',
      type: 'browser',
      role: 'bookmark-keeper',
      status: 'active',
      description: 'Zarządzanie zakładkami',
      callCount: 0
    });

    this.registerAgent({
      id: 'page-summarizer',
      name: 'Page Summarizer',
      type: 'ai',
      role: 'summarizer',
      status: 'active',
      description: 'Podsumowanie treści stron',
      callCount: 0
    });

    this.registerAgent({
      id: 'link-extractor',
      name: 'Link Extractor',
      type: 'content',
      role: 'link-parser',
      status: 'active',
      description: 'Wydobywanie linków ze stron',
      callCount: 0
    });

    this.registerAgent({
      id: 'web-navigation',
      name: 'Web Navigation Agent',
      type: 'browser',
      role: 'navigator',
      status: 'active',
      description: 'Nawigacja i interakcje z przeglądarką',
      callCount: 0
    });
  }

  registerAgent(agent: Agent) {
    this.agents.set(agent.id, agent);
    this.notifyListeners();
  }

  updateAgentStatus(agentId: string, status: Agent['status']) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActivity = Date.now();
      this.notifyListeners();
    }
  }

  incrementCallCount(agentId: string) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.callCount = (agent.callCount || 0) + 1;
      agent.lastActivity = Date.now();
      this.notifyListeners();
    }
  }

  listAgents(type?: Agent['type']): Agent[] {
    const allAgents = Array.from(this.agents.values());
    return type ? allAgents.filter(a => a.type === type) : allAgents;
  }

  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  subscribe(listener: (agents: Agent[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const agents = this.listAgents();
    this.listeners.forEach(listener => listener(agents));
  }
}

// Singleton instance
export const agentManager = new ZenoAgentManager();
```

#### 5. Modyfikacja `src/services/mcpService.ts`
```typescript
// Na początku pliku dodaj:
import { agentManager } from './agentManager';

// W każdej funkcji narzędzia dodaj tracking:
export const mcpTools: MCPTool[] = [
  {
    name: 'web_search',
    description: 'Search the web using Tavily API',
    parameters: { /* ... */ },
    handler: async (params) => {
      agentManager.updateAgentStatus('web-search', 'busy');
      try {
        // ... istniejący kod wyszukiwania
        const result = await tavilySearch(params.query);
        agentManager.incrementCallCount('web-search');
        agentManager.updateAgentStatus('web-search', 'active');
        return result;
      } catch (error) {
        agentManager.updateAgentStatus('web-search', 'error');
        throw error;
      }
    }
  },
  // ... powtórz dla pozostałych 5 narzędzi
];
```

#### 6. `src/components/AgentStatusPanel.tsx`
```typescript
import React, { useEffect, useState } from 'react';
import { agentManager, Agent } from '../services/agentManager';

export function AgentStatusPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setAgents(agentManager.listAgents());
    const unsubscribe = agentManager.subscribe(setAgents);
    return unsubscribe;
  }, []);

  const statusColors = {
    active: '#10b981', // green
    idle: '#6b7280',   // gray
    busy: '#f59e0b',   // orange
    error: '#ef4444'   // red
  };

  const statusEmojis = {
    active: '✓',
    idle: '○',
    busy: '⟳',
    error: '✕'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'rgba(15, 23, 42, 0.95)',
      border: '1px solid #334155',
      borderRadius: '12px',
      padding: collapsed ? '12px' : '16px',
      minWidth: collapsed ? 'auto' : '280px',
      maxWidth: '320px',
      boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
      backdropFilter: 'blur(10px)',
      zIndex: 10000
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: collapsed ? '0' : '12px',
        cursor: 'pointer'
      }} onClick={() => setCollapsed(!collapsed)}>
        <h3 style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: 600,
          color: '#f1f5f9'
        }}>
          🤖 Agenty MCP {collapsed ? `(${agents.length})` : ''}
        </h3>
        <span style={{ color: '#94a3b8', fontSize: '12px' }}>
          {collapsed ? '▲' : '▼'}
        </span>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {agents.map(agent => (
            <div key={agent.id} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              background: 'rgba(30, 41, 59, 0.5)',
              borderRadius: '6px',
              border: `1px solid ${statusColors[agent.status]}20`
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#e2e8f0',
                  marginBottom: '2px'
                }}>
                  {agent.name}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  Wywołań: {agent.callCount || 0}
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{
                  fontSize: '11px',
                  color: statusColors[agent.status],
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}>
                  {agent.status}
                </span>
                <span style={{
                  fontSize: '16px',
                  color: statusColors[agent.status]
                }}>
                  {statusEmojis[agent.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!collapsed && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #334155',
          fontSize: '11px',
          color: '#64748b',
          textAlign: 'center'
        }}>
          Ostatnia aktualizacja: {new Date().toLocaleTimeString('pl-PL')}
        </div>
      )}
    </div>
  );
}
```

#### 7. Dodaj panel do `src/components/Browser.tsx`
```typescript
// Na początku pliku:
import { AgentStatusPanel } from './AgentStatusPanel';

// W return() przed zamykającym </div>:
return (
  <div className="browser-container">
    {/* ... istniejący kod ... */}
    
    <AgentStatusPanel />
  </div>
);
```

---

### **Priorytet 3: Dashboard Keeper (aktualizacje statusów)** 📊

**Cel:** Dynamiczne aktualizacje statystyk w czasie rzeczywistym

**Pliki do utworzenia:**

#### 8. `src/services/dashboardService.ts`
```typescript
// Bazuj na: V:\PROTO_TYpy\ZENO_web_CORE\BIELIK_THE_whitie\agents_polaczek_d1.ts

interface BrowserStats {
  openTabs: number;
  activeModel: string;
  tokensUsed: number;
  messagesCount: number;
  lastActivity: number;
  uptime: number;
}

class DashboardService {
  private stats: BrowserStats = {
    openTabs: 0,
    activeModel: 'none',
    tokensUsed: 0,
    messagesCount: 0,
    lastActivity: Date.now(),
    uptime: Date.now()
  };
  
  private listeners: ((stats: BrowserStats) => void)[] = [];

  updateStats(updates: Partial<BrowserStats>) {
    this.stats = { ...this.stats, ...updates, lastActivity: Date.now() };
    this.notifyListeners();
    
    // Opcjonalnie: zapisz do localStorage
    localStorage.setItem('zeno-dashboard-stats', JSON.stringify(this.stats));
  }

  getStats(): BrowserStats {
    return { ...this.stats };
  }

  subscribe(listener: (stats: BrowserStats) => void) {
    this.listeners.push(listener);
    listener(this.stats); // Wywołaj od razu
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.stats));
  }

  // Integracja z POLACZEK_D1
  updateDashboard(data: any) {
    console.log('[DASHBOARD] Updated with data:', data);
    this.updateStats(data);
  }
}

export const dashboardService = new DashboardService();
```

#### 9. Modyfikacja `src/components/ChatPanel.tsx`
```typescript
// Na początku pliku:
import { dashboardService } from '../services/dashboardService';

// W funkcji handleSendMessage (po wysłaniu wiadomości):
const handleSendMessage = async () => {
  // ... istniejący kod wysyłania ...
  
  // Zaktualizuj statystyki:
  dashboardService.updateStats({
    messagesCount: messages.length + 1,
    activeModel: selectedProvider,
    tokensUsed: estimateTokens(response) // funkcja pomocnicza
  });
};

// Funkcja pomocnicza do szacowania tokenów:
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4); // Proste oszacowanie
}
```

#### 10. Modyfikacja `src/components/Browser.tsx` (tracking tabów)
```typescript
// W useEffect gdy tabs się zmienia:
useEffect(() => {
  dashboardService.updateStats({ openTabs: tabs.length });
}, [tabs]);
```

---

## 🚀 Deployment Checklist

### Krok 1: Konfiguracja Cloudflare Pages
```bash
# W Dashboard Cloudflare Pages:
# Settings > Environment Variables > Production

GEMINI_API_KEY = "twój-klucz-gemini"
OPENROUTER_API_KEY = "twój-klucz-openrouter"
```

### Krok 2: Build i deploy
```bash
cd V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP
npm run build
git add .
git commit -m "[BIELIK] Integracja: AI Proxy + Agent Manager + Dashboard Service"
git push origin main
```

### Krok 3: Testowanie
1. Otwórz https://zeno-browser.pages.dev
2. Sprawdź czy panel agentów się pojawia (prawy dolny róg)
3. Wyślij wiadomość do AI (klucze API powinny działać przez proxy)
4. Sprawdź czy statusy agentów się aktualizują (busy → active)
5. Otwórz kilka tabów i sprawdź licznik w dashboardzie

---

## 📝 Co NIE jest w tym zadaniu

❌ **Nie dodawaj:** Bielik LLM (Ollama lokalnie)  
❌ **Nie dodawaj:** DigitalOcean Droplet setup  
❌ **Nie dodawaj:** Business Orchestrator endpoints  
❌ **Nie dodawaj:** polaczekBAdapter.ts (niejasny kontekst)

Te funkcje są zbyt zaawansowane lub wymagają infrastruktury, której jeszcze nie mamy.

---

## ✅ Walidacja sukcesu

Po implementacji powinieneś zobaczyć:

1. **AI Proxy działa:**
   - Wiadomości do Gemini/OpenRouter działają
   - Klucze API NIE są w localStorage
   - Żadnych błędów CORS

2. **Panel agentów widoczny:**
   - Prawy dolny róg ekranu
   - 6 agentów MCP listowanych
   - Statusy zmieniają się z "idle" → "busy" → "active"
   - Licznik wywołań rośnie

3. **Dashboard stats działają:**
   - Licznik tabów się aktualizuje
   - Model AI jest wyświetlany
   - Licznik wiadomości rośnie

---

## 🐛 Rozwiązywanie problemów

**Problem 1:** Cloudflare Worker nie działa
- Sprawdź czy zmienne środowiskowe są ustawione
- Sprawdź logi w Cloudflare Dashboard > Functions > Logs

**Problem 2:** Panel agentów nie pojawia się
- Sprawdź czy `<AgentStatusPanel />` jest w Browser.tsx
- Sprawdź z-index (powinien być 10000)

**Problem 3:** Statusy agentów nie aktualizują się
- Sprawdź czy `agentManager.updateAgentStatus()` jest wywoływany
- Sprawdź console.log w useEffect w AgentStatusPanel

---

## 📚 Referencje

- Bielik Integration Checklist: `V:\PROTO_TYpy\ZENO_web_CORE\BIELIK_THE_whitie\BIELIK_INTEGRATION_CHECKLIST.md`
- Cloudflare Adapter: `V:\PROTO_TYpy\ZENO_web_CORE\BIELIK_THE_whitie\cloudflareWorkerAdapter.ts`
- Agent Director: `V:\PROTO_TYpy\ZENO_web_CORE\BIELIK_THE_whitie\agents_polaczek_dyrektor.ts`
- Dashboard Agent: `V:\PROTO_TYpy\ZENO_web_CORE\BIELIK_THE_whitie\agents_polaczek_d1.ts`

---

## 🎯 Następne kroki (po tym zadaniu)

1. Dodać rate limiting do AI Proxy
2. Dodać eksport statystyk do pliku
3. Dodać powiadomienia o błędach agentów
4. Rozbudować Business Orchestrator (gdy będzie backend)
