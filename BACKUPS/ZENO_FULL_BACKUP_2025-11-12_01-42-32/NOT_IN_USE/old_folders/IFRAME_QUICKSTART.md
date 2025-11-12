# 🚀 Quick Start Guide - Iframe Testing System

## ✅ Co już działa

### 1. **Testowanie iframe** (http://localhost:4378/iframe-tester)
- ✅ Lista 5 gotowych stron testowych
- ✅ Automatyczne ładowanie z timeoutem
- ✅ Pomiar czasu ładowania
- ✅ Auto-rotacja co 10 sekund
- ✅ Zaznaczanie tekstu z iframe (jeśli CORS pozwala)
- ✅ Eksport do MD/TXT/JSON/HTML

### 2. **Backend API**
```bash
# Pobierz wszystkie strony
GET /api/iframe/sites

# Pobierz stronę po ID
GET /api/iframe/sites/:id

# Dodaj nową stronę
POST /api/iframe/sites
{
  "name": "My Site",
  "url": "https://example.com",
  "category": "Test",
  "sandbox": "allow-scripts allow-same-origin"
}

# Aktualizuj stronę
PUT /api/iframe/sites/:id

# Usuń stronę
DELETE /api/iframe/sites/:id
```

### 3. **Services**
- ✅ `PostMessageService` - komunikacja host ↔ iframe
- ✅ `IframeTestService` - automatyczne testy
- ✅ `mockDatabase` - in-memory storage

## 🎯 Jak używać

### Test pojedynczej strony
1. Otwórz http://localhost:4378/iframe-tester
2. Kliknij na stronę z listy po lewej
3. Czekaj na załadowanie
4. Zaznacz tekst w iframe
5. Kliknij "Get Selection"
6. Wybierz format i kliknij "Save"

### Auto-rotacja
1. Kliknij "🔄 Auto-Rotate (OFF)"
2. Strony będą się zmieniać co 10 sekund
3. Kliknij ponownie aby zatrzymać

### API w JavaScript
```javascript
// Pobierz wszystkie strony
const response = await fetch('/api/iframe/sites');
const data = await response.json();
console.log(data.data); // Array<IframeSite>

// Dodaj własną stronę
await fetch('/api/iframe/sites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Stack Overflow',
    url: 'https://stackoverflow.com',
    category: 'Education',
    sandbox: 'allow-scripts allow-same-origin',
    tags: ['programming', 'qa']
  })
});
```

### PostMessage API
```typescript
import { postMessageService } from '@/services/iframe/postMessageService';

postMessageService.init();

// Listen for iframe ready
postMessageService.on('IFRAME_READY', (payload) => {
  console.log('Iframe loaded:', payload.url, payload.loadTime);
});

// Send message to iframe
const iframe = document.querySelector('iframe');
postMessageService.sendToIframe(iframe, 'REQUEST_DATA', {
  type: 'performance'
});
```

### Iframe Test Service
```typescript
import { IframeTestService } from '@/services/iframe/iframeTestService';

const testService = new IframeTestService({
  timeout: 5000,
  retries: 2,
  captureNetworkMetrics: true,
  captureJSErrors: true,
});

const container = document.getElementById('test-container');
const result = await testService.testSite(site, container);

if (result.success) {
  console.log(`✅ Loaded in ${result.loadTime}ms`);
} else {
  console.error(`❌ Failed: ${result.errorMessage}`);
}
```

## 📋 Następne funkcje (gotowe do implementacji)

### 6. Text Selection Service
```typescript
// services/iframe/textSelectionService.ts
class TextSelectionService {
  async saveSelection(text: string, metadata: SelectionMetadata): Promise<string>
  async getSelections(siteId: string): Promise<TextSelection[]>
  async addNote(selectionId: string, note: string): Promise<void>
  async addTags(selectionId: string, tags: string[]): Promise<void>
}
```

### 7. Export Service (PDF/DOCX)
```typescript
// services/iframe/exportService.ts
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph } from 'docx';

class ExportService {
  exportToPDF(selection: TextSelection): Blob
  exportToDOCX(selection: TextSelection): Blob
  exportToMarkdown(selection: TextSelection): string
}
```

### 8. Session Service
```typescript
// services/iframe/sessionService.ts
class SessionService {
  async saveSession(session: IframeSession): Promise<string>
  async loadSession(sessionId: string): Promise<IframeSession>
  async listSessions(userId: string): Promise<IframeSession[]>
  async deleteSession(sessionId: string): Promise<boolean>
}
```

### 9. Analytics Dashboard
```typescript
// components/iframe/DashboardMetrics.tsx
export function DashboardMetrics() {
  const metrics = useDashboardMetrics();
  
  return (
    <div>
      <MetricCard title="Success Rate" value={metrics.successRate} />
      <MetricCard title="Avg Load Time" value={metrics.avgLoadTime} />
      <TimeSeriesChart data={metrics.testsOverTime} />
      <ErrorBreakdownChart data={metrics.errorBreakdown} />
    </div>
  );
}
```

### 10. Authentication & Audit
```typescript
// services/iframe/authService.ts
import { supabase } from '@/services/supabaseClient';

class AuthService {
  async login(email: string, password: string): Promise<User>
  async checkRole(userId: string): Promise<UserRole>
  async logAction(action: AuditAction, resource: string): Promise<void>
}
```

## 🔧 Konfiguracja

### Zmień mock database na Supabase
```typescript
// services/iframe/mockDatabase.ts → supabaseDatabase.ts
import { supabase } from '@/services/supabaseClient';

export const database = {
  sites: {
    findAll: async () => {
      const { data } = await supabase.from('iframe_sites').select('*');
      return data;
    },
    // ... inne metody
  }
};
```

### Dodaj nowe kategorie
```typescript
// types/iframe/core.types.ts
export type IframeSiteCategory =
  | 'Playgrounds'
  | 'APIs'
  | 'Education'
  | 'Media'
  | 'Maps'
  | 'Interactive'
  | 'Test'
  | 'Custom'
  | 'DevTools'     // NOWA
  | 'Documentation' // NOWA
  | 'Games';        // NOWA
```

### Zmień timeout testów
```typescript
const testService = new IframeTestService({
  timeout: 10000, // 10 sekund
  retries: 3,     // 3 próby
});
```

## 🐛 Troubleshooting

### Problem: "Cannot access iframe content (CORS)"
**Rozwiązanie:** Strona blokuje dostęp przez X-Frame-Options lub CSP. To normalne dla większości stron. Możesz:
- Użyć stron, które pozwalają na iframe (np. z listy)
- Dodać proxy server
- Użyć PostMessage API do komunikacji

### Problem: "Timeout (5s)"
**Rozwiązanie:** 
- Zwiększ timeout w IframeTestService
- Sprawdź czy strona rzeczywiście pozwala na iframe
- Sprawdź sandbox attributes

### Problem: API zwraca 404
**Rozwiązanie:**
- Upewnij się że dev server działa: `npm run dev -- --port 4378`
- Sprawdź ścieżkę: `/api/iframe/sites` (bez trailing slash)
- Sprawdź czy pliki API istnieją w `src/pages/api/iframe/`

## 📚 Dokumentacja

- **Typy:** `src/types/iframe/core.types.ts`
- **Services:** `src/services/iframe/`
- **API:** `src/pages/api/iframe/`
- **Architektura:** `IFRAME_ARCHITECTURE.md`

## 🚀 Deployment

```bash
# Build
npm run build

# Preview
npm run preview

# Deploy do Cloudflare Pages
npm run build
wrangler pages publish dist
```

## 🔒 Bezpieczeństwo

**Obecnie:**
- ✅ Sandbox attributes na iframe
- ✅ Origin validation w PostMessage
- ✅ Input validation w API

**Do dodania:**
- 🔜 Authentication (Supabase Auth)
- 🔜 Rate limiting
- 🔜 CORS headers
- 🔜 XSS protection
- 🔜 SQL injection prevention (obecnie mock DB)

---

**Status:** 5/10 funkcji ✅  
**Next:** TextSelectionService + Supabase integration  
**ETA:** 2-3 dni robocze
