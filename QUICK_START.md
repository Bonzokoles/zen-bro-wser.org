# 🚀 ZENO Browser - Quick Start Guide

> **Lokalizacja:** `U:\WWW_Zen_BRo_wser_org`  
> **Framework:** Astro + TypeScript + Cloudflare Workers  
> **Status:** ✅ Gotowy do uruchomienia

---

## 📋 Spis treści

- [Główna aplikacja ZENO](#główna-aplikacja-zeno)
- [CAYD Search Engine](#cayd-search-engine)
- [Bielik AI Agent](#bielik-ai-agent)
- [Cloudflare Tunnels](#cloudflare-tunnels)
- [Konfiguracja API Keys](#konfiguracja-api-keys)
- [Porty i adresy](#porty-i-adresy)

---

## 🌐 Główna aplikacja ZENO

### Uruchomienie

```powershell
cd U:\WWW_Zen_BRo_wser_org\ZENO_WEB_CORE_APP
npm run dev
```

**Adres:** http://localhost:4321

### Funkcje

- ✅ AI Browser z iframe
- ✅ Multi-provider Chat (Gemini, OpenAI, Claude, OpenRouter, Ollama)
- ✅ Admin Panel
- ✅ Analytics Dashboard
- ✅ MCP Tool Integration
- ✅ Video Player
- ✅ Music Player (Webamp)
- ✅ Widgets System
- ✅ Session Management
- ✅ Workspace Manager

### Główne endpointy

- `/` - Welcome Page
- `/admin` - Admin Panel
- `/admin-ai` - AI Model Manager
- `/agents` - Agents Status
- `/analytics` - Analytics Dashboard
- `/orchestrator` - Orchestrator Dashboard
- `/pricing` - Pricing Page
- `/contact` - Contact Form

---

## 🔍 CAYD Search Engine

### Komponenty

#### 1. Frontend (Astro)

```powershell
cd U:\WWW_Zen_BRo_wser_org\CAYD_SEARCH_ENG\frontend
npm install
npm run dev
```

**Adres:** http://localhost:5173  
**Funkcje:** Catalog Browser, Metadata Editor

#### 2. Browser UI (Vite + React)

```powershell
cd U:\WWW_Zen_BRo_wser_org\CAYD_SEARCH_ENG\cayd-browser-ui
npm install
npm run dev
```

**Adres:** http://localhost:5174  
**Funkcje:** Search interface, Results display

#### 3. Deep Search (Gemini)

```powershell
cd U:\WWW_Zen_BRo_wser_org\CAYD_SEARCH_ENG\jimbo_deep_sea_arch
npm install
npm run dev
```

**Funkcje:**
- AI-powered search
- Multi-language support (PL/EN)
- Export results (JSON, CSV, Markdown)
- Settings management

#### 4. Source Server (Node.js)

```powershell
cd U:\WWW_Zen_BRo_wser_org\CAYD_SEARCH_ENG\source
node server.js
```

**Port:** 3000  
**Funkcje:** Library catalog, File reader

---

## 🤖 Bielik AI Agent

### Business Orchestration Agent

```powershell
cd U:\WWW_Zen_BRo_wser_org\BIELIK_THE_whitie
npm install
npm run dev
```

**Funkcje:**
- Multi-model support (Bielik, Gemma, Ollama)
- MCP Server integration
- Cloudflare Worker adapter
- Task management
- Agent Manager
- Tool Factory

### Konfiguracja

Plik: `src/config/agents.config.ts`

```typescript
export const agentsConfig = {
  bielik: {
    modelProvider: 'ollama',
    modelName: 'bielik:11b',
    // ...
  }
}
```

---

## 🌍 Cloudflare Tunnels

### Setup (jednorazowo)

```powershell
cd U:\WWW_Zen_BRo_wser_org\config\cloudflare-tunnel
.\setup.ps1
```

### Uruchomienie tunnela

```powershell
.\start-tunnel.ps1
```

### Test połączenia

```powershell
.\test-tunnel.ps1
```

### Stop tunnela

```powershell
.\stop-tunnel.ps1
```

### Konfiguracja

Plik: `config.yml`

```yaml
tunnel: <TUNNEL_ID>
credentials-file: <CREDENTIALS_FILE>

ingress:
  - hostname: zeno-app.zen-bro-wser.org
    service: http://localhost:5173
  - hostname: api.zen-bro-wser.org
    service: http://localhost:8787
  - hostname: cayd.zen-bro-wser.org
    service: http://localhost:3000
  - service: http_status:404
```

---

## 🔑 Konfiguracja API Keys

### ZENO_WEB_CORE_APP

Utwórz plik `.env.local`:

```env
# Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# OpenRouter
OPENROUTER_API_KEY=your-openrouter-key

# Claude (Anthropic)
ANTHROPIC_API_KEY=your-claude-key

# Ollama (lokalny)
OLLAMA_BASE_URL=http://localhost:11434

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
```

### CAYD Deep Search

Plik: `jimbo_deep_sea_arch/.env`

```env
VITE_GEMINI_API_KEY=your-gemini-key
```

---

## 🌐 Porty i adresy

| Serwis | Port | Adres lokalny |
|--------|------|---------------|
| ZENO Web App | 4321 | http://localhost:4321 |
| CAYD Frontend | 5173 | http://localhost:5173 |
| CAYD Browser UI | 5174 | http://localhost:5174 |
| CAYD Source Server | 3000 | http://localhost:3000 |
| Cloudflare Worker | 8787 | http://localhost:8787 |
| Ollama | 11434 | http://localhost:11434 |

### Domeny produkcyjne (przez Cloudflare Tunnel)

- `zeno-app.zen-bro-wser.org` → CAYD Frontend (5173)
- `api.zen-bro-wser.org` → Cloudflare Worker (8787)
- `cayd.zen-bro-wser.org` → CAYD Source (3000)

---

## 🎯 Startup Script

### Uruchom wszystko jednym skryptem

```powershell
cd U:\WWW_Zen_BRo_wser_org\system_startup
.\start_zeno_with_cayd.bat
```

**Uruchamia:**
1. ZENO Web App (4321)
2. CAYD Frontend (5173)
3. CAYD Browser UI (5174)
4. CAYD Source Server (3000)

---

## 💡 Wskazówki

### Ollama (opcjonalnie)

Jeśli chcesz używać lokalnych modeli:

```powershell
# Zainstaluj Ollama
winget install Ollama.Ollama

# Uruchom serwis
ollama serve

# Pobierz modele
ollama pull gemma:2b
ollama pull bielik:11b
ollama pull llama3.2
```

### MCP Servers

Skonfiguruj MCP servers w pliku `.openmcp/config.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "U:\\Libraries"]
    }
  }
}
```

---

## 🐛 Troubleshooting

### Port zajęty?

```powershell
# Sprawdź co używa portu 4321
netstat -ano | findstr :4321

# Zabij proces (zastąp PID)
taskkill /PID <PID> /F
```

### Node modules problem?

```powershell
# Usuń i przeinstaluj
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```

### Ollama nie działa?

```powershell
# Sprawdź status
ollama list

# Restart serwisu
ollama serve
```

---

## 📚 Dokumentacja

- [README.md](../README.md) - Główny README
- [DOCUMENTS_ALL/](../DOCUMENTS_ALL/) - Pełna dokumentacja
- [PROJECT_STRUCTURE.md](../DOCUMENTS_ALL/PROJECT_STRUCTURE.md) - Struktura projektu
- [API_CONFIGURATION_GUIDE.md](../DOCUMENTS_ALL/API_CONFIGURATION_GUIDE.md) - API Guide

---

## 🎉 Gotowe!

Wszystkie komponenty ZENO Browser są gotowe do uruchomienia.

**Rozpocznij od:**
```powershell
cd U:\WWW_Zen_BRo_wser_org\ZENO_WEB_CORE_APP
npm run dev
```

**Otwórz:** http://localhost:4321

---

**Utworzono:** 10 lutego 2026  
**Workspace:** U:\JIMBO_MASTER_WORKSPACE.code-workspace
