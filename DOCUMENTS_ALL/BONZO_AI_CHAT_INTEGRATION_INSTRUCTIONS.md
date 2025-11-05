# 🤖 BONZO_AI_CHAT - Integration Instructions for Claude

## 📋 Overview

**Source**: `V:\PROTO_TYpy\ZENO_web_CORE\gemini-multi-modal-ai-suite\`  
**Target**: ZENO_WEB_CORE_APP (Astro + React project)  
**New Name**: `BONZO_AI_CHAT`

**Current Gemini Suite Features**:
- ✅ Multi-modal chat (text, images, audio transcription)
- ✅ Multiple AI providers (Gemini, OpenRouter with 8+ models)
- ✅ Dark/Light theme
- ✅ System prompts
- ✅ Chat history
- ✅ Image analysis
- ✅ Audio transcription

**Goal**: Integrate as `/ai-assistant` route in ZENO Browser with Cloudflare deployment support

---

## ⚠️ CRITICAL: Use Existing ZENO Theme (DO THIS FIRST!)

**IMPORTANT**: NIE twórz nowych stylów Tailwind! Użyj istniejącego theme z `src/styles/global.css`:

### Existing Theme Variables to Use:
```css
/* Z src/styles/global.css */
--primary: #3b82f6;           /* Niebieski */
--primary-light: #60a5fa;     /* Jasny niebieski */
--primary-dark: #2563eb;      /* Ciemny niebieski */
--secondary: #8b5cf6;         /* Fioletowy */
--accent: #06b6d4;            /* Cyan */
--background: #0f172a;        /* Ciemne tło */
--surface: #1e293b;           /* Powierzchnie */
--text: #f8fafc;              /* Główny tekst */
--text-muted: #94a3b8;        /* Wyciszony tekst */
--border: #334155;            /* Obramowania */
```

### Replace ALL Tailwind Classes in Copied Components:

**PRZED** (z gemini-multi-modal-ai-suite):
```tsx
<div className="bg-gray-900 text-gray-100">
<button className="bg-indigo-600 hover:bg-indigo-500">
<div className="border-gray-700">
```

**PO** (używając ZENO theme):
```tsx
<div style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
<button style={{ 
  backgroundColor: 'var(--primary)', 
  transition: 'all 0.3s',
  border: 'none'
}} 
onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-dark)'}
onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
>
<div style={{ borderColor: 'var(--border)' }}>
```

### Reuse Existing ZENO Components Where Possible:

**ZAMIAST tworzyć nowe komponenty, użyj istniejących**:
- `src/components/ChatPanel.tsx` - jako baza dla BONZO Chat
- `src/styles/global.css` - wszystkie style (buttons, containers, animations)
- `src/components/Background3D.tsx` - tło (jeśli chcesz)

---

## 🎯 TWO INTEGRATION OPTIONS

### ⚡ OPTION 1: QUICK (Recommended - 30 min)
**Dodaj tylko RAG + Quick Chat Bar do istniejącego ChatPanel**
- ✅ Reuse existing ChatPanel.tsx
- ✅ Add knowledge base (documentation files)
- ✅ Add ragService.ts for context retrieval
- ✅ Add quick chat bar to WelcomePage
- ✅ Use existing ZENO theme (no new styles)
- ❌ No separate /ai-assistant page
- ❌ No multi-modal features (image/audio)

**Best for**: Szybka integracja AI z wiedzą o projekcie

---

### 🚀 OPTION 2: FULL (Complete - 3 hours)
**Pełna integracja Gemini Multi-Modal Suite**
- ✅ Full /ai-assistant page
- ✅ Multi-modal (text, images, audio transcription)
- ✅ Multiple AI providers (Gemini + 8 OpenRouter models)
- ✅ RAG knowledge base integration
- ✅ Settings page for API keys
- ✅ Theme adapted to ZENO style
- ✅ Cloudflare Workers proxy
- ✅ Quick chat bar integration

**Best for**: Pełny AI assistant z wszystkimi funkcjami

---

## 🎯 Integration Phases (Option 2 - Full)

### Phase 0: **USE EXISTING THEME & ADD COMPACT CHAT BAR** ⭐
### Phase 1: Copy & Rename Core Components (with theme adaptation)
### Phase 2: RAG Integration - Connect with Application Knowledge Base
### Phase 3: Add Cloudflare Workers Integration
### Phase 4: Update Environment Variables
### Phase 5: Testing & Deployment

---

## ⭐ PHASE 0: Compact Chat Bar Integration (PRIORYTET!)

### Goal: Dodaj prosty pasek tekstowy na stronie głównej do szybkiego czatu

**File**: `src/components/WelcomePage.tsx`

**Dodaj na końcu komponentu** (przed `</div>` zamykającym):

```tsx
{/* ============ BONZO AI QUICK CHAT BAR ============ */}
<div style={{
  position: 'fixed',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '90%',
  maxWidth: '800px',
  zIndex: 9999,
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(10px)',
  border: '2px solid transparent',
  borderImage: 'linear-gradient(135deg, var(--primary-light), var(--secondary)) 1',
  padding: '16px',
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
}}>
  <div style={{ 
    fontSize: '24px',
    flexShrink: 0
  }}>
    🤖
  </div>
  
  <input
    type="text"
    placeholder="Ask BONZO AI anything about this app..."
    id="bonzo-quick-chat-input"
    style={{
      flex: 1,
      padding: '12px 16px',
      backgroundColor: 'transparent',
      border: '2px solid rgba(148, 163, 184, 0.3)',
      borderRadius: '0',
      color: 'var(--text)',
      fontSize: '14px',
      outline: 'none',
      transition: 'all 0.3s'
    }}
    onFocus={(e) => {
      e.currentTarget.style.borderColor = 'var(--primary-light)';
      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
      e.currentTarget.style.backgroundColor = 'transparent';
    }}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        const input = e.currentTarget;
        if (input.value.trim()) {
          // Navigate to full AI assistant with query
          const query = encodeURIComponent(input.value);
          window.location.href = `/ai-assistant?q=${query}`;
        }
      }
    }}
  />
  
  <button
    onClick={() => {
      const input = document.getElementById('bonzo-quick-chat-input') as HTMLInputElement;
      if (input?.value.trim()) {
        const query = encodeURIComponent(input.value);
        window.location.href = `/ai-assistant?q=${query}`;
      }
    }}
    style={{
      padding: '12px 24px',
      backgroundColor: 'transparent',
      border: '2px solid var(--primary-light)',
      color: 'var(--text)',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.3s',
      whiteSpace: 'nowrap'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.2)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    Ask AI
  </button>
  
  <button
    onClick={() => {
      window.location.href = '/ai-assistant';
    }}
    style={{
      padding: '12px',
      backgroundColor: 'transparent',
      border: '2px solid rgba(148, 163, 184, 0.3)',
      color: 'var(--text-muted)',
      cursor: 'pointer',
      fontSize: '12px',
      transition: 'all 0.3s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'var(--primary-light)';
      e.currentTarget.style.color = 'var(--text)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
      e.currentTarget.style.color = 'var(--text-muted)';
    }}
    title="Open full AI assistant"
  >
    ⚙️
  </button>
</div>
{/* ============ END BONZO AI QUICK CHAT BAR ============ */}
```

**Features paska szybkiego czatu**:
- ✅ Fixed position na dole ekranu
- ✅ Gradient border (niebieski→fioletowy)
- ✅ Enter key wysyła zapytanie
- ✅ Przekazuje query do `/ai-assistant?q=...`
- ✅ Przycisk ⚙️ otwiera pełny AI assistant
- ✅ Używa ZENO theme variables
- ✅ Przezroczyste tło z blur
- ✅ Hover effects

---

## 🧠 PHASE 2: RAG Integration - Knowledge Base Setup

### Cel: Dodaj pełną wiedzę o aplikacji do kontekstu AI

**RAG (Retrieval Augmented Generation)** = AI ma dostęp do dokumentów projektu

### Step 2.1: Create Knowledge Base Directory

```bash
New-Item -Path "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\public\knowledge-base" -ItemType Directory
```

### Step 2.2: Collect Application Documentation

**Skopiuj te pliki do knowledge-base/**:

```powershell
$kb = "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\public\knowledge-base"

# Main documentation
Copy-Item "V:\PROTO_TYpy\ZENO_web_CORE\README.md" "$kb\00_README.md"
Copy-Item "V:\PROTO_TYpy\ZENO_web_CORE\DEVELOPMENT_PLAN.md" "$kb\01_DEVELOPMENT_PLAN.md"
Copy-Item "V:\PROTO_TYpy\ZENO_web_CORE\VERSION_CONTROL_QUICKSTART.md" "$kb\02_VERSION_CONTROL.md"
Copy-Item "V:\PROTO_TYpy\ZENO_web_CORE\QUICK_IMPROVEMENTS.md" "$kb\03_QUICK_IMPROVEMENTS.md"
Copy-Item "V:\PROTO_TYpy\ZENO_web_CORE\.github\copilot-instructions.md" "$kb\04_COPILOT_INSTRUCTIONS.md"

# Component documentation
Copy-Item "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\src\docs\*.md" "$kb\" -Recurse

# API documentation (create if needed)
"# ZENO Browser API Reference

## Available Endpoints

### /api/iframe/sites
GET - List all iframe-testable sites
POST - Add new site

### /api/admin/sites
CRUD operations for site management

### MCP Tools
- web_search - Search the web
- content_analysis - Analyze page content
- bookmark_manager - Manage bookmarks
- page_summarizer - Summarize current page
- link_extractor - Extract links from page
- web_navigation - Navigate browser
" | Out-File "$kb\05_API_REFERENCE.md" -Encoding UTF8
```

### Step 2.3: Create RAG Service

**File**: `src/services/bonzo-ai/ragService.ts`

```typescript
export interface DocumentChunk {
  id: string;
  content: string;
  source: string;
  metadata?: Record<string, any>;
}

export class RAGService {
  private knowledgeBase: DocumentChunk[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Fetch all knowledge base documents
      const kbFiles = [
        '00_README.md',
        '01_DEVELOPMENT_PLAN.md',
        '02_VERSION_CONTROL.md',
        '03_QUICK_IMPROVEMENTS.md',
        '04_COPILOT_INSTRUCTIONS.md',
        '05_API_REFERENCE.md'
      ];

      for (const file of kbFiles) {
        try {
          const response = await fetch(`/knowledge-base/${file}`);
          if (response.ok) {
            const content = await response.text();
            
            // Split into chunks (max 2000 chars each)
            const chunks = this.splitIntoChunks(content, 2000);
            
            chunks.forEach((chunk, index) => {
              this.knowledgeBase.push({
                id: `${file}-chunk-${index}`,
                content: chunk,
                source: file,
                metadata: { chunkIndex: index, totalChunks: chunks.length }
              });
            });
          }
        } catch (err) {
          console.warn(`Failed to load ${file}:`, err);
        }
      }

      this.isInitialized = true;
      console.log(`RAG initialized with ${this.knowledgeBase.length} chunks`);
    } catch (error) {
      console.error('RAG initialization failed:', error);
    }
  }

  private splitIntoChunks(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split('\n\n');
    
    let currentChunk = '';
    
    for (const paragraph of paragraphs) {
      if ((currentChunk + paragraph).length > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // If single paragraph is too long, split it
        if (paragraph.length > maxChunkSize) {
          const words = paragraph.split(' ');
          let tempChunk = '';
          
          for (const word of words) {
            if ((tempChunk + word).length > maxChunkSize) {
              chunks.push(tempChunk.trim());
              tempChunk = word + ' ';
            } else {
              tempChunk += word + ' ';
            }
          }
          
          if (tempChunk) {
            currentChunk = tempChunk;
          }
        } else {
          currentChunk = paragraph + '\n\n';
        }
      } else {
        currentChunk += paragraph + '\n\n';
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  searchRelevantContext(query: string, maxResults: number = 3): DocumentChunk[] {
    if (!this.isInitialized) {
      console.warn('RAG not initialized');
      return [];
    }

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(' ').filter(w => w.length > 2);

    // Simple keyword-based search (można ulepszyć o embeddings)
    const scored = this.knowledgeBase.map(chunk => {
      const contentLower = chunk.content.toLowerCase();
      
      let score = 0;
      
      // Exact phrase match (highest score)
      if (contentLower.includes(queryLower)) {
        score += 100;
      }
      
      // Word matches
      queryWords.forEach(word => {
        const matches = (contentLower.match(new RegExp(word, 'g')) || []).length;
        score += matches * 10;
      });
      
      // Boost for certain source files
      if (chunk.source.includes('API_REFERENCE') && query.includes('api')) {
        score += 50;
      }
      if (chunk.source.includes('COPILOT_INSTRUCTIONS') && query.includes('how')) {
        score += 50;
      }
      
      return { chunk, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(s => s.chunk);
  }

  buildContextPrompt(query: string): string {
    const relevantDocs = this.searchRelevantContext(query, 3);
    
    if (relevantDocs.length === 0) {
      return `Question: ${query}\n\nNo specific documentation found. Use general knowledge.`;
    }

    const contextText = relevantDocs.map(doc => 
      `[From ${doc.source}]\n${doc.content}`
    ).join('\n\n---\n\n');

    return `You are BONZO AI, an assistant for the ZENO Browser application.

Context from documentation:
${contextText}

---

User question: ${query}

Answer based on the context above. If the context doesn't contain the answer, say so and provide general guidance.`;
  }
}

// Singleton instance
let ragInstance: RAGService | null = null;

export function getRAGService(): RAGService {
  if (!ragInstance) {
    ragInstance = new RAGService();
  }
  return ragInstance;
}
```

### Step 2.4: Update AI Assistant to Use RAG

**File**: `src/pages/ai-assistant.astro`

Dodaj inicjalizację RAG:

```astro
<script>
  import { createRoot } from 'react-dom/client';
  import { createElement } from 'react';
  import BonzoAiApp from '../components/bonzo-ai/BonzoAiApp';
  import { getRAGService } from '../services/bonzo-ai/ragService';

  document.addEventListener('DOMContentLoaded', async () => {
    // Initialize RAG knowledge base
    const rag = getRAGService();
    await rag.initialize();

    // Check for query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('q');

    const root = document.getElementById('bonzo-ai-root');
    if (!root) return;

    const reactRoot = createRoot(root);
    reactRoot.render(createElement(BonzoAiApp, { 
      initialQuery: initialQuery 
    }));
  });
</script>
```

### Step 2.5: Update BonzoChat to Use RAG Context

**File**: `src/components/bonzo-ai/BonzoChat.tsx`

Dodaj RAG context do wysyłanych wiadomości:

```tsx
import { getRAGService } from '../../services/bonzo-ai/ragService';

// ... w funkcji handleSubmit:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!input.trim() || isLoading) return;

  // ... existing code ...

  try {
    // NEW: Build RAG-enhanced prompt
    const rag = getRAGService();
    const enhancedPrompt = rag.buildContextPrompt(currentInput);

    const responseText = await aiService.getChatResponse(
      provider, 
      model, 
      messages, 
      enhancedPrompt,  // ← Use RAG context instead of raw input
      openRouterKey, 
      systemPrompt
    );
    
    // ... rest of code ...
  }
}
```

---

## 🎨 PHASE 1a: Theme Adaptation Checklist

### BEFORE copying any components, prepare theme conversion rules:

**1. Remove ALL Tailwind classes from copied files**
**2. Replace with inline styles using CSS variables**
**3. Copy hover/focus effects from existing ZENO components**

### Theme Conversion Reference Table:

| Original (Gemini Suite) | ZENO Replacement |
|------------------------|------------------|
| `bg-gray-900` | `backgroundColor: 'var(--background)'` |
| `bg-gray-800` | `backgroundColor: 'var(--surface)'` |
| `text-gray-100` | `color: 'var(--text)'` |
| `text-gray-400` | `color: 'var(--text-muted)'` |
| `border-gray-700` | `border: '2px solid var(--border)'` |
| `bg-indigo-600` | `backgroundColor: 'var(--primary)'` |
| `hover:bg-indigo-500` | Use onMouseEnter/onMouseLeave with `var(--primary-dark)` |
| `rounded-lg` | `borderRadius: '0'` (sharp corners!) |
| `shadow-xl` | `boxShadow: '0 10px 30px rgba(0,0,0,0.3)'` |

### Example Conversion:

**BEFORE** (Gemini Suite style):
```tsx
<button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition">
  Send
</button>
```

**AFTER** (ZENO style):
```tsx
<button
  style={{
    padding: '8px 16px',
    backgroundColor: 'var(--primary)',
    color: 'var(--text)',
    border: 'none',
    borderRadius: '0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'var(--primary)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  Send
</button>
```

**Transparent buttons** (jak na welcome page):
```tsx
<button
  style={{
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: '2px solid rgba(148, 163, 184, 0.3)',
    color: 'var(--text)',
    borderRadius: '0',
    cursor: 'pointer',
    transition: 'all 0.3s'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.backgroundColor = 'rgba(96, 165, 250, 0.2)';
    e.currentTarget.style.borderColor = 'var(--primary-light)';
    e.currentTarget.style.transform = 'translateY(-2px)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
    e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.3)';
    e.currentTarget.style.transform = 'translateY(0)';
  }}
>
  Action
</button>
```

---

## 📦 PHASE 1: Copy & Rename Components

### Step 1.1: Create Target Directory Structure

```bash
# Create directories
New-Item -Path "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\src\components\bonzo-ai" -ItemType Directory
New-Item -Path "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\src\components\bonzo-ai\icons" -ItemType Directory
New-Item -Path "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\src\services\bonzo-ai" -ItemType Directory
New-Item -Path "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\src\types\bonzo-ai" -ItemType Directory
```

### Step 1.2: Copy Component Files

**Copy these files** from `gemini-multi-modal-ai-suite/components/`:
```
Chat.tsx → src/components/bonzo-ai/BonzoChat.tsx
ImageAnalyzer.tsx → src/components/bonzo-ai/BonzoImageAnalyzer.tsx
Transcriber.tsx → src/components/bonzo-ai/BonzoTranscriber.tsx
Settings.tsx → src/components/bonzo-ai/BonzoSettings.tsx
Sidebar.tsx → src/components/bonzo-ai/BonzoSidebar.tsx
icons/* → src/components/bonzo-ai/icons/*
```

**PowerShell commands**:
```powershell
$source = "V:\PROTO_TYpy\ZENO_web_CORE\gemini-multi-modal-ai-suite\components"
$target = "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\src\components\bonzo-ai"

Copy-Item "$source\Chat.tsx" "$target\BonzoChat.tsx"
Copy-Item "$source\ImageAnalyzer.tsx" "$target\BonzoImageAnalyzer.tsx"
Copy-Item "$source\Transcriber.tsx" "$target\BonzoTranscriber.tsx"
Copy-Item "$source\Settings.tsx" "$target\BonzoSettings.tsx"
Copy-Item "$source\Sidebar.tsx" "$target\BonzoSidebar.tsx"
Copy-Item "$source\icons" "$target\icons" -Recurse
```

### Step 1.3: Copy Service Files

```powershell
$source = "V:\PROTO_TYpy\ZENO_web_CORE\gemini-multi-modal-ai-suite\services"
$target = "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\src\services\bonzo-ai"

Copy-Item "$source\geminiService.ts" "$target\bonzoAiService.ts"
```

### Step 1.4: Copy Type Definitions

```powershell
$source = "V:\PROTO_TYpy\ZENO_web_CORE\gemini-multi-modal-ai-suite\types.ts"
$target = "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\src\types\bonzo-ai\bonzoAi.types.ts"

Copy-Item $source $target
```

---

## 🔧 PHASE 2: Adapt for Astro Architecture

### Step 2.1: Create Astro Page

**File**: `src/pages/ai-assistant.astro`

```astro
---
import Layout from '../layouts/Layout.astro';
---

<Layout title="BONZO_AI_CHAT - AI Assistant" description="Multi-modal AI chat interface">
  <div id="bonzo-ai-root"></div>
</Layout>

<style is:global>
  #bonzo-ai-root {
    height: 100vh;
    overflow: hidden;
  }

  /* Import Tailwind if not already global */
  @import '../styles/global.css';
</style>

<script>
  import { createRoot } from 'react-dom/client';
  import { createElement } from 'react';
  import BonzoAiApp from '../components/bonzo-ai/BonzoAiApp';

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('bonzo-ai-root');
    if (!root) return;

    const reactRoot = createRoot(root);
    reactRoot.render(createElement(BonzoAiApp));
  });
</script>
```

### Step 2.2: ALTERNATIVE - Reuse Existing ChatPanel Component

**OPCJA A** (Szybsza): Użyj istniejącego `src/components/ChatPanel.tsx` i tylko dodaj RAG

**File**: `src/components/ChatPanel.tsx` (modify existing)

Dodaj RAG support do istniejącego chatu:

```tsx
// Na początku pliku
import { getRAGService } from '../services/bonzo-ai/ragService';

// W komponencie ChatPanel, w handleSendMessage:
const handleSendMessage = async () => {
  if (!inputValue.trim() || isLoading) return;

  const userMessage = inputValue.trim();
  setInputValue('');
  setIsLoading(true);

  // NEW: Add RAG context
  const rag = getRAGService();
  const enhancedPrompt = rag.buildContextPrompt(userMessage);

  try {
    const response = await sendMessageToAI(enhancedPrompt); // Use enhanced prompt
    // ... rest of existing code
  }
}
```

**OPCJA B** (Pełna): Stwórz nowy BonzoAiApp z pełnym UI

### Step 2.2b: Create Main React App Component (Full Version)

**File**: `src/components/bonzo-ai/BonzoAiApp.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { BonzoSidebar } from './BonzoSidebar';
import { BonzoChat } from './BonzoChat';
import { BonzoImageAnalyzer } from './BonzoImageAnalyzer';
import { BonzoTranscriber } from './BonzoTranscriber';
import { BonzoSettings } from './BonzoSettings';
import type { Mode } from '../../types/bonzo-ai/bonzoAi.types';

interface BonzoAiAppProps {
  initialQuery?: string | null;
}

const BonzoAiApp: React.FC<BonzoAiAppProps> = ({ initialQuery }) => {
  const [mode, setMode] = useState<Mode>('chat');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = localStorage.getItem('bonzo-ai-theme');
      return (storedTheme as 'light' | 'dark') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('bonzo-ai-theme', theme);
  }, [theme]);

  const renderContent = () => {
    switch (mode) {
      case 'chat':
        return <BonzoChat />;
      case 'image-analyzer':
        return <BonzoImageAnalyzer />;
      case 'transcriber':
        return <BonzoTranscriber />;
      case 'settings':
        return <BonzoSettings />;
      default:
        return <BonzoChat />;
    }
  };

  // Handle initial query from quick chat bar
  useEffect(() => {
    if (initialQuery) {
      // TODO: Pass to BonzoChat component to auto-send
      console.log('Initial query from quick chat:', initialQuery);
    }
  }, [initialQuery]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh',
      backgroundColor: 'var(--background)',
      color: 'var(--text)',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header with ZENO branding style */}
      <header style={{
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        color: 'white',
        padding: '16px 24px',
        borderBottom: '2px solid var(--primary-light)'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '800',
          letterSpacing: '0.05em',
          marginBottom: '4px'
        }}>
          🤖 BONZO_AI_CHAT
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'rgba(255, 255, 255, 0.9)',
          marginTop: '4px'
        }}>
          Multi-Modal AI Assistant with ZENO Browser Knowledge Base
        </p>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <BonzoSidebar activeMode={mode} setMode={setMode} theme={theme} setTheme={setTheme} />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default BonzoAiApp;
```

### Step 2.3: Update Import Paths in All Components

**In each copied component** (`BonzoChat.tsx`, `BonzoImageAnalyzer.tsx`, etc.):

**BEFORE**:
```typescript
import type { ChatMessage, Provider, Model } from '../types';
import * as aiService from '../services/geminiService';
import { SendIcon, UserIcon, BotIcon } from './icons/Icons';
```

**AFTER**:
```typescript
import type { ChatMessage, Provider, Model } from '../../types/bonzo-ai/bonzoAi.types';
import * as aiService from '../../services/bonzo-ai/bonzoAiService';
import { SendIcon, UserIcon, BotIcon } from './icons/Icons';
```

---

## ☁️ PHASE 3: Cloudflare Workers Integration

### Step 3.1: Create Cloudflare AI Proxy Worker

**File**: `src/pages/api/bonzo-ai/proxy.ts` (Astro API endpoint)

```typescript
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { provider, model, messages, systemPrompt, openRouterKey } = await request.json();

    // Get API keys from environment
    const geminiKey = import.meta.env.GEMINI_API_KEY;
    const openRouterDefaultKey = import.meta.env.OPENROUTER_API_KEY;

    if (provider === 'Gemini') {
      if (!geminiKey) {
        return new Response(JSON.stringify({ error: 'Gemini API key not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Forward to Gemini API via Google GenAI SDK (server-side)
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const chatOptions: any = {
        model: model,
        history: messages.map((msg: any) => ({
          role: msg.role,
          parts: msg.parts.map((p: any) => p.text)
        })),
      };

      const config: any = {};
      if (model === 'gemini-2.5-pro') {
        config.thinkingConfig = { thinkingBudget: 32768 };
      }
      if (systemPrompt?.trim()) {
        config.systemInstruction = systemPrompt;
      }

      if (Object.keys(config).length > 0) {
        chatOptions.config = config;
      }

      const chat = ai.chats.create(chatOptions);
      const response = await chat.sendMessage({ message: messages[messages.length - 1].parts[0].text });

      return new Response(JSON.stringify({ text: response.text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } else if (provider === 'OpenRouter') {
      const apiKey = openRouterKey || openRouterDefaultKey;

      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'OpenRouter API key not provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const formattedMessages: any[] = [];
      if (systemPrompt?.trim()) {
        formattedMessages.push({ role: "system", content: systemPrompt });
      }
      messages.forEach((msg: any) => {
        formattedMessages.push({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.parts[0].text
        });
      });

      const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": new URL(request.url).origin,
          "X-Title": "BONZO_AI_CHAT",
        },
        body: JSON.stringify({
          model: model,
          messages: formattedMessages,
        }),
      });

      if (!openRouterResponse.ok) {
        const errorData = await openRouterResponse.json();
        return new Response(JSON.stringify({ error: errorData?.error?.message || 'OpenRouter error' }), {
          status: openRouterResponse.status,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const data = await openRouterResponse.json();
      return new Response(JSON.stringify({ text: data.choices[0].message.content }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Bonzo AI Proxy error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### Step 3.2: Update `bonzoAiService.ts` to Use Proxy

**File**: `src/services/bonzo-ai/bonzoAiService.ts`

**REPLACE** direct API calls with proxy calls:

```typescript
// OLD (direct API call):
export const generateGeminiChatResponse = async (model: string, history: ChatMessage[], newMessage: string, systemPrompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set for Gemini...");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // ... rest of code
}

// NEW (via Cloudflare proxy):
export const generateGeminiChatResponse = async (model: string, history: ChatMessage[], newMessage: string, systemPrompt: string): Promise<string> => {
    const response = await fetch('/api/bonzo-ai/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            provider: 'Gemini',
            model,
            messages: [...history, { role: 'user', parts: [{ text: newMessage }] }],
            systemPrompt
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get Gemini response');
    }

    const data = await response.json();
    return data.text;
}

// Similar change for OpenRouter:
export const generateOpenRouterChatResponse = async (model: string, history: ChatMessage[], newMessage: string, apiKey: string, systemPrompt: string): Promise<string> => {
    const response = await fetch('/api/bonzo-ai/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            provider: 'OpenRouter',
            model,
            messages: [...history, { role: 'user', parts: [{ text: newMessage }] }],
            systemPrompt,
            openRouterKey: apiKey
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get OpenRouter response');
    }

    const data = await response.json();
    return data.text;
}
```

---

## 🔐 PHASE 4: Environment Variables

### Step 4.1: Update `.env` File

**File**: `ZENO_WEB_CORE_APP/.env`

Add these variables:

```env
# === BONZO AI CHAT Configuration ===
GEMINI_API_KEY=your_gemini_api_key_here
OPENROUTER_API_KEY=your_openrouter_key_here_optional

# Public URL for CORS (Cloudflare deployment)
PUBLIC_SITE_URL=https://zen-bro-wser.pages.dev
```

### Step 4.2: Cloudflare Pages Configuration

**In Cloudflare Dashboard** → Pages → Settings → Environment Variables:

```
GEMINI_API_KEY = sk-proj-xxx...
OPENROUTER_API_KEY = sk-or-xxx...
PUBLIC_SITE_URL = https://zen-bro-wser.pages.dev
```

### Step 4.3: Update `astro.config.mjs`

Add environment variable access:

```javascript
export default defineConfig({
  // ... existing config
  vite: {
    define: {
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
      'import.meta.env.OPENROUTER_API_KEY': JSON.stringify(process.env.OPENROUTER_API_KEY)
    }
  }
});
```

---

## 🧭 PHASE 5: Navigation & Integration

### Step 5.1: Add Link to Toolbar

**File**: `src/components/Toolbar.tsx`

Add button:

```tsx
<button
  onClick={() => {
    window.location.href = '/ai-assistant';
  }}
  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 transition-all"
  title="BONZO AI Chat"
>
  🤖 AI Assistant
</button>
```

### Step 5.2: Add to Main Browser Navigation

**File**: `src/components/Browser.tsx`

Add tab handling for AI assistant:

```tsx
const handleAiAssistantTab = () => {
  const aiTab = {
    id: 'ai-assistant-' + Date.now(),
    url: '/ai-assistant',
    title: 'BONZO AI CHAT',
    isLoading: false
  };
  setTabs([...tabs, aiTab]);
  setActiveTab(aiTab.id);
};
```

### Step 5.3: Update WelcomePage with AI Assistant Link

**File**: `src/components/WelcomePage.tsx`

Add button to quick links:

```tsx
<button
  onClick={() => {
    const event = new CustomEvent('navigate', { detail: { url: '/ai-assistant' } });
    window.dispatchEvent(event);
  }}
  style={{
    backgroundColor: 'transparent',
    color: 'white',
    padding: '12px',
    border: '2px solid rgba(148, 163, 184, 0.3)',
    borderRadius: '0',
    fontSize: '13px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.3s'
  }}
>
  🤖 BONZO AI Assistant
</button>
```

---

## 📦 PHASE 6: Dependencies

### Step 6.1: Install Required Packages

```bash
cd V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP

# Install @google/genai if not already installed
npm install @google/genai@^1.28.0

# Check if already installed (should be in existing project)
npm list react react-dom
```

### Step 6.2: Verify `package.json`

Ensure these are present:

```json
{
  "dependencies": {
    "@google/genai": "^1.28.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  }
}
```

---

## 🎨 PHASE 7: Branding & Customization

### Step 7.1: Update Chat Component Header

**File**: `src/components/bonzo-ai/BonzoChat.tsx`

**Change header title** (line ~97):

```tsx
// BEFORE:
<h2 className="text-xl font-semibold mr-4">Chat</h2>

// AFTER:
<h2 className="text-xl font-semibold mr-4">🤖 BONZO Chat</h2>
```

### Step 7.2: Update Sidebar Branding

**File**: `src/components/bonzo-ai/BonzoSidebar.tsx`

Add branding at top:

```tsx
<aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
    <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400">
      BONZO AI
    </h3>
    <p className="text-xs text-gray-500">Multi-Modal Assistant</p>
  </div>
  {/* ... rest of sidebar ... */}
</aside>
```

### Step 7.3: Custom Theme Colors

**File**: `src/styles/global.css`

Add BONZO AI specific variables:

```css
:root {
  /* Existing variables... */
  
  /* BONZO AI Theme */
  --bonzo-primary: #3b82f6;
  --bonzo-secondary: #8b5cf6;
  --bonzo-accent: #06b6d4;
  --bonzo-gradient: linear-gradient(135deg, #3b82f6, #8b5cf6);
}
```

---

## 🧪 PHASE 8: Testing & Verification

### Step 8.1: Test Checklist

```bash
# 1. Build test
cd V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP
npm run build

# 2. Dev test
npm run dev
```

**Then verify**:
- [ ] Navigate to `http://localhost:4321/ai-assistant`
- [ ] BONZO_AI_CHAT header displays correctly
- [ ] Gemini chat works (send "Hello" message)
- [ ] OpenRouter models load in dropdown
- [ ] Image analyzer accepts file uploads
- [ ] Settings page saves OpenRouter key to localStorage
- [ ] Theme toggle (light/dark) persists
- [ ] Navigation from main browser works

### Step 8.2: API Key Test

**Test Gemini**:
1. Open DevTools Console
2. Navigate to `/ai-assistant`
3. Send message: "What is 2+2?"
4. Check Network tab for `/api/bonzo-ai/proxy` call
5. Verify response contains "4"

**Test OpenRouter**:
1. Go to Settings
2. Add OpenRouter key
3. Switch to OpenRouter provider
4. Select "Mistral 7B Instruct (Free)"
5. Send message
6. Verify response

### Step 8.3: Cloudflare Deployment Test

```bash
# Deploy to Cloudflare Pages
npm run build
wrangler pages deploy dist --project-name=zen-bro-wser

# OR via GitHub Actions (automatic)
git add .
git commit -m "[FEATURE] Added BONZO_AI_CHAT - Multi-modal AI assistant"
git push
```

**Verify on production**:
- Navigate to `https://zen-bro-wser.pages.dev/ai-assistant`
- Test all features

---

## 🐛 Troubleshooting

### Issue 1: "API_KEY not defined" error

**Solution**: Update `bonzoAiService.ts` to remove `process.env.API_KEY` references (use proxy instead)

### Issue 2: CORS errors on Cloudflare

**Solution**: Add to `_headers` file:

```
/api/bonzo-ai/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type
```

### Issue 3: React not rendering

**Solution**: Check `astro.config.mjs` has `@astrojs/react` integration:

```javascript
export default defineConfig({
  integrations: [react()]
});
```

### Issue 4: Tailwind classes not applying

**Solution**: Ensure `tailwind.config.js` includes BONZO AI paths:

```javascript
module.exports = {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/components/bonzo-ai/**/*.{tsx,ts}' // ADD THIS
  ]
}
```

---

## 📊 Project Structure After Integration

```
ZENO_WEB_CORE_APP/
├── src/
│   ├── components/
│   │   ├── bonzo-ai/           ← NEW
│   │   │   ├── BonzoAiApp.tsx
│   │   │   ├── BonzoChat.tsx
│   │   │   ├── BonzoImageAnalyzer.tsx
│   │   │   ├── BonzoTranscriber.tsx
│   │   │   ├── BonzoSettings.tsx
│   │   │   ├── BonzoSidebar.tsx
│   │   │   └── icons/
│   │   ├── Browser.tsx
│   │   └── WelcomePage.tsx
│   ├── pages/
│   │   ├── ai-assistant.astro  ← NEW
│   │   ├── index.astro
│   │   └── api/
│   │       └── bonzo-ai/       ← NEW
│   │           └── proxy.ts
│   ├── services/
│   │   ├── bonzo-ai/           ← NEW
│   │   │   └── bonzoAiService.ts
│   │   └── aiProviders/
│   ├── types/
│   │   └── bonzo-ai/           ← NEW
│   │       └── bonzoAi.types.ts
│   └── styles/
│       └── global.css
├── .env
├── astro.config.mjs
└── package.json
```

---

## 🚀 SIMPLIFIED OPTION: Skip Full Integration, Just Add RAG to Existing Chat

**Jeśli chcesz TYLKO dodać wiedzę o aplikacji do istniejącego chatu**:

### Quick RAG-Only Setup (30 minut):

1. **Skopiuj knowledge base**:
```powershell
New-Item -Path "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\public\knowledge-base" -ItemType Directory
Copy-Item "V:\PROTO_TYpy\ZENO_web_CORE\*.md" "V:\PROTO_TYpy\ZENO_web_CORE\ZENO_WEB_CORE_APP\public\knowledge-base\"
```

2. **Stwórz ragService.ts** (kod powyżej w Phase 2.3)

3. **Zmodyfikuj istniejący ChatPanel.tsx**:
```tsx
import { getRAGService } from '../services/bonzo-ai/ragService';

// W useEffect na starcie:
useEffect(() => {
  const initRAG = async () => {
    const rag = getRAGService();
    await rag.initialize();
  };
  initRAG();
}, []);

// W handleSendMessage:
const rag = getRAGService();
const enhancedPrompt = rag.buildContextPrompt(userMessage);
// Use enhancedPrompt zamiast userMessage
```

4. **Dodaj quick chat bar do WelcomePage.tsx** (kod z Phase 0)

**GOTOWE!** Istniejący chat teraz ma dostęp do dokumentacji projektu.

---

## ✅ Final Checklist

Before marking complete:

- [ ] All files copied from `gemini-multi-modal-ai-suite/`
- [ ] All imports updated to new paths
- [ ] `BonzoAiApp.tsx` created with branding
- [ ] `/ai-assistant` Astro page created
- [ ] Cloudflare proxy endpoint created (`/api/bonzo-ai/proxy`)
- [ ] `bonzoAiService.ts` updated to use proxy
- [ ] Environment variables configured (`.env` + Cloudflare)
- [ ] Navigation added to Toolbar/Browser/WelcomePage
- [ ] Dependencies installed (`@google/genai`)
- [ ] Build successful (`npm run build`)
- [ ] Dev test passed (`npm run dev`)
- [ ] Cloudflare deployment tested
- [ ] Documentation updated

---

## 🚀 Post-Integration Enhancements (Optional)

1. **Add MCP Tool Integration**:
   - Connect to existing `mcpService.ts`
   - Allow BONZO AI to trigger browser tools (search, bookmarks, etc.)

2. **Add Session Persistence**:
   - Save chat history to Supabase
   - Sync across devices

3. **Add Voice Input**:
   - Use Web Speech API for voice commands

4. **Add Custom Models**:
   - Allow users to add their own API keys for other providers

5. **Add Analytics**:
   - Track model usage
   - Monitor response times

---

## 📝 Git Commit Template

```bash
git add .
git commit -m "[FEATURE] BONZO_AI_CHAT - Multi-modal AI assistant integration

- Copied Gemini Multi-Modal Suite components
- Renamed to BONZO_AI_CHAT branding
- Created /ai-assistant Astro page
- Added Cloudflare Workers proxy (/api/bonzo-ai/proxy)
- Updated service layer to use proxy (secure API keys)
- Added navigation links in Toolbar, Browser, WelcomePage
- Configured environment variables for Cloudflare Pages
- Supports Gemini & OpenRouter (8+ models)
- Features: Chat, Image Analysis, Audio Transcription, Settings
- Dark/Light theme support
- Mobile responsive

Testing:
- ✅ Local dev (npm run dev)
- ✅ Build successful (npm run build)
- ✅ Cloudflare deployment tested
- ✅ Gemini API working
- ✅ OpenRouter integration verified
"
git push
```

---

**Integration Time Estimate**: 
- Option 1 (Quick): 30 minutes
- Option 2 (Full): 2-3 hours

**Priority Level**: HIGH (adds major feature to ZENO Browser)  

**Complexity**: 
- Option 1: Low (just add RAG service + chat bar)
- Option 2: Medium (requires Astro + React + Cloudflare knowledge)

**Success Criteria**:

**Option 1 (Quick)**:
✅ Quick chat bar visible on main page  
✅ RAG service initialized with knowledge base  
✅ Existing ChatPanel uses RAG context  
✅ Queries about project answered correctly  

**Option 2 (Full)**:
✅ BONZO_AI_CHAT accessible at `/ai-assistant`  
✅ All original features working (chat, image, audio)  
✅ RAG knowledge base integrated  
✅ Cloudflare Workers proxy functioning  
✅ No API keys exposed in client-side code  
✅ Navigation from main browser working  
✅ ZENO theme applied consistently  
✅ Build and deploy successful

---

## 💡 Example Queries to Test RAG Integration

Po dodaniu RAG, użytkownik może zadawać pytania o projekt:

### Technical Questions:
- "How does the version control system work in ZENO?"
- "What MCP tools are available?"
- "How do I add a new iframe-testable site?"
- "Explain the Browser component architecture"
- "What's the difference between working/ and original/ folders?"

### API Questions:
- "Show me all available API endpoints"
- "How do I use the /api/iframe/sites endpoint?"
- "What parameters does the sites API accept?"

### Development Questions:
- "What are the quick improvements I can make?"
- "How do I deploy to Cloudflare Pages?"
- "What's the recommended workflow for editing components?"
- "How do I add a new AI provider?"

### Feature Questions:
- "What features are planned for ZENO Browser?"
- "How does the AI chat integration work?"
- "What browsers are tested with iframe support?"

**Expected Behavior**: 
AI powinna odpowiadać na podstawie dokumentacji z knowledge-base/ folder, cytując konkretne sekcje i podając dokładne instrukcje.

---

## 🔮 Future Enhancements (Post-Integration)

1. **Vector Embeddings**: Replace keyword search with semantic search using embeddings
2. **Live Code Analysis**: Add ability to analyze current codebase in real-time
3. **Auto-complete for Code**: Suggest code completions based on project patterns
4. **Issue Tracker Integration**: Connect with GitHub Issues for bug reporting
5. **Performance Monitoring**: Track AI response times and usage statistics
6. **Multi-language Support**: Add support for Polish/English documentation
7. **Voice Commands**: Integrate Web Speech API for voice queries
8. **Screenshot Analysis**: Use image analysis to debug UI issues
