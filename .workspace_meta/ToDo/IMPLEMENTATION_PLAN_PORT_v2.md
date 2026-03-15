# IMPLEMENTATION PLAN PORT v2 — ZENO Browser
**Data:** 2026-03-15  
**Gałąź:** `copilot/create-zip-archive-zc-browser-v0-2-0`  
**PR aktywny:** feat: ZENO Browser v0.2.0 — https://github.com/Bonzokoles/zen-bro-wser.org/pull/14  
**Autor planu:** Context Architect (GitHub Copilot)

---

## 🗺️ MAPA APLIKACJI — Stan na 2026-03-15

### Struktura katalogów (3 warstwy kodu)

```
U:\WWW_Zen_BRo_wser_org\
├── src\active\                        ← ROOT (starszy stan kodu)
├── ZENO_WEB_CORE_APP\src\active\      ← SUB-APP (nowszy stan, źródło prawdy)
├── ZENO_WEB_CORE_APP\src\working\     ← Development copies
├── ZENO_WEB_CORE_APP\src\original\    ← Production snapshots (read-only)
├── NEWfiles\src\components\           ← Nowe komponenty czekające na integrację
├── src-electron\                      ← Electron main/preload
└── .workspace_meta\                   ← Dokumentacja projektu
```

---

## 📊 MAPA KOMPONENTÓW (SUB-APP — stan rzeczywisty)

### `ZENO_WEB_CORE_APP/src/active/components/`

| Plik | Status TS | Uwagi |
|------|-----------|-------|
| `FloatingWindow.tsx` | ⚠️ 2 błędy | windowState comparison logic bug |
| `ChatPanel.tsx` | ⚠️ 1 błąd | `content: null` vs `undefined` mismatch |
| `LocalLibrarySearch.tsx` | ❌ 3 błędy | brakujące `useState(iframeLoaded)` |
| `MusicPlayer.tsx` | ❌ 7 błędów | brakujące `useState(currentSkin, showSkinSelector)` |
| `LocalChatbot.tsx` | ✅ OK | |
| `MCPConsole.tsx` | ✅ OK | |
| `OmniSearch.tsx` | ✅ OK | |
| `ReaderMode.tsx` | ✅ OK | |
| `SessionManager.tsx` | ✅ OK | |
| `DownloadManager.tsx` | ✅ OK | |

### `ZENO_WEB_CORE_APP/src/active/services/`

| Plik | Status TS | Uwagi |
|------|-----------|-------|
| `mcpService.ts` | ❌ 13 błędów | ClaudeProvider brak 4 metod (testConnection, executeMCPCommand, analyzeWebContent, clearChatHistory) |
| `aiProviders/gemini.ts` | ❌ 5 błędów | `error: unknown` + `config.model` optional |
| `omnisearch.ts` | ✅ OK | |
| `workspace-manager.ts` | ✅ OK | |

### `ZENO_WEB_CORE_APP/src/working/components/` (bez błędów)
- `Browser.tsx`, `BrowserUI.tsx`, `PluginExplorer.tsx`, `PluginInstaller.tsx`

### `ZENO_WEB_CORE_APP/src/components/` (nie-active, bez błędów)
- `Browser.tsx`, `ChatPanel.tsx`, `IframeWindowManager.tsx`, `AIModelManager.tsx`
- `MusicPlayer.tsx`, `ProviderSettings.tsx`, `UpgradePrompt.tsx`, `PricingCard.tsx`, `ErrorBoundary.tsx`

### `src-electron/`
- `services/security-sandbox.ts` ✅

---

## 🔄 DIFF: SUB-APP vs ROOT

| Element | SUB-APP `ZENO_WEB_CORE_APP/src/active/` | ROOT `src/active/` |
|---------|----------------------------------------|---------------------|
| `FloatingWindow.tsx` | ✅ ISTNIEJE (children/icon/zIndex/url) | ❓ wymaga weryfikacji |
| `useWindowManager.ts` | ❓ do weryfikacji | ❌ PRAWDOPODOBNY BRAK |
| `FeatureDock.tsx` | ❓ do weryfikacji | ❌ PRAWDOPODOBNY BRAK |
| `ChatPanel embedded prop` | ❓ do weryfikacji | ❌ PRAWDOPODOBNY BRAK |
| `mcpService.ts (working)` | ✅ `src/working/` bez błędów | — |

**Komenda weryfikacji DIFF:**
```powershell
Get-ChildItem ZENO_WEB_CORE_APP\src\active\components | 
  Compare-Object (Get-ChildItem src\active\components) -Property Name
```

---

## ⚠️ KRYTYCZNE BŁĘDY TS (20 błędów w 4 plikach — BLOKER BUILDU)

```
mcpService.ts         — 13 błędów: ClaudeProvider bez 4 wymaganych metod + duplicate exports
gemini.ts             — 5 błędów: error: unknown + config.model optional
LocalLibrarySearch    — 3 błędy: brakujące useState(iframeLoaded)
MusicPlayer.tsx       — 7 błędów: brakujące useState(currentSkin, showSkinSelector)
ChatPanel.tsx         — 1 błąd: content null vs undefined
```

---

## 📋 STAN FAZY 1 z MASTER_REPAIR_PLAN

| KROK | Zadanie | Status |
|------|---------|--------|
| 1.1 | Dodaj `zustand`, `uuid`, `lru-cache`, `concurrently`, `wait-on` | 🟡 lru-cache obecny (via astro), reszta do sprawdzenia |
| 1.2 | `scripts.dev` → `concurrently astro + electron` | ❓ nieznany — wymaga weryfikacji |
| 1.3 | `src-electron/main.ts createWindow()` loadURL/loadFile fix | ❓ nieznany — wymaga weryfikacji |
| 1.4 | `vite.config.ts` z react() + `base: './'` | ❓ Astro używa port 4378 — `astro.config.mjs` jest źródłem prawdy |

**Komendy weryfikacji:**
```powershell
# KROK 1.1
cat package.json | Select-String "concurrently|zustand|uuid|lru-cache|wait-on"

# KROK 1.2
cat package.json | Select-String '"dev"'

# KROK 1.3
cat src-electron\main.ts | Select-String "loadURL|loadFile|isDev"

# KROK 1.4
Test-Path astro.config.mjs
cat astro.config.mjs | Select-String "port|server"
```

---

## 🚀 PLAN WYKONANIA

---

### FAZA 0 — WERYFIKACJA STANU (30 min)
> Sprawdź rzeczywisty stan przed edycją

**0.1** — Uruchom komendy DIFF z sekcji powyżej  
**0.2** — Uruchom komendy weryfikacji FAZY 1  
**0.3** — Zanotuj wyniki w tej sekcji (nadpisz ❓ na ✅ lub ❌)

---

### FAZA 1B — NAPRAWA BŁĘDÓW TS (2h) ← **PRIORYTET — BLOKER BUILDU**
> Napraw 20 błędów PRZED portowaniem komponentów

#### 1B.1 — ClaudeProvider — implementacja stub methods

**Plik:** `ZENO_WEB_CORE_APP/src/active/services/aiProviders/claude.ts`  
**Dodaj 4 metody** (skopiuj sygnatury z GeminiProvider):

```typescript
async testConnection(): Promise<boolean> {
  // TODO: implement — zwróć false jako safe default
  return false;
}

async executeMCPCommand(command: string, tools: MCPTool[]): Promise<MCPResponse> {
  // TODO: implement Claude MCP execution
  return { success: false, error: 'Claude MCP not implemented yet' };
}

async analyzeWebContent(url: string, content: string): Promise<string> {
  // TODO: implement Claude web analysis
  return '';
}

clearChatHistory(): void {
  this.chatHistory = [];
}
```

#### 1B.2 — gemini.ts — fix error typing

**Plik:** `ZENO_WEB_CORE_APP/src/active/services/aiProviders/gemini.ts`  
**Wzorzec naprawy każdego catch bloku:**

```typescript
} catch (error) {
  const err = error as Error;
  throw new Error(`Gemini API error: ${err.message}`);
}
```

**Naprawa `config.model` optional:**
```typescript
model: this.config.model ?? 'gemini-1.5-flash',
```

#### 1B.3 — LocalLibrarySearch.tsx — dodaj brakujące useState

**Plik:** `ZENO_WEB_CORE_APP/src/active/components/LocalLibrarySearch.tsx`  
**Dodaj** (na początku komponentu, przy innych useState):

```typescript
const [iframeLoaded, setIframeLoaded] = useState(false);
```

#### 1B.4 — MusicPlayer.tsx — dodaj brakujące useState

**Plik:** `ZENO_WEB_CORE_APP/src/active/components/MusicPlayer.tsx`  
**Dodaj:**

```typescript
const [currentSkin, setCurrentSkin] = useState<string | null>(null);
const [showSkinSelector, setShowSkinSelector] = useState(false);
```

#### 1B.5 — ChatPanel.tsx — fix null vs undefined

**Plik:** `ZENO_WEB_CORE_APP/src/active/components/ChatPanel.tsx`  
**Zmiana:**

```typescript
// PRZED:
content: webContext?.content

// PO:
content: webContext?.content ?? undefined
```

#### 1B.6 — mcpService.ts — fix duplicate exports

**Plik:** `ZENO_WEB_CORE_APP/src/active/services/mcpService.ts`  
**Usuń** linię z `export type { ChatMessage, MCPResponse, ... }` jeśli typy są już exportowane inline

**Weryfikacja po 1B:**
```powershell
cd ZENO_WEB_CORE_APP
npm run type-check
# Cel: 0 błędów
```

---

### FAZA 1 — ELECTRON FOUNDATION (1h)
> Tylko jeśli FAZA 0 wykryje braki

#### 1.1 — Root package.json — dodaj zależności

```powershell
npm install zustand uuid concurrently wait-on
npm install -D @types/uuid
```

#### 1.2 — Root scripts.dev — napraw

**Plik:** `package.json` (root)  
**Zmień** `scripts.dev` na:

```json
"dev": "concurrently \"npm run dev:astro\" \"wait-on http://localhost:4378 && electron .\""
```

#### 1.3 — src-electron/main.ts — fix createWindow()

**Plik:** `src-electron/main.ts`  
**Zmień** w `createWindow()`:

```typescript
if (isDev) {
  mainWindow.loadURL('http://localhost:4378');
} else {
  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
}
```

#### 1.4 — Weryfikacja astro.config.mjs

```powershell
cat astro.config.mjs | Select-String "port|server"
# Port powinien być 4378
```

---

### FAZA 2 — PORT SUB-APP → ROOT (2-3h)
> Wymaga wyniku weryfikacji FAZY 0.1

#### 2.1 — FloatingWindow.tsx — port + naprawa

```powershell
cd ZENO_WEB_CORE_APP
npm run dev:copy components/FloatingWindow.tsx
npm run dev:use-working components/FloatingWindow.tsx
```

**Upewnij się, że props zawierają:**
```typescript
interface FloatingWindowProps {
  children?: React.ReactNode;
  icon?: string;
  zIndex?: number;
  url?: string;
  title: string;
  onClose: () => void;
}
```

**Naprawa windowState comparison bug** (z FAZY 1B):
```typescript
// PRZED (błąd TS):
style={windowState !== 'maximized' && windowState !== 'minimized' ? { ... } : {}}

// PO:
const isResizable = windowState === 'normal' || windowState === 'pip';
style={isResizable ? { ... } : {}}
```

#### 2.2 — useWindowManager.ts — NOWY HOOK

**Cel:** `ZENO_WEB_CORE_APP/src/active/hooks/useWindowManager.ts`

```typescript
export type WindowType = 'chat' | 'music' | 'download' | 'library' | 'mcp' | 'reader';

interface WindowConfig {
  type: WindowType;
  title: string;
  url?: string;
  embedded?: boolean;
}

export function useWindowManager() {
  const [windows, setWindows] = useState<WindowConfig[]>([]);

  const openWindow = (type: WindowType, config?: Partial<WindowConfig>) => {
    setWindows(prev => [...prev, { type, title: type, ...config }]);
  };

  const closeWindow = (type: WindowType) => {
    setWindows(prev => prev.filter(w => w.type !== type));
  };

  const postMessage = (type: WindowType, message: unknown) => {
    window.postMessage({ target: type, payload: message }, '*');
  };

  return { windows, openWindow, closeWindow, postMessage };
}
```

**Workflow:**
```powershell
# Stwórz hooks/ katalog jeśli nie istnieje
# Zapisz jako src/working/hooks/useWindowManager.ts
npm run validate:working hooks/useWindowManager.ts
npm run merge:to-original hooks/useWindowManager.ts
```

#### 2.3 — FeatureDock.tsx — NOWY KOMPONENT

**Cel:** `ZENO_WEB_CORE_APP/src/active/components/FeatureDock.tsx`  
**Zastępuje:** `BrowserBottomNav` (jeśli istnieje w ROOT)

```typescript
interface FeatureDockProps {
  onOpenWindow: (type: WindowType) => void;
}
```

Ikony doków: Chat 💬, Music 🎵, Downloads ⬇️, Library 📚, MCP 🔧, Reader 📖

#### 2.4 — ChatPanel.tsx + OllamaChatbot.tsx — embedded prop

**Dodaj prop** do obu komponentów:

```typescript
interface ChatPanelProps {
  embedded?: boolean;
  // ... reszta props
}
```

**Warunek renderowania:** jeśli `embedded={true}` → bez ramki, bez nagłówka, bez cienia

#### 2.5 — Browser.tsx — integracja WindowManager

**Plik:** `ZENO_WEB_CORE_APP/src/working/components/Browser.tsx`

```typescript
import { useWindowManager } from '../hooks/useWindowManager';
import { FeatureDock } from './FeatureDock';

// W komponencie:
const { windows, openWindow, closeWindow } = useWindowManager();

// W JSX — podmień BrowserBottomNav:
<FeatureDock onOpenWindow={openWindow} />
{windows.map(w => (
  <FloatingWindow key={w.type} title={w.title} onClose={() => closeWindow(w.type)}>
    {/* render komponent wg w.type */}
  </FloatingWindow>
))}
```

---

### FAZA 3 — INTEGRACJA NEWfiles (2h)
> Po zakończeniu i walidacji FAZY 2

#### 3.1 — AddressBar.tsx
```
Źródło:  NEWfiles/src/components/AddressBar.tsx
Cel:     ZENO_WEB_CORE_APP/src/working/components/AddressBar.tsx
Workflow: dev:copy → edytuj → validate → merge
```

#### 3.2 — TabBar.tsx
```
Źródło:  NEWfiles/src/components/TabBar.tsx
Cel:     ZENO_WEB_CORE_APP/src/working/components/TabBar.tsx
Wymaga:  electronAPI.browser.getTabs() — sprawdź src-electron/preload.ts
```

**Weryfikacja IPC:** `cat src-electron\preload.ts | Select-String "getTabs"`

#### 3.3 — SecurityMonitor.tsx
```
Źródło:  NEWfiles/src/components/SecurityMonitor.tsx
Cel:     ZENO_WEB_CORE_APP/src/working/components/SecurityMonitor.tsx
```

#### 3.4 — AIPanel.tsx
```
Źródło:  NEWfiles/src/components/AIPanel.tsx
Cel:     ZENO_WEB_CORE_APP/src/working/components/AIPanel.tsx
Wymaga:  GeminiProvider lub OpenRouterProvider aktywny (z FAZY 1B)
```

---

### FAZA 4 — TESTY I WALIDACJA (1h)

```powershell
# TypeScript — zero błędów
cd ZENO_WEB_CORE_APP
npm run type-check

# Linting
npm run lint

# Unit testy
cd ..
npm run test:unit

# Dev server
npm run dev:astro
# → otwiera localhost:4378 bez błędów

# Electron (jeśli FAZA 1 wykonana)
npm run dev
# → Electron okno otwiera się z UI na localhost:4378
```

---

## 📌 PRIORYTETY WYKONANIA

```
PRIORYTET 1 → FAZA 1B  (błędy TS — bloker buildu, ~2h)
PRIORYTET 2 → FAZA 0   (weryfikacja DIFF, ~30min)
PRIORYTET 3 → FAZA 1   (Electron foundation, tylko jeśli brakuje)
PRIORYTET 4 → FAZA 2   (port SUB-APP→ROOT, ~2-3h)
PRIORYTET 5 → FAZA 3   (NEWfiles integracja, ~2h)
PRIORYTET 6 → FAZA 4   (walidacja finalna, ~1h)
```

**Szacowany całkowity czas:** 7-10h

---

## 📝 LOG POSTĘPU

| Data | Faza | Krok | Status | Uwagi |
|------|------|------|--------|-------|
| 2026-03-15 | Plan | — | ✅ | Plan stworzony przez Context Architect |
| | | | | |

---

## 🔗 POWIĄZANE PLIKI

- [MASTER_REPAIR_PLAN.md](../MASTER_REPAIR_PLAN.md) — 8-fazowy plan K.R.A.F.T. v3
- [DEPLOYMENT_PLAN_NEW_FILES.md](./DEPLOYMENT_PLAN_NEW_FILES.md) — context map ROOT vs SUB-APP  
- [project-notes.md](../notes/project-notes.md) — szczegółowy stan projektu
- [decisions.md](../notes/decisions.md) — ADR-001 aktywne agenty i skills
