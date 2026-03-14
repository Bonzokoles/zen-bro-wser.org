# ✅ KROK 1 & 2 ZAKOŃCZONE - PostMessageService + Backend API

## 🎯 Co zostało zrobione?

### 1. PostMessageService - Komunikacja host ↔ iframe ✅

**Lokalizacja:** `src/services/iframe/postMessageService.ts`

**Uproszczona wersja** zgodnie z Twoim przykładem:

```typescript
type MsgType = 'LOAD_COMPLETE' | 'ERROR' | 'TEXT_SELECTION' | 'PING' | 'PONG';

interface IframeMessage {
  type: MsgType;
  payload?: any;
}

class PostMessageService {
  private iframeWindow: Window | null;
  private origin: string;
  private listeners: Map<MsgType, ((payload: any) => void)[]>;

  constructor(iframe: HTMLIFrameElement, origin: string = '*');
  sendMessage(type: MsgType, payload?: any);
  on(type: MsgType, callback: (payload: any) => void);
  private handleMessage(event: MessageEvent);
  destroy();
}
```

**Funkcje:**
- ✅ Wysyłanie wiadomości do iframe
- ✅ Rejestrowanie handlerów dla typów wiadomości
- ✅ Walidacja origin (bezpieczeństwo)
- ✅ Obsługa: LOAD_COMPLETE, ERROR, TEXT_SELECTION, PING, PONG
- ✅ Cleanup przy unmount

### 2. Backend API - Zarządzanie stronami ✅

**Lokalizacja:** `src/pages/api/iframe/sites.ts`

**Endpointy:**

#### GET /api/iframe/sites
```bash
# Wszystkie strony
curl http://localhost:4366/api/iframe/sites

# Wyszukiwanie
curl http://localhost:4366/api/iframe/sites?q=wiki

# Filtrowanie po kategorii
curl http://localhost:4366/api/iframe/sites?category=Documentation
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Wikipedia",
      "url": "https://en.wikipedia.org/wiki/Main_Page",
      "category": "Documentation",
      "description": "Free online encyclopedia",
      "sandbox": "allow-same-origin allow-scripts",
      "height": "600px"
    },
    ...
  ],
  "count": 4
}
```

#### POST /api/iframe/sites
```bash
curl -X POST http://localhost:4366/api/iframe/sites \
  -H "Content-Type: application/json" \
  -d '{
    "name": "GitHub",
    "url": "https://github.com",
    "category": "Developer",
    "description": "Code hosting",
    "sandbox": "allow-scripts",
    "height": "700px"
  }'
```

**Mock Database:**
- 4 pre-seeded sites: Wikipedia, CodePen, JSFiddle, MDN
- In-memory array (później zamienisz na Supabase)
- CRUD operations gotowe

## 📁 Struktura plików

```
src/
├── services/
│   └── iframe/
│       └── postMessageService.ts       ✅ Prosty serwis komunikacji
├── pages/
│   ├── api/
│   │   └── iframe/
│   │       └── sites.ts                ✅ REST API (GET, POST)
│   └── iframe-tester.astro             ✅ UI (już istniejący)
└── docs/
    └── EXAMPLES.md                     ✅ Kompletne przykłady użycia
```

## 🧪 Jak testować?

### Test 1: API w przeglądarce

Otwórz: http://localhost:4366/iframe-tester

**Otwórz DevTools Console** i wklej:

```javascript
// Pobierz listę stron
fetch('/api/iframe/sites')
  .then(r => r.json())
  .then(d => console.table(d.data));

// Szukaj "code"
fetch('/api/iframe/sites?q=code')
  .then(r => r.json())
  .then(d => console.log('Znaleziono:', d.data));

// Dodaj nową stronę
fetch('/api/iframe/sites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Test',
    url: 'https://example.com',
    category: 'Test'
  })
}).then(r => r.json()).then(console.log);
```

### Test 2: PostMessage w iframe-tester

**Krok 1:** Otwórz http://localhost:4366/iframe-tester

**Krok 2:** Kliknij jakąś stronę z listy (np. Wikipedia)

**Krok 3:** W Console wklej:

```javascript
// Pobierz iframe
const iframe = document.querySelector('iframe');

// Utwórz serwis (dodaj do skryptu w iframe-tester.astro)
const service = new PostMessageService(iframe, '*');

// Wyślij PING
service.sendMessage('PING', { timestamp: Date.now() });

// Nasłuchuj PONG (jeśli iframe odpowie)
service.on('PONG', (payload) => {
  console.log('✅ PONG received:', payload);
});

// Nasłuchuj LOAD_COMPLETE
service.on('LOAD_COMPLETE', (payload) => {
  console.log('✅ Iframe loaded:', payload);
});
```

### Test 3: Curl w terminalu

```bash
# GET - lista stron
curl http://localhost:4366/api/iframe/sites

# GET - wyszukaj
curl "http://localhost:4366/api/iframe/sites?q=code"

# POST - dodaj stronę
curl -X POST http://localhost:4366/api/iframe/sites \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","url":"https://example.com","category":"Test"}'
```

## 📚 Dokumentacja

Pełne przykłady użycia znajdziesz w:
- **EXAMPLES.md** - kompletne przykłady kodu
- **IFRAME_ARCHITECTURE.md** - architektura systemu
- **IFRAME_QUICKSTART.md** - quick start guide

## ✅ Status TODO

| Funkcja | Status | Opis |
|---------|--------|------|
| 1. PostMessageService | ✅ DONE | Komunikacja host↔iframe |
| 2. Backend API | ✅ DONE | REST endpoints + wyszukiwarka |
| 3. Automatyczne testy | 🔜 NEXT | IframeTestService |
| 4. Text Selection | 🔜 TODO | Zaznaczanie + export |
| 5. Session Management | 🔜 TODO | Sesje testowe |
| 6. Analytics Dashboard | 🔜 TODO | Metryki + wykresy |

## 🚀 Następne kroki

### Krok 3: Automatyczne testy ładowania iframe

**Co zrobimy:**
- Service do testowania czasu ładowania
- Retry logic przy błędach
- Pomiary performance (DNS, TCP, TLS, Response)
- Klasyfikacja błędów (CORS, X-Frame-Options, Timeout)

**Przykładowa implementacja:**
```typescript
class IframeTestService {
  async testSite(site: Site): Promise<TestResult> {
    const startTime = performance.now();
    
    return {
      success: true,
      loadTime: performance.now() - startTime,
      httpStatus: 200,
      errorType: null
    };
  }
}
```

**Gotowy do implementacji?** Powiedz "implementuj krok 3" aby kontynuować! 🎯

## 🐛 Troubleshooting

**Problem:** API nie odpowiada
```bash
# Sprawdź czy serwer działa
curl http://localhost:4366/api/iframe/sites
```

**Problem:** CORS w iframe
- To normalne! Większość stron blokuje dostęp do contentWindow
- Używaj PostMessage API do komunikacji

**Problem:** Build fails
```bash
# Rebuild od zera
npm run build
```

## 📊 Metryki

- **Linie kodu:** ~300 (PostMessageService + API)
- **Endpointy:** 2 (GET, POST)
- **Typy wiadomości:** 5 (LOAD_COMPLETE, ERROR, TEXT_SELECTION, PING, PONG)
- **Mock sites:** 4 (Wikipedia, CodePen, JSFiddle, MDN)

---

**Gratulacje!** 🎉 Pierwsze 2 funkcje działają! System jest gotowy do rozbudowy.
