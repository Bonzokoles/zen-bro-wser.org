# 🎯 NEW STRATEGY TODO - ZENO BROWSER (K.R.A.F.T. v3)
priority: high
created: 2026-03-14T06:43:00

Lista zadań operacyjnych wyekstrahowana z `ZENO_BROWSER_ADVANCED_STRATEGY_Version1.md`, oczyszczona z Bielika, skoncentrowana na nowej architekturze Electron + AI Gateway + Cloudflare Webtunnels.

## 1. BROWSER ENGINE (Electron Integration)
- [x] Configure Electron IPC security for isolated sandboxing
- [x] Develop `WebCrawlerService` - Headless Electron WebContents crawler bypassing basic JS checks and integrates Tavily Deep Search.
- [x] Develop `LocalLibraryService` - Fast SQLite FTS5 engine paired with PDF/MD extraction for RAG applications.
- [x] **Setup Electron Core:** Inicjalizacja Electrona w roocie (instalacja `electron`, `electron-builder`).
- [x] **Main & Preload Scripts:** Stworzenie bezpiecznego mostu IPC (`main.ts`, `preload.ts`).
- [ ] **UI Integration:** Skonfigurowanie ładowania obecnego UI z `ZENO_WEB_CORE_APP` (dev: localhost, prod: dist).
- [ ] **Native Features:** Implementacja kontroli okien, tray icon i menu systemowego.

## 2. AI GATEWAY (The Intelligence Hub)
- [x] **Multi-Model Provider:** Implementacja `AIGateway.ts` (obsługa Gemini, Claude, OpenRouter).
- [x] **Routing Logic:** Logika wyboru modelu na podstawie zadania i priorytetów (Gemini 1.5 Pro jako default).
- [ ] **Intelligence Layer:**
    - [ ] **Cache System:** Lokalna baza danych dla powtarzalnych promptów.
    - [x] **Failover:** Automatyczne przełączanie na model zapasowy przy błędzie API.
- [ ] **Vector Memory:** Integracja z bazą wektorową (np. ChromaDB lub Supabase) dla długotrwałej pamięci kontekstowej.

## 3. CLOUDFLARE WEBTUNNELS (Secure Exposure)
- [x] **Daemon Controller:** Skrypt do zarządzania procesem `cloudflared`.
- [x] **Route Mapping:** Konfigurowalny plik mapowania lokalnych usług na domeny CF.
- [x] **Health Dashboard:** Panel UI wewnątrz przeglądarki do monitorowania stanu tuneli (dostęp z poziomu Terminala).

## 4. PERSISTENCE & ARCHITECTURE
- [x] **New Agent Protocol:** Zastąpienie Bielika nowym, lekkim systemem agentowym opartym na MCP.
- [ ] **Project Config:** Ujednolicenie ustawień w `ZENO_WEB_CORE_APP/config/`.
- [x] **Session Recovery:** Zapisywanie stanu otwartych kart i sesji AI w lokalnym storage (SQLite/JSON).

## 5. REFINEMENT & SECURITY
- [ ] **Secrets Management:** Przeniesienie wszystkich kluczy do `.workspace_meta/secrets/.env`.
- [ ] **Readiness Check:** Aktualizacja `README.md` o instrukcję uruchamiania wersji Electronowej.

---
// turbo-all
Plan zatwierdzony w fazie [PLANNING_PHASE]. Gotowy do przekazania Agentowi Kodującemu.
