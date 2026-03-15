🗺️ MAPA APLIKACJI ZENO Browser — 15 marca 2026
Wyniki analizy
GitHub: branch copilot/create-zip-archive-zc-browser-v0-2-0 | PR #14 aktywny

POTWIERDZONE KOMPONENTY (z błędów TS)
components ✅
Plik	Status TS	Uwagi
FloatingWindow.tsx	⚠️ 2 błędy	windowState comparison logic
ChatPanel.tsx	⚠️ 1 błąd	content: null vs undefined
LocalLibrarySearch.tsx	❌ 3 błędy	brakujące useState (iframeLoaded)
MusicPlayer.tsx	❌ 7 błędów	brakujące useState (currentSkin, showSkinSelector)
LocalChatbot.tsx	✅	OK
MCPConsole.tsx	✅	OK
OmniSearch.tsx	✅	OK
ReaderMode.tsx	✅	OK
SessionManager.tsx	✅	OK
DownloadManager.tsx	✅	OK
services ✅
Plik	Status TS	Uwagi
mcpService.ts	❌ 13 błędów	ClaudeProvider — stub bez 4 metod
aiProviders/gemini.ts	❌ 5 błędów	error unknown, config.model optional
omnisearch.ts	✅	OK
workspace-manager.ts	✅	OK
components ✅
Browser.tsx, BrowserUI.tsx, PluginExplorer.tsx, PluginInstaller.tsx

components (nie-active)
Browser.tsx, ChatPanel.tsx, IframeWindowManager.tsx, AIModelManager.tsx, MusicPlayer.tsx, ProviderSettings.tsx, UpgradePrompt.tsx, PricingCard.tsx, ErrorBoundary.tsx

src-electron
services/security-sandbox.ts ✅

DIFF: SUB-APP vs ROOT
Element	SUB-APP (active)	ROOT (active)
FloatingWindow.tsx	✅ ISTNIEJE (z children/icon/zIndex/url)	❓ nieznany stan
useWindowManager.ts	❓ nie widać błędów → prawdopodobnie brak	❌ BRAK
FeatureDock.tsx	❓ nie widać błędów → prawdopodobnie brak	❌ BRAK
ChatPanel embedded prop	❓ do weryfikacji	❌ BRAK
mcpService.ts (WORKING)	✅ working bez błędów	—
STAN FAZY 1 z MASTER_REPAIR_PLAN
KROK	Zadanie	Status
1.1	Dodaj zustand, uuid, lru-cache do root package.json	🟡 lru-cache — w node_modules (via astro), zustand/uuid — weryfikacja
1.2	scripts.dev → concurrently vite + electron	❓ nieznany
1.3	main.ts createWindow() loadURL/loadFile fix	❓ nieznany
1.4	vite.config.ts z react() + base: './'	❓ nieznany
KRYTYCZNE BŁĘDY TS (20 błędów w 4 plikach — BLOKER BUILDU)

mcpService.ts       — ClaudeProvider bez 4 metod (testConnection, executeMCPCommand, analyzeWebContent, clearChatHistory)gemini.ts           — error: unknown + config.model optionalLocalLibrarySearch  — brakujące useState (iframeLoaded)MusicPlayer.tsx     — brakujące useState (currentSkin, showSkinSelector)
Plan zawartości pliku .workspace_meta/ToDo/IMPLEMENTATION_PLAN_PORT_v2.md

# IMPLEMENTATION PLAN PORT v2 — ZENO Browser# Data: 2026-03-15 | Gałąź: copilot/create-zip-archive-zc-browser-v0-2-0## FAZA 0 — WERYFIKACJA STANU (1h)### 0.1 Sprawdź ROOT vs SUB-APP DIFF- Porównaj: `src/active/` vs `ZENO_WEB_CORE_APP/src/active/`- Komenda: `Get-ChildItem src/active/components | Compare-Object (Get-ChildItem ZENO_WEB_CORE_APP/src/active/components)`- Cel: lista plików TYLKO w SUB-APP (FeatureDock, useWindowManager itp.)### 0.2 Sprawdź FAZA 1 MASTER_REPAIR_PLAN status- Komenda: `cat package.json | Select-String "concurrently|zustand|uuid"`- Komenda: `cat src-electron/main.ts | Select-String "loadURL|loadFile|isDev"`- Komenda: `Test-Path vite.config.ts`## FAZA 1 — ELECTRON FOUNDATION (1h)> Tylko jeśli 0.2 wykaże braki### 1.1 Root package.json — dodaj zależności```json"zustand": "^4.4.1","uuid": "^9.0.0","concurrently": "^8.2.2","wait-on": "^7.1.0"
Komenda: npm install zustand uuid concurrently wait-on

1.2 Root scripts.dev

"dev": "concurrently \"npm run dev:astro\" \"wait-on http://localhost:4378 && electron .\""
Plik: package.json → klucz scripts.dev

1.3 main.ts createWindow fix

if (isDev) {  mainWindow.loadURL('http://localhost:4378');} else {  mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));}
1.4 Weryfikacja vite.config.ts/astro.config.mjs
Astro używa port 4378 (nie Vite) — astro.config.mjs jest źródłem prawdy
FAZA 1B — NAPRAWA BŁĘDÓW TS (2h) ← PRIORYTET!
20 błędów blokuje build — wykonaj PRZED FAZĄ 2

1B.1 ClaudeProvider — implementuj stub methods
Plik: claude.ts
Dodaj: testConnection(), executeMCPCommand(), analyzeWebContent(), clearChatHistory()
Wzorzec: skopiuj sygnatury z GeminiProvider

1B.2 gemini.ts — fix error typing

} catch (error) {  const err = error as Error;  throw new Error(`Gemini API error: ${err.message}`);}
1B.3 LocalLibrarySearch.tsx — dodaj brakujące useState

const [iframeLoaded, setIframeLoaded] = useState(false);
1B.4 MusicPlayer.tsx — dodaj brakujące useState

const [currentSkin, setCurrentSkin] = useState<string | null>(null);const [showSkinSelector, setShowSkinSelector] = useState(false);
1B.5 ChatPanel.tsx — fix null vs undefined

content: webContext?.content ?? undefined
FAZA 2 — PORT SUB-APP → ROOT (2-3h)
Wymaga wyniku FAZY 0.1

2.1 FloatingWindow.tsx
Źródło: FloatingWindow.tsx
Cel: FloatingWindow.tsx (lub stwórz jeśli brak)
Zmiana: upewnij się że props include children, icon, zIndex, url
Naprawa: windowState comparison bug (FAZA 1B)
Workflow: npm run dev:copy components/FloatingWindow.tsx

2.2 useWindowManager.ts (NOWY)
Cel: useWindowManager.ts
API: openWindow(type: WindowType, config) + postMessage bus
Workflow: stworzyć w working/, zwalidować, merge

2.3 FeatureDock.tsx (NOWY)
Cel: FeatureDock.tsx
Zastępuje: BrowserBottomNav (jeśli istnieje w ROOT)
Workflow: stworzyć w working/

2.4 ChatPanel.tsx + OllamaChatbot.tsx — embedded prop
Dodaj: embedded?: boolean prop
Warunek: jeśli embedded → bez ramki, bez nagłówka

2.5 Browser.tsx — integracja WindowManager
Importuj: useWindowManager, FeatureDock
Podmień: BrowserBottomNav → FeatureDock

FAZA 3 — INTEGRACJA NEWfiles (2h)
Po potwierdzeniu FAZY 2

3.1 AddressBar.tsx
Źródło: AddressBar.tsx
Cel: ZENO_WEB_CORE_APP/src/working/components/AddressBar.tsx

3.2 TabBar.tsx
Źródło: TabBar.tsx
Wymaga: electronAPI.browser.getTabs() — sprawdź preload.ts

3.3 SecurityMonitor.tsx
Źródło: SecurityMonitor.tsx

3.4 AIPanel.tsx
Źródło: AIPanel.tsx
Wymaga: AI Gateway z FAZY 1 (Gemini/OpenRouter)

FAZA 4 — TESTY I WALIDACJA (1h)
npm run type-check — zero błędów TS
npm run lint — zero ostrzeżeń
npm run test:unit — testy pass
npm run dev — app startuje na localhost:4378
Electron — okno otwiera się z UI

---## Rekomendacja następnego kroku**Zacznij od FAZY 1B** — 20 błędów TS w `mcpService.ts`, `gemini.ts`, `MusicPlayer.tsx`, `LocalLibrarySearch.tsx` blokuje build. Są to szybkie naprawy (1-2h), po których można bezpiecznie przejść do portowania komponentów.Czy zapisać ten plan do `.workspace_meta/ToDo/IMPLEMENTATION_PLAN_PORT_v2.md`? (Potrzebuję narzędzi do edycji plików — możesz je włączyć lub skopiować treść powyżej.)---## Rekomendacja następnego kroku**Zacznij od FAZY 1B** — 20 błędów TS w `mcpService.ts`, `gemini.ts`, `MusicPlayer.tsx`, `LocalLibrarySearch.tsx` blokuje build. Są to szybkie naprawy (1-2h), po których można bezpiecznie przejść do portowania komponentów.Czy zapisać ten plan do `.workspace_meta/ToDo/IMPLEMENTATION_PLAN_PORT_v2.md`? (Potrzebuję narzędzi do edycji plików — możesz je włączyć lub skopiować treść powyżej.)
Claude Sonnet 4.6 