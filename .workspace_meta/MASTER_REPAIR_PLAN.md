# 🗺️ MASTER REPAIR PLAN — ZENO Browser (K.R.A.F.T. v3)

**Wygenerowano**: 2026-03-14  
**Agent**: Plan Mode - Strategic Planning & Architecture  
**Źródła**: NEWfiles/ + .workspace_meta/ToDo/ + .workspace_meta/ADDTHISfiles/  
**Status**: GOTOWY DO WYKONANIA

---

## 📊 STAN OBECNY (audyt przed naprawą)

### Co już działa w root `src-electron/`
```
✅ main.ts           — Pełny, importuje 11 serwisów
✅ preload.ts        — Bezpieczny most IPC
✅ services/         — 13 serwisów (WebCrawler, LocalLibrary, MCP, CloudflareTunnel, itp.)
```

### Co jest w NEWfiles (do dointegrowania)
```
🆕 src/components/   — 12 nowych komponentów React (BrowserUI, AIPanel, TabBar,
                        AddressBar, SecurityMonitor, CloudflareTunnelPanel,
                        PluginManager, PluginInstaller, PluginExplorer,
                        UpdateNotification + CSS)
🆕 src/services/     — ai-gateway/ (providers: deepseek, edenai, openrouter)
                     — security/browser-sandbox.ts
🆕 src/plugin-system/ — core/ + marketplace/
🆕 src/styles/themes/ — design tokens (Glassmorphism)
🆕 src/__tests__/    — testy jednostkowe
🆕 docs/             — AI_GATEWAY_SETUP, ELECTRON_SETUP, PLUGIN_SYSTEM, ...
🆕 package.json      — nowe devDep: concurrently, wait-on, zustand, uuid, lru-cache
```

### Co jest w ZENO_WEB_CORE_APP (aktualny frontend)
```
⚠️  Astro 5 + React 18 — działa jako web app
⚠️  src/active/ system  — trzy-folderowy workflow
⚠️  Brak połączenia z Electron IPC
```

### Problemy do naprawy (z ToDo i ADDTHISfiles)
```
🔴 Secrets w .env.local (nie w bezpiecznym miejscu)
🔴 Brak UI Integration — Electron nie ładuje ZENO_WEB_CORE_APP
🔴 Cache System dla AI Gateway — brak implementacji
🔴 Vector Memory — brak integracji ChromaDB/Supabase
🔴 Plugin System — zdefiniowany ale nie podpięty do UI
🔴 Terminal Console — projekt gotowy ale nie dodany do komponentów
🔴 Project Config — nieujednolicony (root vs ZENO_WEB_CORE_APP)
```

---

## 🚦 PLAN NAPRAWY — 8 FAZY (slow & safe)

---

### 🔵 FAZA 0 — PRZYGOTOWANIE (brak ryzyka, ~30 min)
> Zebieramy i porządkujemy zasoby bez edycji kodu.

**KROK 0.1** — Skopiuj nowe komponenty do staging
```
NEWfiles/src/components/     → .workspace_meta/staging/components/
NEWfiles/src/services/       → .workspace_meta/staging/services/
NEWfiles/src/plugin-system/  → .workspace_meta/staging/plugin-system/
NEWfiles/src-electron/services/ → (porównaj z root src-electron/services/)
```

**KROK 0.2** — Zrób backup aktualnych krytycznych plików
```
src-electron/main.ts         → .workspace_meta/History/pre-kraft3/
ZENO_WEB_CORE_APP/src/       → .workspace_meta/History/pre-kraft3/
package.json (root)          → .workspace_meta/History/pre-kraft3/
```

**KROK 0.3** — Przenieś secrets
```
ZENO_WEB_CORE_APP/.env.local → .workspace_meta/secrets/.env
Dodaj do .gitignore: .workspace_meta/secrets/
```

**Ryzyko**: ZERO — tylko kopiowanie  
**Weryfikacja**: `Get-ChildItem .workspace_meta\staging` pokazuje pliki

---

### 🔵 FAZA 1 — ELECTRON FOUNDATION (niskie ryzyko, ~1h)
> Upewniamy się że Electron uruchamia frontend prawidłowo.

**KROK 1.1** — Dodaj zależności z NEWfiles/package.json do root package.json
```json
// Dodaj do dependencies:
"zustand": "^4.4.1",
"uuid": "^9.0.0",
"lru-cache": "^10.1.0",

// Dodaj do devDependencies:
"concurrently": "^8.2.2",
"wait-on": "^7.1.0"
```
Testu: `npm install` w root

**KROK 1.2** — Napraw skrypt "dev" w root package.json
```json
// Zmień scripts.dev na:
"dev": "concurrently \"vite\" \"wait-on http://localhost:5173 && electron .\""
```

**KROK 1.3** — UI Integration w main.ts
```typescript
// W createWindow() zmień loadURL na:
if (isDev) {
  mainWindow.loadURL('http://localhost:5173');
} else {
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}
```
*Plik do edycji*: `src-electron/main.ts` (linia ~50, szukaj loadURL/loadFile)

**KROK 1.4** — sprawdź czy Vite jest skonfigurowany
```
Plik: vite.config.ts lub vite.config.js (jeśli brak — stworzyć)
Musi exportować config z react() plugin i base: './'
```

**Ryzyko**: NISKIE — devMode tylko  
**Weryfikacja**: `npm run dev` uruchamia Electron z UI

---

### 🔵 FAZA 2 — NOWE KOMPONENTY REACT (średnie ryzyko, ~2h)
> Integrujemy nowe komponenty z NEWfiles do istniejącego UI.

**Kolejność integracji** (od najłatwiejszych):

**KROK 2.1** — AddressBar.tsx
```
Źródło: NEWfiles/src/components/AddressBar.tsx
Cel: ZENO_WEB_CORE_APP/src/working/components/AddressBar.tsx
Workflow: dev:copy → edytuj → validate → merge
```

**KROK 2.2** — TabBar.tsx
```
Źródło: NEWfiles/src/components/TabBar.tsx
Cel: ZENO_WEB_CORE_APP/src/working/components/TabBar.tsx
Uwaga: Wymaga electronAPI.browser.getTabs() — IPC gotowy w preload.ts
```

**KROK 2.3** — SecurityMonitor.tsx
```
Źródło: NEWfiles/src/components/SecurityMonitor.tsx
Cel: ZENO_WEB_CORE_APP/src/working/components/SecurityMonitor.tsx
```

**KROK 2.4** — AIPanel.tsx
```
Źródło: NEWfiles/src/components/AIPanel.tsx
Cel: ZENO_WEB_CORE_APP/src/working/components/AIPanel.tsx
Uwaga: Musi być przepięty z nowego AIGateway (FAZA 3)
```

**KROK 2.5** — BrowserUI.tsx (główny shell)
```
Źródło: NEWfiles/src/components/BrowserUI.tsx
Cel: ZENO_WEB_CORE_APP/src/working/components/BrowserUI.tsx
Uwaga: Składa razem AddressBar + TabBar + AIPanel + SecurityMonitor
Uruchomić DOPIERO po KROK 2.1-2.4
```

**KROK 2.6** — UpdateNotification.tsx + UpdateNotification.css
**KROK 2.7** — CloudflareTunnelPanel.tsx + CSS
**KROK 2.8** — PluginExplorer.tsx, PluginInstaller.tsx, PluginManager.tsx

**Ryzyko**: ŚREDNIE — każdy komponent osobno, rollback łatwy  
**Weryfikacja**: TypeScript compile bez błędów po każdym kroku

---

### 🔵 FAZA 3 — AI GATEWAY (krytyczne, ~2h)
> Podłączamy nowych providerów AI (DeepSeek, EdenAI, OpenRouter).

**KROK 3.1** — Skopiuj strukturę ai-gateway
```
NEWfiles/src/services/ai-gateway/providers/deepseek.ts  → src/services/ai-gateway/providers/
NEWfiles/src/services/ai-gateway/providers/edenai.ts    → src/services/ai-gateway/providers/
NEWfiles/src/services/ai-gateway/providers/openrouter.ts → src/services/ai-gateway/providers/
NEWfiles/src/services/ai-gateway/gateway.ts             → src/services/ai-gateway/gateway.ts
NEWfiles/src/services/ai-gateway/index.ts               → src/services/ai-gateway/index.ts
```

**KROK 3.2** — Zweryfikuj AIGatewayService w src-electron
```
Plik: src-electron/services/ai-gateway-service.ts
Sprawdź czy importuje gateway.ts z nowych providerów
Jeśli nie — podmień logikę routingu
```

**KROK 3.3** — Implementacja Cache System (z TODO)
```typescript
// W gateway.ts dodaj prosty LRU cache:
import { LRUCache } from 'lru-cache';
const cache = new LRUCache<string, string>({ max: 100, ttl: 1000 * 60 * 10 }); // 10min TTL
```

**KROK 3.4** — Podpięcie do AIPanel.tsx (z FAZY 2)
```
AIPanel wywołuje: window.electronAPI.ai.complete(prompt, model)
IPC handler w main.ts przekazuje do AIGatewayService
```

**Ryzyko**: ŚREDNIE — stare providery można zachować równolegle  
**Weryfikacja**: Wywołanie AI z UI zwraca odpowiedź

---

### 🔵 FAZA 4 — PLUGIN SYSTEM (wydłużone, ~3h)
> Integracja systemu pluginów z NEWfiles.

**KROK 4.1** — Skopiuj plugin-system
```
NEWfiles/src/plugin-system/core/       → src/plugin-system/core/
NEWfiles/src/plugin-system/marketplace/ → src/plugin-system/marketplace/
```

**KROK 4.2** — IPC bridge dla pluginów
```
Plik: src-electron/services/plugin-ipc-bridge.ts (już istnieje!)
Sprawdź czy main.ts rejestruje handlery z plugin-ipc-bridge
```

**KROK 4.3** — Integracja PluginManager.tsx z UI (BrowserUI.tsx)

**KROK 4.4** — Testy unit pluginów
```
NEWfiles/src/__tests__/     → src/__tests__/
```

**Ryzyko**: NISKIE — pluginy są izolowane, nie psują reszty  
**Weryfikacja**: PluginManager wyświetla listę, można zainstalować przykładowy plugin

---

### 🔵 FAZA 5 — MCP SERVER (zaawansowane, ~4h)
> Wdrożenie kompletnego serwera MCP per ADDTHISfiles/MCP_SERVER_ARCHITECTURE.md.

**KROK 5.1** — Stwórz strukturę
```
src-electron/mcp-server/
├── core/
│   └── mcp-server.ts   (z ADDTHISfiles/MCP_SERVER_ARCHITECTURE.md)
├── tools/
│   ├── web-search.ts
│   ├── browser-automation.ts
│   ├── data-extraction.ts
│   └── workflow-control.ts
└── start.js
```

**KROK 5.2** — Sprawdź MCPClientService
```
Plik: src-electron/services/mcp-client.service.ts (już istnieje!)
Przejrzyj czy implementuje wszystkie 20+ toolsów z architecture doc
```

**KROK 5.3** — Rejestracja w main.ts
```typescript
// Dodaj do createWindow() lub app.whenReady():
mcpClient = new MCPClientService();
await mcpClient.start();
```

**Ryzyko**: NISKIE — MCP działa jako osobny serwer  
**Weryfikacja**: `npm run mcp:start` zwraca listę toolsów

---

### 🔵 FAZA 6 — TERMINAL CONSOLE (UI, ~2h)
> Integracja per ADDTHISfiles/TERMINAL_CONSOLE_INTEGRATION_Version1.md.

**KROK 6.1** — Instalacja biblioteki
```bash
npm install react-terminal-ui
```

**KROK 6.2** — Stwórz TerminalPanel.tsx
```
Wzorzec: .workspace_meta/ToDo/TERMINAL_CONSOLE_INTEGRATION_Version1.md
Lokalizacja: ZENO_WEB_CORE_APP/src/working/components/TerminalPanel.tsx
```

**KROK 6.3** — Podpięcie komend do serwisów
```
help, info, echo          → lokalne
navigate <url>            → electronAPI.browser.navigate()
screenshot                → electronAPI.browser.screenshot()
crawl <url>               → electronAPI.crawler.start()
ai <prompt>               → electronAPI.ai.complete()
tunnel start/stop         → electronAPI.tunnel.toggle()
plugin list/install       → electronAPI.plugins.list()
```

**KROK 6.4** — Toggle button w BrowserUI.tsx (lewy dolny róg)

**Ryzyko**: NISKIE — izolowany komponent  
**Weryfikacja**: Terminal otwiera się, `help` wyświetla komendy

---

### 🔵 FAZA 7 — SECURITY & SECRETS (bezpieczeństwo, ~1h)
> Porządek z kluczami API i uprawnieniami.

**KROK 7.1** — Secrets relokacja (z FAZY 0.3 — formalizuj)
```
Plik: .workspace_meta/secrets/.env
Format: KEY=value (jeden per linia)
Dodaj do .gitignore: .workspace_meta/secrets/
```

**KROK 7.2** — Electron security audit
```
Sprawdź src-electron/services/security-sandbox.ts
Upewnij się że contextIsolation: true, nodeIntegration: false w main.ts
```

**KROK 7.3** — NEWfiles/src/services/security/browser-sandbox.ts
```
Skopiuj do src/services/security/browser-sandbox.ts
Zaimportuj w BrowserUI.tsx
```

**KROK 7.4** — Usuń hardcoded klucze z kodu
```bash
# Sprawdź grep
grep -r "sk-" src/ --include="*.ts" --include="*.tsx"
grep -r "tvly-" src/ --include="*.ts"
```

**Ryzyko**: WYSOKIE jeśli pominięte — NISKIE dla projektu jeśli zrobione  
**Weryfikacja**: Brak kluczy w kodzie, aplikacja działa z .env

---

### 🔵 FAZA 8 — BUILD & DEPLOY (finał, ~2h)
> Weryfikacja całości i przygotowanie do dystrybucji.

**KROK 8.1** — TypeScript full compile
```bash
npx tsc --noEmit
```
Napraw wszystkie błędy przed kontynuowaniem.

**KROK 8.2** — README.md update
```
Dodaj sekcję: Electron Quick Start
Dodaj sekcję: API Keys setup (.workspace_meta/secrets/.env)
```

**KROK 8.3** — Test build
```bash
npm run build
```

**KROK 8.4** — Electron distributor (opcjonalnie)
```bash
npm run dist:win   # Windows NSIS installer
```

**Ryzyko**: NISKIE — tylko weryfikacja  
**Weryfikacja**: dist/ zawiera działający installer

---

## ⏱️ HARMONOGRAM PRACY

| Faza | Czas szacowany | Ryzyko | Zależy od |
|------|---------------|--------|-----------|
| FAZA 0 — Przygotowanie | 30 min | ZERO | — |
| FAZA 1 — Electron Foundation | 1h | NISKIE | FAZA 0 |
| FAZA 2 — Komponenty React | 2h | ŚREDNIE | FAZA 1 |
| FAZA 3 — AI Gateway | 2h | ŚREDNIE | FAZA 2 |
| FAZA 4 — Plugin System | 3h | NISKIE | FAZA 2 |
| FAZA 5 — MCP Server | 4h | NISKIE | FAZA 3 |
| FAZA 6 — Terminal Console | 2h | NISKIE | FAZA 2 |
| FAZA 7 — Security | 1h | WYSOKIE | FAZA 3 |
| FAZA 8 — Build & Deploy | 2h | NISKIE | FAZA 1-7 |
| **RAZEM** | **~17h** | — | — |

---

## 🗂️ MAPA PLIKÓW (co → gdzie)

```
NEWfiles/src/components/AddressBar.tsx          → ZENO_WEB_CORE_APP/src/working/components/
NEWfiles/src/components/AIPanel.tsx             → ZENO_WEB_CORE_APP/src/working/components/
NEWfiles/src/components/BrowserUI.tsx           → ZENO_WEB_CORE_APP/src/working/components/
NEWfiles/src/components/CloudflareTunnelPanel.* → ZENO_WEB_CORE_APP/src/working/components/
NEWfiles/src/components/PluginExplorer.tsx      → ZENO_WEB_CORE_APP/src/working/components/
NEWfiles/src/components/PluginInstaller.tsx     → ZENO_WEB_CORE_APP/src/working/components/
NEWfiles/src/components/PluginManager.tsx       → ZENO_WEB_CORE_APP/src/working/components/
NEWfiles/src/components/SecurityMonitor.tsx     → ZENO_WEB_CORE_APP/src/working/components/
NEWfiles/src/components/TabBar.tsx              → ZENO_WEB_CORE_APP/src/working/components/
NEWfiles/src/components/UpdateNotification.*    → ZENO_WEB_CORE_APP/src/working/components/

NEWfiles/src/services/ai-gateway/providers/*   → src/services/ai-gateway/providers/
NEWfiles/src/services/ai-gateway/gateway.ts    → src/services/ai-gateway/gateway.ts
NEWfiles/src/services/security/browser-sandbox → src/services/security/

NEWfiles/src/plugin-system/core/*              → src/plugin-system/core/
NEWfiles/src/plugin-system/marketplace/*       → src/plugin-system/marketplace/

NEWfiles/src/__tests__/*                       → src/__tests__/

NEWfiles/docs/*                                → docs/  (merge, nie nadpisuj)

(NOWE) src/components/TerminalPanel.tsx        → stworzyć na podstawie ToDo instrukcji
(NOWE) src-electron/mcp-server/core/           → stworzyć na podstawie ADDTHISfiles instrukcji
```

---

## ⚠️ OSTRZEŻENIA & PUŁAPKI

1. **NEWfiles/src-electron/main.ts** — Jest STARSZĄ wersją niż root `src-electron/main.ts`.
   NIE nadpisuj root main.ts plikiem z NEWfiles!

2. **NEWfiles/src-electron/services/** — Zawiera 8 serwisów vs 13 w root.
   Root jest bardziej kompletny — pomiń kopiowanie src-electron z NEWfiles.

3. **ZENO_WEB_CORE_APP workflow** — Pamiętaj: edytuj w `working/`, nie w `original/`.
   Użyj `npm run dev:copy` i `npm run dev:use-working` przed każdą edycją komponentu.

4. **Electron IPC** — BrowserUI.tsx używa `window.electronAPI.*` — to musi być
   zdefiniowane w `src-electron/preload.ts`. Sprawdź exposedInMainWorld.

5. **Import paths** — NEWfiles importuje `from 'electron-is-dev'` jako ES module.
   Root używa `require()`. Ujednolicić w FAZIE 1.

---

## 📁 ZEBRANE ZASOBY (do jednego folderu referencyjnego)

Wszystkie instrukcje są dostępne w:
```
.workspace_meta/ToDo/           — 8 plików planowania
.workspace_meta/ADDTHISfiles/  — 11 plików implementacji
NEWfiles/docs/                  — 5 przewodników (Electron, AI, Plugin, Podman, CF)
```

Nie kopiuję ich do osobnego folderu — są już logicznie pogrupowane.
Używaj `.workspace_meta/MASTER_REPAIR_PLAN.md` (ten plik) jako nawigacji.

---

## ✅ DEFINITION OF DONE

Projekt jest gotowy gdy:
- [ ] `npm run dev` uruchamia Electron z ZENO UI
- [ ] BrowserUI.tsx wyświetla TabBar + AddressBar + AIPanel
- [ ] AI Gateway odpowiada przez AIPanel (DeepSeek lub OpenRouter)
- [ ] Plugin Manager wyświetla listę
- [ ] Terminal Console otwiera się i `help` działa
- [ ] CloudflareTunnelPanel połączony z daemon
- [ ] `npx tsc --noEmit` — 0 błędów
- [ ] Brak kluczy API w repozytorium git
- [ ] `npm run dist:win` buduje installer

---

*Plan stworzony przez: Plan Mode (plan.agent.md) | KRAFT v3 | 2026-03-14*
