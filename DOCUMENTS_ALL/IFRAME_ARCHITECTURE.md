# 🏗️ Architektura Iframe Testing System

## 📁 Struktura plików

```
src/
├── types/iframe/
│   └── core.types.ts                 # ✅ Wszystkie typy TypeScript
│
├── services/iframe/
│   ├── postMessageService.ts         # ✅ Komunikacja host ↔ iframe
│   ├── iframeTestService.ts          # ✅ Automatyczne testy
│   ├── mockDatabase.ts               # ✅ Mock database (zmień na Supabase)
│   ├── textSelectionService.ts       # 🔜 Zarządzanie zaznaczeniami
│   ├── exportService.ts              # 🔜 Eksport do PDF/DOCX/MD
│   ├── sessionService.ts             # 🔜 Sesje i historia
│   └── analyticsService.ts           # 🔜 Dashboard i metryki
│
├── components/iframe/
│   ├── IframeTester.tsx              # 🔜 Główny komponent
│   ├── IframeContainer.tsx           # 🔜 Kontener iframe
│   ├── TextSelectionPanel.tsx        # 🔜 Panel zaznaczonego tekstu
│   ├── TestResultsPanel.tsx          # 🔜 Wyniki testów
│   └── DashboardMetrics.tsx          # 🔜 Dashboard
│
├── pages/
│   ├── iframe-tester.astro           # ✅ Główna strona (naprawiona)
│   └── api/iframe/
│       ├── sites.ts                  # ✅ GET/POST /api/iframe/sites
│       ├── sites/[id].ts             # ✅ GET/PUT/DELETE /api/iframe/sites/:id
│       ├── test-results.ts           # 🔜 POST /api/iframe/test-results
│       ├── selections.ts             # 🔜 GET/POST /api/iframe/selections
│       └── sessions.ts               # 🔜 GET/POST /api/iframe/sessions
│
└── hooks/
    ├── useIframeTest.ts              # 🔜 Hook do testów
    ├── useTextSelection.ts           # 🔜 Hook do zaznaczania
    └── useAutoRotate.ts              # 🔜 Hook do auto-rotacji
```

## ✅ Zaimplementowane funkcje (5/10)

### 1. ✅ Typy TypeScript (`core.types.ts`)
**Co zawiera:**
- `IframeSite` - definicja strony testowej
- `IframeTestResult` - wyniki testów
- `TextSelection` - zaznaczony tekst
- `PostMessageData` - komunikacja
- `DashboardMetrics` - metryki
- `User`, `AuditLogEntry` - autoryzacja
- `SessionSettings` - konfiguracja

**Użycie:**
```typescript
import type { IframeSite, IframeTestResult } from '@/types/iframe/core.types';
```

### 2. ✅ PostMessage Service
**Możliwości:**
- Bezpieczna komunikacja host ↔ iframe
- Request/response pattern
- Timeout handling
- Origin validation
- TypeScript types

**Przykład:**
```typescript
import { postMessageService } from '@/services/iframe/postMessageService';

// Host sends to iframe
postMessageService.sendToIframe(iframe, 'REQUEST_DATA', { type: 'performance' });

// Listen for responses
postMessageService.on('IFRAME_READY', (payload) => {
  console.log('Iframe loaded:', payload.url);
});
```

### 3. ✅ Iframe Test Service
**Możliwości:**
- Automatyczne testy ładowania
- Retry logic (domyślnie 2 próby)
- Network metrics capture
- JS error capture
- Content validation
- Batch testing

**Przykład:**
```typescript
import { IframeTestService } from '@/services/iframe/iframeTestService';

const testService = new IframeTestService({
  timeout: 5000,
  retries: 2,
  captureNetworkMetrics: true,
});

const result = await testService.testSite(site, containerElement);
console.log('Test result:', result);
```

### 4. ✅ Backend API (REST)
**Endpoints:**

#### GET `/api/iframe/sites`
Pobierz wszystkie strony
```bash
curl http://localhost:4378/api/iframe/sites

# Filtrowanie
curl http://localhost:4378/api/iframe/sites?category=Playgrounds
curl http://localhost:4378/api/iframe/sites?search=code
```

#### POST `/api/iframe/sites`
Dodaj nową stronę
```bash
curl -X POST http://localhost:4378/api/iframe/sites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Test Site",
    "url": "https://example.com",
    "category": "Test",
    "sandbox": "allow-scripts allow-same-origin"
  }'
```

#### GET `/api/iframe/sites/:id`
Pobierz pojedynczą stronę

#### PUT `/api/iframe/sites/:id`
Aktualizuj stronę

#### DELETE `/api/iframe/sites/:id`
Usuń stronę

### 5. ✅ Mock Database
**Funkcje:**
- CRUD operations
- Search
- Filter by category
- In-memory storage (zastąp Supabase)

## 🔜 Do zaimplementowania (5/10)

### 6. Text Selection Service
**Plan:**
```typescript
class TextSelectionService {
  captureSelection(iframe): TextSelection
  saveSelection(selection): Promise<void>
  exportSelection(selection, format): Blob
  addNote(selectionId, note): Promise<void>
  addTags(selectionId, tags): Promise<void>
}
```

### 7. Export Service
**Formaty:**
- ✅ Markdown (.md)
- ✅ Plain Text (.txt)
- ✅ JSON (.json)
- ✅ HTML (.html)
- 🔜 PDF (.pdf) - użyj jsPDF
- 🔜 DOCX (.docx) - użyj docx.js

### 8. Session Service
**Funkcje:**
- Zapisywanie sesji testowych
- Przywracanie sesji
- Historia działań
- Multi-iframe tabs

### 9. Dashboard & Analytics
**Metryki:**
- Success rate
- Średni czas ładowania
- Breakdown błędów
- Timeline testów
- Top failing sites

### 10. Authentication & Audit
**System:**
- Login (Supabase Auth)
- Role-based access (admin/tester/viewer)
- Audit log wszystkich działań
- Whitelisting domen

## 🚀 Jak używać obecnego systemu

### 1. Uruchom dev server
```bash
npm run dev -- --port 4378
```

### 2. Otwórz iframe tester
```
http://localhost:4378/iframe-tester
```

### 3. Test API w konsoli przeglądarki
```javascript
// Pobierz wszystkie strony
fetch('/api/iframe/sites')
  .then(r => r.json())
  .then(console.log);

// Dodaj własną stronę
fetch('/api/iframe/sites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Site',
    url: 'https://example.com',
    category: 'Custom',
    sandbox: 'allow-scripts allow-same-origin'
  })
}).then(r => r.json()).then(console.log);
```

### 4. Użyj PostMessage API
```javascript
import { postMessageService } from '@/services/iframe/postMessageService';

postMessageService.init();

postMessageService.on('IFRAME_READY', (payload) => {
  console.log('Iframe ready:', payload);
});
```

## 📦 Następne kroki

1. **Napraw iframe-tester.astro** - stwórz działającą stronę
2. **Dodaj TextSelectionService** - zarządzanie zaznaczeniami
3. **Integruj z Supabase** - zamień mockDatabase
4. **Stwórz Dashboard** - wizualizacja metryk
5. **Dodaj Authentication** - system użytkowników

## 🛠️ Zależności do zainstalowania

```bash
# Eksport PDF
npm install jspdf

# Eksport DOCX
npm install docx

# Database (opcjonalnie zamiast mock)
npm install @supabase/supabase-js

# Charts dla dashboard
npm install recharts

# PDF generation
npm install html2canvas
```

## 📚 Dokumentacja API

Pełna dokumentacja API będzie dostępna pod:
```
http://localhost:4378/api/iframe/docs
```

## 🔒 Bezpieczeństwo

- ✅ Origin validation w PostMessage
- ✅ Sandbox attributes na iframe
- 🔜 CORS headers
- 🔜 Rate limiting
- 🔜 Input validation
- 🔜 Authentication tokens

## 🧪 Testy

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

**Status:** 5/10 funkcji zaimplementowanych ✅
**Ostatnia aktualizacja:** 2025-11-04
**Autor:** ZENO Browser Team
