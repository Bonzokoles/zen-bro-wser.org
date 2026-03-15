
## 📍 Context Map — active ZENO Browser

### ⚠️ Kluczowe odkrycie: DWA różne stany kodu

```
U:\WWW_Zen_BRo_wser_org\src\active\           ← ROOT (port 4378, CF deploy)
U:\WWW_Zen_BRo_wser_org\ZENO_WEB_CORE_APP\src\active\  ← SUB-APP (port 4380)
```

**ROOT jest STARSZY** — to co uruchomiło się jako "stara wersja" to ROOT. Nie ma tam jeszcze `FeatureDock`, `useWindowManager`, ani `children` w `FloatingWindow`.

---

### Mapa zależności ROOT active

```
Browser.tsx (główny orchestrator)
│
├── IMPORTUJE (bezpośrednio)
│   ├── FloatingWindow.tsx          ← tylko URL, bez children/icon
│   ├── ChatPanel.tsx               ← fixed sidebar, bez embedded
│   ├── OllamaChatbot.tsx           ← fixed modal, bez embedded
│   ├── MusicPlayer.tsx
│   ├── AdminPanel.tsx
│   ├── VideoPlayerPanel.tsx
│   ├── WebView.tsx                 ← renderuje URL w iframe
│   │
│   ├── browser/BrowserHeader.tsx   ← logo, plan badge, addr bar
│   ├── browser/BrowserTabs.tsx     ← tab strip
│   ├── browser/BrowserBottomNav.tsx ←  STARY nav (15 przycisków)  ❗
│   ├── browser/BrowserBookmarksPanel.tsx
│   ├── browser/BrowserHistoryPanel.tsx
│   └── browser/BrowserToolsPanel.tsx
│
├── widgets/ (otwierane jako FloatingWindow z URL)
│   ├── ClockWidget.tsx
│   ├── WikipediaWidget.tsx
│   ├── OnThisDayWidget.tsx
│   ├── BirthdaySongWidget.tsx
│   ├── ShortcutsWidget.tsx
│   └── MusicPlayerWidget.tsx
│
├── iframe/ (odtwarzacze mediów)
│   ├── YouTubePlayer.tsx
│   ├── InternetArchivePlayer.tsx
│   ├── ElfsightMovieWidget.tsx
│   └── SiteSearch.tsx
│
└── services/
    ├── mcpService.ts               ← 6 MCP tools (częściowo stub)
    ├── toolExecutionService.ts
    ├── aiProviders/                ← gemini, openrouter
    └── security/licenseManager.ts
```

**Sub-app (ZENO_WEB_CORE_APP) ma dodatkowo:**
```
hooks/useWindowManager.ts    ← WindowType + openWindow + postMessage bus
FeatureDock.tsx              ← zastępuje BrowserBottomNav
Browser.tsx                  ← zaktualizowany o WindowManager + FeatureDock
FloatingWindow.tsx           ← children + icon + zIndex
ChatPanel.tsx                ← embedded prop
OllamaChatbot.tsx            ← embedded prop
```

---

### Sekwencja zmian (do wykonania)

1. **NAJPIERW:** Przeportować zmiany z sub-app do root (sync kodu)
2. **POTEM:** Stworzyć `src/tools/` z architekturą sandbox
3. **POTEM:** Podłączyć tools do `useWindowManager` + `FeatureDock`

---

Teraz generuję plan implementacji i zapisuję go do workspace: Narzędzia edycji plików są wyłączone — dodam plan bezpośrednio jako output do skopiowania.

---

## 📋 Implementation Plan — `src/tools/` Sandbox Architecture

```
---
goal: Architektura narzędzi sandbox dla ZENO Browser (src/tools/)
version: 1.0
date_created: 2026-03-15
status: 'Planned'
tags: [architecture, feature, sandbox, tools, iframe]
---
```

---

### Faza 0 — PREREQUISITE: Sync root ← sub-app

**GOAL-000:** Przeportować zmiany z active do active

| Task | Opis | Plik źródłowy → docelowy |
|------|------|-------------------------|
| TASK-001 | Skopiuj FloatingWindow.tsx z children/icon/zIndex | ZENO_WEB_CORE_APP → root |
| TASK-002 | Skopiuj `hooks/useWindowManager.ts` (nowy folder) | ZENO_WEB_CORE_APP → root |
| TASK-003 | Skopiuj FeatureDock.tsx | ZENO_WEB_CORE_APP → root |
| TASK-004 | Zastosuj `embedded` prop w `ChatPanel.tsx` | ZENO_WEB_CORE_APP → root |
| TASK-005 | Zastosuj `embedded` prop w `OllamaChatbot.tsx` | ZENO_WEB_CORE_APP → root |
| TASK-006 | Zaktualizuj Browser.tsx (usuń BrowserBottomNav, dodaj FeatureDock + managedWindows render) | ZENO_WEB_CORE_APP → root |

**Kryterium ukończenia:** `npm run build` w root przechodzi bez nowych błędów.

---

### Faza 1 — Architektura `src/tools/`

**GOAL-001:** Stworzyć strukturę folderów + kontrakt interfejsu narzędzi

```
src/
└── tools/
    ├── _template/                  ← szablon każdego narzędzia
    │   ├── ToolTemplate.tsx        ← komponent React
    │   ├── ToolTemplate.test.tsx   ← testy jednostkowe
    │   └── index.ts                ← re-export
    │
    ├── terminal-panel/             ← NARZĘDZIE 1
    ├── web-tunnel-monitor/         ← NARZĘDZIE 2
    ├── ai-sandbox/                 ← NARZĘDZIE 3
    └── index.ts                    ← registry wszystkich tools
```

**Kontrakt (`ToolContract`):**
```typescript
// src/tools/_template/index.ts
export interface SandboxToolProps {
  embedded?: boolean;           // true = renderuj w FloatingWindow
  onClose?: () => void;         // zamknięcie z FloatingWindow
  onResult?: (data: unknown) => void;  // wynik do innego narzędzia
  sandboxId?: string;           // ID dla postMessage bus
  theme?: 'dark' | 'light';
}

export interface SandboxToolMeta {
  id: string;                   // 'terminal-panel'
  name: string;                 // 'Terminal'
  icon: string;                 // '⌨️'
  windowSize: { w: number; h: number };
  description: string;
  category: 'analysis' | 'ai' | 'network' | 'media' | 'utility';
}
```

**Rejestr narzędzi (`src/tools/index.ts`):**
```typescript
export * from './terminal-panel';
export * from './web-tunnel-monitor';
export * from './ai-sandbox';

import { TerminalPanelMeta } from './terminal-panel';
import { WebTunnelMonitorMeta } from './web-tunnel-monitor';
import { AiSandboxMeta } from './ai-sandbox';

export const TOOL_REGISTRY: SandboxToolMeta[] = [
  TerminalPanelMeta,
  WebTunnelMonitorMeta,
  AiSandboxMeta,
];
```

| Task | Opis |
|------|------|
| TASK-007 | Stwórz `src/tools/_template/ToolTemplate.tsx` z SandboxToolProps |
| TASK-008 | Stwórz `src/tools/index.ts` — registry + re-export |
| TASK-009 | Dodaj `WindowType` dla każdego narzędzia w useWindowManager.ts |

---

### Faza 2 — Pierwsze 3 narzędzia

**GOAL-002:** `terminal-panel` — CLI w FloatingWindow

```typescript
// src/tools/terminal-panel/TerminalPanel.tsx
// Zależność: npm install react-terminal-ui
// Komendy: navigate, ai-ask, analyze-url, send-to:<toolId>
```

| Task | Opis |
|------|------|
| TASK-010 | `npm install react-terminal-ui` w root |
| TASK-011 | Stwórz `TerminalPanel.tsx` z SandboxToolProps + komendami |
| TASK-012 | Zaimplementuj `send-to:<toolId>` — wysyła wynik do innego okna przez postMessage |
| TASK-013 | Dodaj `TerminalPanelMeta` + re-export z `index.ts` |
| TASK-014 | Dodaj `'terminal'` do `WindowType` w useWindowManager.ts |
| TASK-015 | Dodaj ikonę `⌨️ Terminal` do `FeatureDock` PRIMARY |

---

**GOAL-003:** `web-tunnel-monitor` — dashboard tuneli CF

```typescript
// src/tools/web-tunnel-monitor/WebTunnelMonitor.tsx
// Pokazuje: status cloudflared, aktywne tunele, logi, restart button
// Dane z: fetch('/api/tunnel-status') lub localStorage mock
```

| Task | Opis |
|------|------|
| TASK-016 | Stwórz `WebTunnelMonitor.tsx` — lista tuneli + status badge |
| TASK-017 | Mock data mode (gdy brak CF daemon) — czytelna informacja |
| TASK-018 | `WebTunnelMonitorMeta` + `index.ts` |
| TASK-019 | Dodaj `'tunnels'` do `WindowType` + FeatureDock MORE |

---

**GOAL-004:** `ai-sandbox` — izolowane środowisko prompt→wynik

```typescript
// src/tools/ai-sandbox/AiSandbox.tsx
// Edytor prompta + wybór modelu + wynik w panelu
// Może wysłać wynik do terminal-panel lub innego narzędzia
// Integruje się z src/active/services/aiProviders/
```

| Task | Opis |
|------|------|
| TASK-020 | Stwórz `AiSandbox.tsx` — textarea input, model selector, output panel |
| TASK-021 | Podłącz `aiProviders` (gemini/openrouter) |
| TASK-022 | Przycisk "→ Wyślij do Terminal" via postMessage bus |
| TASK-023 | `AiSandboxMeta` + `index.ts` |
| TASK-024 | Dodaj `'ai-sandbox'` do `WindowType` + FeatureDock MORE |

---

### Faza 3 — Integracja z WindowManager

**GOAL-005:** Każde narzędzie otwieralne z FeatureDock jako FloatingWindow z `children`

```typescript
// W Browser.tsx managedWindows render block:
{win.type === 'terminal' && (
  <TerminalPanel embedded onClose={() => closeWindow(win.id)}
    sandboxId={win.id}
    onResult={(data) => sendMessage(win.id, 'ai-chat', 'result', data)} />
)}
{win.type === 'tunnels' && (
  <WebTunnelMonitor embedded onClose={() => closeWindow(win.id)} />
)}
{win.type === 'ai-sandbox' && (
  <AiSandbox embedded onClose={() => closeWindow(win.id)} sandboxId={win.id} />
)}
```

| Task | Opis |
|------|------|
| TASK-025 | Dodaj render block dla 3 nowych narzędzi w Browser.tsx |
| TASK-026 | Przetestuj: otwórz terminal + ai-sandbox → wyślij wynik między oknami |
| TASK-027 | `npm run build` — weryfikacja bez błędów |

---

### Faza 4 — Sandbox-safe: iframe isolation check

**GOAL-006:** Każde narzędzie sprawdzone pod kątem iframe sandbox

```
Test checklist dla każdego tool:
□ Działa jako embedded (children w FloatingWindow)
□ Nie używa window.opener / window.parent bezpośrednio
□ postMessage wysyłany z sandboxId jako from
□ Brak bezpośrednich mutacji DOM poza własnym rootem
□ Brak hardcoded API keys (tylko process.env lub props)
```

| Task | Opis |
|------|------|
| TASK-028 | Audyt security każdego narzędzia (lista checklist) |
| TASK-029 | Dodaj CSP header w astro.config.mjs dla `/tools/*` |
| TASK-030 | Dokumentacja iframe isolation w `src/tools/README.md` |

---

### Zależności

- **DEP-001:** `react-terminal-ui` (`npm install react-terminal-ui`)
- **DEP-002:** useWindowManager.ts musi być zsynchronizowane root ← sub-app (Faza 0)
- **DEP-003:** FeatureDock.tsx w root (Faza 0)
- **DEP-004:** `aiProviders/` w services — już istnieje

### Ryzyko

- **RISK-001:** ROOT i ZENO_WEB_CORE_APP rozjechają się przy kolejnych zmianach → ustalić **jeden canonical source** (active root), a ZENO_WEB_CORE_APP traktować jako archiwum
- **RISK-002:** `react-terminal-ui` nie ma typów TS → może wymagać `@types/react-terminal-ui` lub lokalnych deklaracji
- **RISK-003:** CSP Cloudflare Workers może blokować inline styles w widgets → testować na CF Pages nie tylko lokalnie

---

## Co teraz zrobić

**Najszybsza droga do działającego systemu:**

```
1. Włącz narzędzia (edycja plików + terminal)
2. Skopiuj 6 plików z sub-app do root (Faza 0) — 5 minut
3. npm run build w root — weryfikacja
4. npm install react-terminal-ui
5. Stwórz src/tools/_template/ + terminal-panel/
6. Podłącz do FeatureDock
```

Chcesz żebym to od razu wykonał (po włączeniu narzędzi), czy wolisz zacząć od konkretnego kroku?