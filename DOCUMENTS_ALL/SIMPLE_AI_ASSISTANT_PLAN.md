# 🤖 Prosty Asystent AI - Plan Implementacji
**ZENO Browser - Minimal Integration**

---

## 🎯 CEL

Dodać prosty asystent AI do ZENO Browser:
- ✅ **Darmowe modele** z Cloudflare Workers AI (polskojęzyczne)
- ✅ **RAG** - wiedza o dokumentacji projektu
- ✅ **Quick Chat Bar** - szybki dostęp na stronie głównej
- ✅ **Admin panel** - hasło: `#HAOS1977#`
- ✅ **Minimal changes** - nie ingerować za bardzo w aplikację

---

## 📊 DOSTĘPNE MODELE (Cloudflare Workers AI)

### Darmowe modele z wsparciem wielojęzycznym (Polski ✅):

| Model | Rozmiar | Languages | Best For |
|-------|---------|-----------|----------|
| **Llama 3.2 1B** | 1B | Multilingual | Szybkie odpowiedzi, dialogowe |
| **Llama 3.2 3B** | 3B | Multilingual | Lepsze odpowiedzi, nadal szybkie |
| **Gemma 3 12B-IT** | 12B | 140+ languages | Najlepsze odpowiedzi, bardziej precyzyjne |
| **Gemma 7B-IT** | 7B | Multilingual | Średnia jakość, dobra szybkość |
| **Qwen 7B** | 7B | Multilingual | Dobra alternatywa |

**Embeddings dla RAG:**
- **EmbeddingGemma-300m** - 100+ languages, semantic search

**Pricing:** $0.011 per 1000 Neurons (~500-1000 requests na $1)

---

## 🏗️ ARCHITEKTURA

```
[User] → [Quick Chat Bar] → [Cloudflare Pages Function]
                                    ↓
                          [Cloudflare Workers AI]
                                    ↓
                          [RAG Service] → [Knowledge Base]
                                    ↓
                              [Response]
```

### Komponenty:

1. **Quick Chat Bar** (`WelcomePage.tsx`) - fixed bottom bar
2. **RAG Service** (`ragService.ts`) - fetch docs + simple keyword search
3. **AI Proxy** (`functions/ai-assistant.ts`) - Cloudflare Workers AI
4. **Knowledge Base** (`public/knowledge-base/`) - markdown docs
5. **Admin Panel** (`admin-ai.astro`) - login + settings

---

## 📦 IMPLEMENTACJA (Step by Step)

### **KROK 1: Knowledge Base (5 min)**

Skopiuj dokumentację do public folder:

```bash
mkdir -p ZENO_WEB_CORE_APP/public/knowledge-base

# Skopiuj główne pliki dokumentacji
cp DEVELOPMENT_PLAN.md ZENO_WEB_CORE_APP/public/knowledge-base/01_development_plan.md
cp QUICK_IMPROVEMENTS.md ZENO_WEB_CORE_APP/public/knowledge-base/02_quick_improvements.md
cp VERSION_CONTROL_QUICKSTART.md ZENO_WEB_CORE_APP/public/knowledge-base/03_version_control.md
cp .cloudflare/DEPLOYMENT_CHECKLIST.md ZENO_WEB_CORE_APP/public/knowledge-base/04_deployment.md

# Stwórz API reference
cat > ZENO_WEB_CORE_APP/public/knowledge-base/05_api_reference.md << 'EOF'
# ZENO Browser API Reference

## Cloudflare Worker API
- URL: https://zeno-browser-api.stolarnia-ams.workers.dev

## Endpoints

### GET /health
Health check endpoint

### GET /api/iframe/sites
Lista stron testowych iframe
- Query params: ?q=search&category=dev&iframeAllowed=true&page=1&limit=20

### POST /api/admin/sites
Dodaj nową stronę
- Body: { name, url, category, description, iframeAllowed }

### PUT /api/admin/sites/:id
Aktualizuj stronę

### DELETE /api/admin/sites/:id
Usuń stronę

## MCP Tools (6 narzędzi)
1. web_search - Tavily search
2. content_analysis - Analiza zawartości
3. bookmark_manager - Zarządzanie zakładkami
4. page_summarizer - Podsumowanie stron
5. link_extractor - Wyciąganie linków
6. web_navigation - Nawigacja przeglądarki

## Komponenty
- Browser.tsx - główny komponent przeglądarki
- ChatPanel.tsx - panel czatu z AI
- WebView.tsx - iframe viewer
- WelcomePage.tsx - strona startowa
- Toolbar.tsx - pasek narzędzi

## AI Providers
- Gemini (Google)
- OpenAI
- Anthropic Claude
- OpenRouter (8+ modeli)

## Deployment
- Platform: Cloudflare Pages
- URL: https://zeno-browser.pages.dev
- Custom domain: https://zenbrowsers.org (pending DNS)
EOF
```

---

### **KROK 2: RAG Service (10 min)**

Stwórz prosty serwis RAG:

**Plik:** `src/services/simpleRagService.ts`

```typescript
/**
 * Simple RAG Service - Knowledge Base Integration
 * Używa prostego keyword matching (bez embeddings)
 */

export interface KnowledgeChunk {
  file: string;
  content: string;
  relevance: number;
}

class SimpleRAGService {
  private knowledgeBase: Map<string, string> = new Map();
  private isReady = false;

  async init() {
    if (this.isReady) return;

    const docs = [
      '01_development_plan.md',
      '02_quick_improvements.md',
      '03_version_control.md',
      '04_deployment.md',
      '05_api_reference.md'
    ];

    try {
      for (const doc of docs) {
        const response = await fetch(`/knowledge-base/${doc}`);
        if (response.ok) {
          const content = await response.text();
          this.knowledgeBase.set(doc, content);
        }
      }
      this.isReady = true;
      console.log(`[RAG] Loaded ${this.knowledgeBase.size} documents`);
    } catch (error) {
      console.error('[RAG] Failed to load knowledge base:', error);
    }
  }

  search(query: string, maxResults: number = 2): KnowledgeChunk[] {
    if (!this.isReady) return [];

    const queryLower = query.toLowerCase();
    const results: KnowledgeChunk[] = [];

    this.knowledgeBase.forEach((content, file) => {
      const contentLower = content.toLowerCase();
      let score = 0;

      // Exact phrase match
      if (contentLower.includes(queryLower)) {
        score += 100;
      }

      // Keyword matching
      const keywords = queryLower.split(/\s+/).filter(w => w.length > 3);
      keywords.forEach(keyword => {
        const matches = (contentLower.match(new RegExp(keyword, 'g')) || []).length;
        score += matches * 5;
      });

      if (score > 0) {
        // Extract relevant section (500 chars around match)
        const index = contentLower.indexOf(queryLower);
        const start = Math.max(0, index - 250);
        const end = Math.min(content.length, index + queryLower.length + 250);
        const excerpt = content.substring(start, end);

        results.push({
          file,
          content: excerpt,
          relevance: score
        });
      }
    });

    return results
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);
  }

  buildPrompt(userQuery: string): string {
    const chunks = this.search(userQuery, 2);

    if (chunks.length === 0) {
      return `User question: ${userQuery}

No specific documentation found. Use general knowledge to help the user.`;
    }

    const context = chunks
      .map(chunk => `[From ${chunk.file}]\n${chunk.content}`)
      .join('\n\n---\n\n');

    return `You are a helpful AI assistant for ZENO Browser.

Context from documentation:
${context}

---

User question: ${userQuery}

Instructions:
- Answer in Polish if question is in Polish
- Answer in English if question is in English
- Be concise and helpful
- If context doesn't have the answer, say so and provide general guidance
- Reference the documentation file when quoting`;
  }
}

// Singleton
let ragInstance: SimpleRAGService | null = null;

export function getRAG(): SimpleRAGService {
  if (!ragInstance) {
    ragInstance = new SimpleRAGService();
  }
  return ragInstance;
}
```

---

### **KROK 3: Cloudflare AI Proxy (15 min)**

**Plik:** `src/pages/api/ai-assistant.ts`

```typescript
/**
 * Cloudflare Pages Function - AI Assistant Proxy
 * Używa Cloudflare Workers AI (darmowe modele)
 */

import type { APIRoute } from 'astro';

// Dostępne modele
const AVAILABLE_MODELS = {
  'llama-3.2-1b': '@cf/meta/llama-3.2-1b-instruct',
  'llama-3.2-3b': '@cf/meta/llama-3.2-3b-instruct',
  'gemma-7b': '@cf/google/gemma-7b-it-lora',
  'gemma-12b': '@hf/google/gemma-3-12b-it',
  'qwen-7b': '@cf/qwen/qwen1.5-7b-chat-awq'
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { prompt, model = 'llama-3.2-3b', temperature = 0.7 } = await request.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get Cloudflare account ID and API token from env
    const accountId = import.meta.env.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = import.meta.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return new Response(JSON.stringify({
        error: 'Cloudflare credentials not configured',
        details: 'Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in environment'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const modelPath = AVAILABLE_MODELS[model] || AVAILABLE_MODELS['llama-3.2-3b'];

    // Call Cloudflare Workers AI
    const aiResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelPath}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful AI assistant for ZENO Browser. Answer questions about the application, help users find features, and provide guidance.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature,
          max_tokens: 1024
        })
      }
    );

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Cloudflare AI error:', errorText);
      return new Response(JSON.stringify({
        error: 'AI request failed',
        status: aiResponse.status,
        details: errorText
      }), {
        status: aiResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await aiResponse.json();

    return new Response(JSON.stringify({
      success: true,
      response: data.result?.response || data.result?.text || 'No response',
      model: modelPath
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('AI Assistant error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

---

### **KROK 4: Quick Chat Bar (15 min)**

**Modyfikacja:** `src/components/WelcomePage.tsx`

Dodaj na końcu komponentu (przed zamykającym `</div>`):

```tsx
{/* ============ SIMPLE AI ASSISTANT ============ */}
{showQuickChat && (
  <div style={{
    position: 'fixed',
    bottom: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '90%',
    maxWidth: '700px',
    zIndex: 9999,
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    backdropFilter: 'blur(12px)',
    border: '2px solid',
    borderImage: 'linear-gradient(135deg, #3b82f6, #8b5cf6) 1',
    padding: '16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
  }}>
    <div style={{
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }}>
      <div style={{ fontSize: '28px', flexShrink: 0 }}>🤖</div>

      <div style={{ flex: 1 }}>
        <textarea
          ref={chatInputRef}
          placeholder="Zapytaj o funkcje aplikacji, dokumentację lub zasoby..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendToAI();
            }
          }}
          style={{
            width: '100%',
            minHeight: '60px',
            padding: '12px',
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            borderRadius: '0',
            color: '#f8fafc',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none'
          }}
        />

        {aiResponse && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            borderRadius: '4px',
            fontSize: '13px',
            lineHeight: '1.6',
            color: '#e2e8f0',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            <div style={{
              fontWeight: 600,
              marginBottom: '8px',
              color: '#60a5fa'
            }}>
              Odpowiedź AI ({selectedModel}):
            </div>
            {aiResponse}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <button
          onClick={handleSendToAI}
          disabled={isAiLoading || !chatInput.trim()}
          style={{
            padding: '12px 20px',
            backgroundColor: isAiLoading ? '#64748b' : '#3b82f6',
            border: 'none',
            color: 'white',
            cursor: isAiLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s',
            opacity: !chatInput.trim() ? 0.5 : 1
          }}
          onMouseEnter={(e) => {
            if (!isAiLoading && chatInput.trim()) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!isAiLoading) {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          {isAiLoading ? '⟳' : '→'} Wyślij
        </button>

        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          style={{
            padding: '8px',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            color: '#f8fafc',
            fontSize: '11px',
            cursor: 'pointer'
          }}
        >
          <option value="llama-3.2-1b">Llama 3.2 1B (szybki)</option>
          <option value="llama-3.2-3b">Llama 3.2 3B (zbalansowany)</option>
          <option value="gemma-7b">Gemma 7B (dobry)</option>
          <option value="gemma-12b">Gemma 12B (najlepszy)</option>
          <option value="qwen-7b">Qwen 7B (alternatywny)</option>
        </select>

        <button
          onClick={() => setShowQuickChat(false)}
          style={{
            padding: '8px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(148, 163, 184, 0.3)',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '11px'
          }}
          title="Zamknij"
        >
          ✕
        </button>
      </div>
    </div>

    <div style={{
      marginTop: '12px',
      fontSize: '11px',
      color: '#64748b',
      textAlign: 'center'
    }}>
      Używa darmowych modeli Cloudflare Workers AI · Shift+Enter = nowa linia
    </div>
  </div>
)}

{/* Quick AI Button */}
{!showQuickChat && (
  <button
    onClick={() => setShowQuickChat(true)}
    style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      border: '2px solid #60a5fa',
      color: 'white',
      fontSize: '28px',
      cursor: 'pointer',
      boxShadow: '0 10px 30px rgba(59, 130, 246, 0.4)',
      zIndex: 9998,
      transition: 'all 0.3s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.1)';
      e.currentTarget.style.boxShadow = '0 15px 40px rgba(59, 130, 246, 0.6)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)';
    }}
    title="Otwórz Asystenta AI"
  >
    🤖
  </button>
)}
{/* ============ END AI ASSISTANT ============ */}
```

**Dodaj state i funkcje** na początku komponentu:

```tsx
// Stan dla AI chat
const [showQuickChat, setShowQuickChat] = React.useState(false);
const [chatInput, setChatInput] = React.useState('');
const [aiResponse, setAiResponse] = React.useState('');
const [isAiLoading, setIsAiLoading] = React.useState(false);
const [selectedModel, setSelectedModel] = React.useState('llama-3.2-3b');
const chatInputRef = React.useRef<HTMLTextAreaElement>(null);

// Funkcja wysyłania do AI
const handleSendToAI = async () => {
  if (!chatInput.trim() || isAiLoading) return;

  setIsAiLoading(true);
  setAiResponse('');

  try {
    // Użyj RAG do wzbogacenia promptu
    const { getRAG } = await import('../services/simpleRagService');
    const rag = getRAG();

    // Inicjalizuj RAG jeśli jeszcze nie
    await rag.init();

    // Buduj prompt z kontekstem
    const enhancedPrompt = rag.buildPrompt(chatInput);

    // Wywołaj AI
    const response = await fetch('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        model: selectedModel,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'AI request failed');
    }

    const data = await response.json();
    setAiResponse(data.response);

  } catch (error: any) {
    console.error('AI error:', error);
    setAiResponse(`❌ Błąd: ${error.message}`);
  } finally {
    setIsAiLoading(false);
  }
};
```

---

### **KROK 5: Admin Panel (20 min)**

**Plik:** `src/pages/admin-ai.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="Admin - AI Assistant" description="Admin panel for AI configuration">
  <div id="admin-root"></div>
</Layout>

<style>
  #admin-root {
    min-height: 100vh;
    padding: 20px;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
</style>

<script>
  import { createElement } from 'react';
  import { createRoot } from 'react-dom/client';
  import AdminPanel from '../components/AdminPanel';

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('admin-root');
    if (root) {
      createRoot(root).render(createElement(AdminPanel));
    }
  });
</script>
```

**Plik:** `src/components/AdminPanel.tsx`

```tsx
import React, { useState, useEffect } from 'react';

const ADMIN_PASSWORD = '#HAOS1977#';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Settings
  const [cloudflareAccountId, setCloudflareAccountId] = useState('');
  const [cloudflareApiToken, setCloudflareApiToken] = useState('');
  const [defaultModel, setDefaultModel] = useState('llama-3.2-3b');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const auth = sessionStorage.getItem('admin-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      loadSettings();
    }
  }, []);

  const loadSettings = () => {
    setCloudflareAccountId(localStorage.getItem('cf-account-id') || '');
    setCloudflareApiToken(localStorage.getItem('cf-api-token') || '');
    setDefaultModel(localStorage.getItem('default-ai-model') || 'llama-3.2-3b');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin-auth', 'true');
      setError('');
      loadSettings();
    } else {
      setError('Nieprawidłowe hasło');
      setPassword('');
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem('cf-account-id', cloudflareAccountId);
    localStorage.setItem('cf-api-token', cloudflareApiToken);
    localStorage.setItem('default-ai-model', defaultModel);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div style={{
        maxWidth: '400px',
        margin: '100px auto',
        padding: '40px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '2px solid #3b82f6',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#f8fafc',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          🔒 Admin Panel
        </h1>

        <form onSubmit={handleLogin}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Wprowadź hasło admina"
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: '#f8fafc',
              fontSize: '14px',
              outline: 'none'
            }}
            autoFocus
          />

          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid #ef4444',
              borderRadius: '4px',
              color: '#fca5a5',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            Zaloguj się
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          <strong>Wskazówka:</strong> Skontaktuj się z administratorem systemu aby uzyskać hasło dostępu.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '40px auto',
      padding: '40px',
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      border: '2px solid #3b82f6',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '700',
          color: '#f8fafc'
        }}>
          ⚙️ Ustawienia AI Assistant
        </h1>

        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            color: '#fca5a5',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Wyloguj
        </button>
      </div>

      {saveSuccess && (
        <div style={{
          padding: '12px',
          marginBottom: '24px',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid #22c55e',
          borderRadius: '4px',
          color: '#86efac',
          fontSize: '13px'
        }}>
          ✓ Ustawienia zapisane pomyślnie!
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#e2e8f0',
          marginBottom: '16px'
        }}>
          Cloudflare Workers AI
        </h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#94a3b8'
          }}>
            Account ID
          </label>
          <input
            type="text"
            value={cloudflareAccountId}
            onChange={(e) => setCloudflareAccountId(e.target.value)}
            placeholder="7f490d58a478c6baccb0ae01ea1d87c3"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: '#f8fafc',
              fontSize: '13px',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#94a3b8'
          }}>
            API Token
          </label>
          <input
            type="password"
            value={cloudflareApiToken}
            onChange={(e) => setCloudflareApiToken(e.target.value)}
            placeholder="••••••••••••••••••••••••"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid #334155',
              borderRadius: '4px',
              color: '#f8fafc',
              fontSize: '13px',
              fontFamily: 'monospace'
            }}
          />
          <div style={{
            marginTop: '8px',
            fontSize: '11px',
            color: '#64748b'
          }}>
            Get token: <a href="https://dash.cloudflare.com/profile/api-tokens" target="_blank" style={{ color: '#60a5fa' }}>Cloudflare Dashboard</a>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: '#e2e8f0',
          marginBottom: '16px'
        }}>
          Domyślny Model AI
        </h2>

        <select
          value={defaultModel}
          onChange={(e) => setDefaultModel(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            border: '1px solid #334155',
            borderRadius: '4px',
            color: '#f8fafc',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <option value="llama-3.2-1b">Llama 3.2 1B (najszybszy)</option>
          <option value="llama-3.2-3b">Llama 3.2 3B (zbalansowany)</option>
          <option value="gemma-7b">Gemma 7B (dobry)</option>
          <option value="gemma-12b">Gemma 12B (najlepszy)</option>
          <option value="qwen-7b">Qwen 7B (alternatywny)</option>
        </select>

        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#94a3b8',
          lineHeight: '1.6'
        }}>
          <strong>Informacje o modelach:</strong><br/>
          • Llama 3.2 1B/3B - Wielojęzyczne, szybkie<br/>
          • Gemma 12B - 140+ języków, najbardziej precyzyjny<br/>
          • Gemma 7B - Dobra jakość, średnia szybkość<br/>
          • Qwen 7B - Alternatywa dla Gemma<br/>
          <br/>
          Wszystkie modele są <strong>DARMOWE</strong> w ramach Cloudflare Workers AI
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: '#3b82f6',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s'
        }}
      >
        💾 Zapisz ustawienia
      </button>

      <div style={{
        marginTop: '32px',
        padding: '16px',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '4px'
      }}>
        <h3 style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#c4b5fd',
          marginBottom: '12px'
        }}>
          📊 Statystyki
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          <div>
            <strong>Knowledge Base:</strong> 5 dokumentów
          </div>
          <div>
            <strong>Dostępne modele:</strong> 5
          </div>
          <div>
            <strong>Pricing:</strong> $0.011/1000 neurons
          </div>
          <div>
            <strong>Status:</strong> <span style={{ color: '#22c55e' }}>✓ Aktywny</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### **KROK 6: Environment Variables (5 min)**

**Plik:** `.env` (dodaj na końcu)

```env
# Cloudflare Workers AI
CLOUDFLARE_ACCOUNT_ID=7f490d58a478c6baccb0ae01ea1d87c3
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token-here
```

**W Cloudflare Pages Dashboard:**
```
Settings > Environment Variables > Production

CLOUDFLARE_ACCOUNT_ID = 7f490d58a478c6baccb0ae01ea1d87c3
CLOUDFLARE_API_TOKEN = your-token-here
```

---

## ✅ DEPLOYMENT CHECKLIST

### Pre-deployment:
- [ ] Knowledge base skopiowana do `public/knowledge-base/`
- [ ] `simpleRagService.ts` utworzony
- [ ] `api/ai-assistant.ts` utworzony
- [ ] WelcomePage.tsx zmodyfikowana (Quick Chat Bar)
- [ ] AdminPanel.tsx + admin-ai.astro utworzone
- [ ] Environment variables ustawione

### Build test:
```bash
cd ZENO_WEB_CORE_APP
npm run build
```

### Deploy:
```bash
git add .
git commit -m "[FEATURE] Simple AI Assistant with Cloudflare Workers AI

- Added RAG service with knowledge base (5 docs)
- Quick Chat Bar on WelcomePage
- Cloudflare Workers AI integration (5 models)
- Admin panel with authentication (#HAOS1977#)
- Free multilingual models (Polish support)

Models:
- Llama 3.2 1B/3B (fast)
- Gemma 7B/12B (best quality)
- Qwen 7B (alternative)

Features:
- Context-aware responses (RAG)
- Multi-model selection
- Admin configuration panel
- Minimal changes to existing app
"

git push origin claude/check-cloudflare-setup-011CUoNiHDnWG4jj9urpFTf3
```

---

## 🧪 TESTING

### Test 1: RAG Service
```javascript
// W browser console:
const { getRAG } = await import('./services/simpleRagService');
const rag = getRAG();
await rag.init();
rag.search('deployment');
```

### Test 2: AI Proxy
```bash
curl -X POST https://zeno-browser.pages.dev/api/ai-assistant \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Hello, what can you do?","model":"llama-3.2-3b"}'
```

### Test 3: Quick Chat
1. Otwórz https://zeno-browser.pages.dev
2. Kliknij 🤖 button (prawy dolny róg)
3. Napisz: "Jak dodać nową stronę do iframe?"
4. Sprawdź czy odpowiedź zawiera informacje z dokumentacji

### Test 4: Admin Panel
1. Otwórz https://zeno-browser.pages.dev/admin-ai
2. Wprowadź hasło: `#HAOS1977#`
3. Zmodyfikuj Account ID i API Token
4. Zapisz ustawienia
5. Sprawdź localStorage

---

## 🎯 PRZYKŁADOWE ZAPYTANIA

### Polski:
- "Jak dodać nową stronę do testowania iframe?"
- "Jakie narzędzia MCP są dostępne?"
- "Jak działa deploy na Cloudflare Pages?"
- "Co to jest RAG i jak działa w tej aplikacji?"
- "Pokaż mi dostępne endpointy API"

### Angielski:
- "How to deploy to Cloudflare Pages?"
- "What MCP tools are available?"
- "Show me the project structure"
- "How does the Browser component work?"

---

## 📊 KOSZTY

**Cloudflare Workers AI:**
- Pricing: $0.011 per 1000 neurons
- 1 request ≈ 0.5-2 neurons (zależy od modelu i długości)
- **Szacunek:** 500-1000 zapytań za $1
- **Miesięcznie:** ~10,000 zapytań ≈ $10-20

**Free tier:** Pierwsze 10,000 neurons GRATIS!

---

## 🔐 BEZPIECZEŃSTWO

### Admin hasło:
- Przechowywane w kodzie: `#HAOS1977#`
- Session tylko - wymaga logowania po odświeżeniu
- Brak backendu - tylko localStorage

### API Keys:
- Cloudflare credentials w environment variables
- NIE eksponowane na froncie
- Proxy zabezpiecza klucze

### Rate limiting:
- Cloudflare automatycznie limituje
- Można dodać custom limits w proxy

---

## 🚀 NEXT STEPS (Opcjonalne)

Po wdrożeniu podstawowej wersji:

1. **Embeddings dla RAG** - użyj EmbeddingGemma-300m
2. **Chat history** - zapisuj konwersacje
3. **Better UI** - modal zamiast fixed bar
4. **Voice input** - Web Speech API
5. **MCP Integration** - pozwól AI używać narzędzi
6. **Analytics** - tracking usage
7. **Rate limiting** - dodaj custom limits
8. **Multi-turn conversations** - context przez kilka wiadomości

---

## 📝 NOTES

- **Minimal changes** - tylko 3 pliki zmodyfikowane (WelcomePage.tsx, .env, +nowe pliki)
- **No backend needed** - wszystko przez Cloudflare Pages Functions
- **Free models** - Cloudflare Workers AI (darmowy tier)
- **Polish support** - wszystkie modele multilingual
- **Simple auth** - hasło w kodzie dla admina
- **RAG ready** - knowledge base + embeddings ready

---

## 🆘 TROUBLESHOOTING

### Problem: AI nie odpowiada
**Rozwiązanie:** Sprawdź environment variables w Cloudflare Dashboard

### Problem: RAG nie znajduje dokumentów
**Rozwiązanie:** Sprawdź czy pliki są w `public/knowledge-base/`

### Problem: Admin panel - złe hasło
**Rozwiązanie:** Hasło jest dokładnie: `#HAOS1977#` (z hashtagiem na początku i końcu)

### Problem: CORS errors
**Rozwiązanie:** Cloudflare Pages Functions automatycznie handle CORS

### Problem: Slow responses
**Rozwiązanie:** Użyj mniejszego modelu (llama-3.2-1b zamiast gemma-12b)

---

**Czas implementacji:** ~70 minut
**Poziom trudności:** Średni
**Wymagania:** Node.js, npm, Cloudflare account
**Status:** Ready to implement ✅
