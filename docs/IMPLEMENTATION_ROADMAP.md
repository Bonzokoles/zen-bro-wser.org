# ZENO Browser - Implementation Roadmap

## 📚 Dokumentacja Kompletna

Stworzone dokumenty w `/docs`:

### Core Systems
- ✅ **VERSION_CONTROL.md** - System wersjonowania (original + working)
- ✅ **SECURITY.md** - (w DEVELOPMENT_PLAN.md) Backend proxy, API safety
- ✅ **MCP_TOOLS.md** - (w DEVELOPMENT_PLAN.md) Kompletne narzędzia MCP
- ✅ **STATE_MANAGEMENT.md** - (w DEVELOPMENT_PLAN.md) Zustand store

### Search & Discovery
- ✅ **THEMATIC_SEARCH.md** - Wyszukiwanie według tematów
- ✅ **OLD_WEB.md** - Stare miejsca internetu, alternatywne silniki
- ✅ **CUSTOM_PATHS.md** - Własne ścieżki wyszukiwań
- ✅ **NON_SPONSORED.md** - (w OLD_WEB.md) Wyszukiwanie bez reklam

### AI & Agents
- ✅ **AGENT_SYSTEM.md** - System workerów w tle
- ✅ **INFO_GATHERING.md** - Zbieranie informacji
- ✅ **ANOMALY_DETECTION.md** - Wykrywanie anomalii

### Features
- ✅ **TAB_MANAGEMENT.md** - (w FEATURE_EXAMPLES.md) Zaawansowane zakładki
- ✅ **SESSIONS.md** - (w FEATURE_EXAMPLES.md) Manager sesji
- ✅ **READING_MODE.md** - (w FEATURE_EXAMPLES.md) Tryb czytnika

### Quick Wins
- ✅ **IMPROVEMENTS.md** - (w QUICK_IMPROVEMENTS.md) Szybkie poprawki 1-2 dni

---

## 🚀 Plan Implementacji

### Faza 1: Fundament (Tydzień 1-2)

#### 1.1 System Wersjonowania (Priorytet #1)
**Czas:** 2-3 dni
**Plik:** `docs/core/VERSION_CONTROL.md`

**Skrypty do stworzenia:**
```bash
scripts/
├── dev-copy.js              # Kopiuj original -> working
├── use-working.js           # Przełącz na working
├── use-original.js          # Przełącz na original
├── validate-working.js      # Waliduj przed merge
├── merge-to-original.js     # Merge working -> original
├── rollback.js              # Rollback do backupu
├── diff-versions.js         # Porównaj wersje
└── emergency-rollback.js    # Awaryjny rollback
```

**Struktura katalogów:**
```
src/
├── original/               # Kod produkcyjny (NIE EDYTOWAĆ!)
├── working/                # Wersje robocze
├── active/                 # Symlinki (auto-generowane)
└── backups/                # Backupy przed merge
```

**Status:** 🔴 DO ZROBIENIA

---

#### 1.2 Backend API Proxy (Priorytet #2)
**Czas:** 3-4 dni
**Plik:** `docs/DEVELOPMENT_PLAN.md` (linie 10-35)

**Co zrobić:**
```
api/
├── proxy.ts                # Express server
├── providers/
│   ├── gemini-proxy.ts     # Gemini API proxy
│   ├── openrouter-proxy.ts # OpenRouter proxy
│   └── tavily-proxy.ts     # Tavily proxy
└── middleware/
    ├── auth.ts             # Walidacja kluczy
    └── rate-limit.ts       # Rate limiting
```

**Kroki:**
1. Stwórz Express server w `/api`
2. Przenieś wywołania API z client → server
3. Przenieś klucze do `.env`
4. Dodaj rate limiting (100 req/h per IP)
5. Zaktualizuj client calls

**Status:** 🔴 KRYTYCZNE - zrób zaraz po wersjonowaniu

---

### Faza 2: Quick Wins (Tydzień 2-3)

#### 2.1 Error Handling
**Czas:** 1 dzień
**Plik:** `docs/QUICK_IMPROVEMENTS.md` (linie 3-55)

**Implementacja:**
```typescript
// src/utils/error-handler.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string,
    public details?: any
  ) {
    super(message);
  }
}
```

**Status:** 🟡 Łatwe - zrób w working/

---

#### 2.2 Toast Notifications
**Czas:** 0.5 dnia
**Plik:** `docs/QUICK_IMPROVEMENTS.md` (linie 155-195)

```bash
npm install react-hot-toast
```

**Status:** 🟡 Łatwe

---

#### 2.3 Keyboard Shortcuts
**Czas:** 1 dzień
**Plik:** `docs/QUICK_IMPROVEMENTS.md` (linie 97-153)

**Skróty do zaimplementowania:**
- Cmd+T - Nowa zakładka
- Cmd+W - Zamknij zakładkę
- Cmd+K - Wyszukiwanie
- Cmd+D - Zakładka

**Status:** 🟡 Średnie

---

### Faza 3: Core Features (Tydzień 3-6)

#### 3.1 Thematic Search
**Czas:** 5-7 dni
**Plik:** `docs/search/THEMATIC_SEARCH.md`

**Komponenty:**
```
src/services/search/
├── thematic-engine.ts       # Główny silnik
├── topic-detector.ts        # Detekcja tematów
├── semantic-grouper.ts      # Grupowanie
└── context-analyzer.ts      # Analiza kontekstu
```

**Status:** 🔵 Zaawansowane

---

#### 3.2 Old Web Discovery
**Czas:** 3-5 dni
**Plik:** `docs/search/OLD_WEB.md`

**Integracje:**
- Marginalia Search
- Wiby (vintage web)
- Wayback Machine
- Stract
- Mojeek

**Status:** 🔵 Średnio-zaawansowane

---

#### 3.3 Custom Search Paths
**Czas:** 7-10 dni
**Plik:** `docs/search/CUSTOM_PATHS.md`

**System:**
- Visual flow builder (React Flow)
- Node-based architecture
- Execution engine
- Template system

**Status:** 🔴 Bardzo zaawansowane

---

### Faza 4: AI & Agents (Tydzień 6-10)

#### 4.1 Worker System
**Czas:** 5-7 dni
**Plik:** `docs/agents/AGENT_SYSTEM.md`

**Workers:**
- IndexingWorker
- SyncWorker
- CleanupWorker
- BackupWorker

**Status:** 🔵 Zaawansowane

---

#### 4.2 Information Gathering
**Czas:** 7-10 dni
**Plik:** `docs/agents/INFO_GATHERING.md`

**Collectors:**
- Web Crawler
- RSS Monitor
- API Poller
- Knowledge Graph

**Status:** 🔴 Bardzo zaawansowane

---

#### 4.3 Anomaly Detection
**Czas:** 5-7 dni
**Plik:** `docs/agents/ANOMALY_DETECTION.md`

**Models:**
- Statistical
- Rule-Based
- ML-Based
- Hybrid

**Status:** 🔴 Bardzo zaawansowane

---

## 📊 Priorytety Implementacji

### ⚡ NAJPIERW (Tydzień 1):
1. ✅ System wersjonowania - **ABSOLUTNY PRIORYTET**
2. ✅ Backend API proxy - **BEZPIECZEŃSTWO**
3. ✅ Error handling - **FUNDAMENTY**
4. ✅ Toast notifications - **UX**

### 🟢 ZARAZ POTEM (Tydzień 2-3):
5. ✅ Keyboard shortcuts
6. ✅ Old Web Discovery (łatwiejsze niż Thematic)
7. ✅ Loading states
8. ✅ Tab management improvements

### 🔵 PÓŹNIEJ (Tydzień 4-8):
9. ✅ Thematic Search
10. ✅ Worker System
11. ✅ Custom Search Paths
12. ✅ Session Manager

### 🔴 ZAAWANSOWANE (Tydzień 8+):
13. ✅ Information Gathering
14. ✅ Anomaly Detection
15. ✅ Knowledge Base
16. ✅ Desktop App (Electron)

---

## 🎯 Rozpoczynamy Implementację

### Krok 1: System Wersjonowania

**Zacznij od:**
```bash
# 1. Utwórz strukturę katalogów
mkdir -p src/original src/working src/active src/backups

# 2. Przenieś obecny kod do original/
mv src/components src/original/
mv src/services src/original/
mv src/utils src/original/

# 3. Utwórz active/ symlinks
ln -s ../original/components src/active/components
ln -s ../original/services src/active/services
ln -s ../original/utils src/active/utils

# 4. Zaktualizuj import paths w kodzie
# Zmień:
#   import { X } from './components/Y'
# Na:
#   import { X } from './active/components/Y'
```

**Skrypty:**

Następnie tworzę skrypty z `docs/core/VERSION_CONTROL.md`.

---

## 💡 Wskazówki

### Pracuj Bezpiecznie:
1. **ZAWSZE** kopiuj do working/ przed edycją
2. **NIGDY** nie edytuj original/ bezpośrednio
3. **ZAWSZE** waliduj przed merge
4. **ZACHOWUJ** backupy przed merge

### Testuj Często:
- Po każdej zmianie: `npm run test:working`
- Przed merge: `npm run validate:working`
- Po merge: `npm run test:original`

### Commituj Małymi Krokami:
```bash
git commit -m "[WORKING] component/X: Add feature Y"
git commit -m "[ORIGINAL] component/X: Merge feature Y"
```

---

## 📈 Tracking Progress

Użyj todo list w kodzie:

```typescript
// TODO(version-control): Setup scripts
// TODO(api-proxy): Create Express server
// TODO(thematic-search): Implement topic detection
// DONE(error-handling): AppError class created
```

---

## ✅ Gotowe do Startu!

**Następny krok:** Implementacja skryptów wersjonowania

Przejdź do: `scripts/` i zacznij od `dev-copy.js`
