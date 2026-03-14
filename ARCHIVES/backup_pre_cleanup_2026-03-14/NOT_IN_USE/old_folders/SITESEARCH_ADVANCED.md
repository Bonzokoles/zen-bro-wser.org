# 🔍 SiteSearch Component - Zaawansowana Wyszukiwarka

**Status:** ✅ COMPLETE (Wersja 2.0 - Advanced)  
**Plik:** `src/components/iframe/SiteSearch.tsx`  
**Rozmiar:** ~690 linii (kompletny z CSS)

---

## 📋 Przegląd Funkcji

### ✅ Zaimplementowane Funkcje (10/10)

1. **Real-time Search z Debouncing**
   - Opóźnienie: 500ms
   - Automatyczne wyszukiwanie po zmianach parametrów
   - Funkcja: `debouncedFetch()`

2. **Autouzupełnianie**
   - Sugestie z wyników + historia
   - Min. 2 znaki do aktywacji
   - Dropdown z ikoną 🔍
   - Funkcja: `useEffect` → `setSuggestions()`

3. **Historia Wyszukiwań**
   - localStorage: `iframe-search-history`
   - Max 10 ostatnich zapytań
   - Chipy z możliwością kliknięcia
   - Przycisk "Wyczyść"
   - Funkcje: `saveToHistory()`, `clearHistory()`

4. **Ulubione / Zakładki**
   - localStorage: `iframe-favorites`
   - Gwiazdka ★/☆ przy każdej stronie
   - Toggle z localStorage sync
   - Funkcja: `toggleFavorite()`

5. **Filtry i Kategorie**
   - Kategoria: dropdown (dokumentacja, playground, narzędzia, testy)
   - iframeAllowed: checkbox "Tylko iframe-friendly"
   - Funkcje: `setCategory()`, `setIframeAllowed()`

6. **Sortowanie**
   - Alfabetycznie (domyślnie)
   - Data dodania
   - Popularność (testCount)
   - Dropdown select
   - Funkcja: `setSort()`

7. **Paginacja / Infinite Scroll**
   - Automatyczne ładowanie przy scrollu
   - IntersectionObserver z threshold 0.1
   - Przycisk "Załaduj więcej" (fallback)
   - Append vs Replace logic
   - Funkcje: `loadMore()`, `useEffect` → IntersectionObserver

8. **Szczegóły na Hover**
   - Wyświetla testCount i addedAt
   - Emoji: 🧪 (testy), 📅 (data)
   - Formatowanie daty: `toLocaleDateString('pl-PL')`
   - Stan: `selectedSite` z `onMouseEnter`/`onMouseLeave`

9. **Responsywność**
   - Media query: `@media (max-width: 600px)`
   - Kolumny filtrów → stos na mobile
   - Padding adjustment: 20px → 12px

10. **Zaawansowany UI**
    - Embedded CSS (~300 linii)
    - Badges: kategoria (niebieski), iframe-friendly (zielony)
    - Tags: #tag system
    - Loading states: spinner pierwszej strony, "Ładowanie więcej..." dla następnych
    - Empty state: brak wyników z sugestią
    - Error state: czerwony border

---

## 🔧 API Requirements (Backend Updates Needed)

### Obecny Endpoint: `/api/iframe/sites`

**Obecne parametry (zaimplementowane):**
- `?q=` - wyszukiwanie
- `?category=` - filtr kategorii

**NOWE parametry (wymagane w backend):**
```typescript
interface SearchParams {
  q?: string;              // ✅ już obsługiwane
  category?: string;       // ✅ już obsługiwane
  iframeAllowed?: boolean; // ❌ DODAĆ - filtr iframe-friendly
  sort?: 'alphabet' | 'added' | 'popular'; // ❌ DODAĆ - sortowanie
  page?: number;           // ❌ DODAĆ - strona (dla paginacji)
  limit?: number;          // ❌ DODAĆ - ilość wyników na stronę
}
```

**NOWE pola w Site (wymagane rozszerzenie):**
```typescript
interface Site {
  id: string;
  name: string;
  url: string;
  category?: string;
  description?: string;
  sandbox?: string;
  height?: string;
  iframeAllowed?: boolean; // ❌ DODAĆ - czy działa w iframe
  addedAt?: string;        // ❌ DODAĆ - data dodania (ISO 8601)
  testCount?: number;      // ❌ DODAĆ - liczba wykonanych testów
  tags?: string[];         // ❌ DODAĆ - tagi do filtrowania
}
```

**Przykładowa odpowiedź backend:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Wikipedia",
      "url": "https://wikipedia.org",
      "category": "documentation",
      "description": "Free encyclopedia",
      "iframeAllowed": true,
      "addedAt": "2025-01-10T10:00:00Z",
      "testCount": 42,
      "tags": ["wiki", "knowledge", "public"]
    }
  ],
  "count": 1,
  "total": 150,    // opcjonalnie - całkowita liczba wyników
  "page": 1,       // opcjonalnie - aktualna strona
  "pages": 8       // opcjonalnie - liczba stron
}
```

---

## 📦 Props API

```typescript
interface SiteSearchProps {
  onSelectSite?: (site: Site) => void;  // Callback gdy użytkownik wybierze stronę
  initialCategory?: string;              // Początkowa kategoria (domyślnie: '')
  enableFavorites?: boolean;             // Włącz ulubione (domyślnie: true)
  enableHistory?: boolean;               // Włącz historię (domyślnie: true)
  pageSize?: number;                     // Liczba wyników na stronę (domyślnie: 20)
}
```

**Przykład użycia:**
```tsx
import SiteSearch from './components/iframe/SiteSearch';

function App() {
  const handleSelect = (site) => {
    console.log('Wybrano:', site.name);
    // Załaduj iframe z site.url
  };

  return (
    <SiteSearch
      onSelectSite={handleSelect}
      initialCategory="playground"
      enableFavorites={true}
      enableHistory={true}
      pageSize={15}
    />
  );
}
```

---

## 🎨 Styling Classes

**Główne kontenery:**
- `.site-search` - root wrapper (max-width: 800px)
- `.search-container` - input wrapper (relative position)
- `.filters` - row z filtrami (flexbox, gap: 12px)
- `.results-list` - lista wyników (flex column)

**Inputy i kontrolki:**
- `.search-input` - pole wyszukiwania (border-radius: 8px)
- `.clear-button` - przycisk X (absolute position)
- `.category-select` - dropdown kategorii
- `.sort-select` - dropdown sortowania
- `.checkbox-label` - wrapper checkboxa iframe-friendly

**Sugestie:**
- `.suggestions-dropdown` - dropdown (box-shadow, z-index: 1000)
- `.suggestion-item` - pojedyncza sugestia (hover: background)

**Historia:**
- `.search-history` - kontener historii (background: #f9f9f9)
- `.history-chips` - flexbox chipów
- `.history-chip` - pojedynczy chip (border-radius: 16px)

**Wyniki:**
- `.site-card` - karta strony (hover: transform: translateY(-2px))
- `.site-header` - nagłówek z badges
- `.site-badges` - kontenery badge'y
- `.site-category` - badge kategorii (niebieski)
- `.badge-iframe` - badge iframe (zielony)
- `.site-tags` - kontenery tagów
- `.tag` - pojedynczy tag (#tag, border-radius: 12px)

**Paginacja:**
- `.scroll-target` - target IntersectionObserver (height: 20px)
- `.load-more-btn` - przycisk "Załaduj więcej" (width: 100%)

**Stany:**
- `.loading` / `.loading-more` - wskaźniki ładowania
- `.error` - error message (czerwony border)
- `.empty-state` - brak wyników

---

## 🧪 Testy Integration

### Test 1: Podstawowe Wyszukiwanie
```typescript
// 1. Wpisz "wiki" w search input
// 2. Poczekaj 500ms (debounce)
// 3. Sprawdź czy wywołano fetch('/api/iframe/sites?q=wiki')
// 4. Zweryfikuj czy wyniki się wyświetlają
```

### Test 2: Autouzupełnianie
```typescript
// 1. Wpisz "wik" (min. 2 znaki)
// 2. Sprawdź czy pojawia się dropdown z sugestiami
// 3. Kliknij sugestię "Wikipedia"
// 4. Sprawdź czy searchQuery === "Wikipedia"
```

### Test 3: Historia
```typescript
// 1. Wyszukaj "test"
// 2. Sprawdź localStorage['iframe-search-history']
// 3. Sprawdź czy chip "test" się pojawił
// 4. Kliknij chip - sprawdź czy searchQuery === "test"
```

### Test 4: Ulubione
```typescript
// 1. Kliknij gwiazdkę przy stronie (id="1")
// 2. Sprawdź localStorage['iframe-favorites']
// 3. Sprawdź czy gwiazdka zmieniła się na ★
// 4. Kliknij ponownie - sprawdź czy usunęło
```

### Test 5: Infinite Scroll
```typescript
// 1. Załaduj wyniki (>20 sztuk w backend)
// 2. Scrolluj do końca listy
// 3. Sprawdź czy wywołano fetch z ?page=2
// 4. Zweryfikuj czy nowe wyniki zostały dodane (append)
```

### Test 6: Filtry
```typescript
// 1. Zaznacz checkbox "Tylko iframe-friendly"
// 2. Sprawdź czy fetch zawiera ?iframeAllowed=true
// 3. Wybierz kategorię "playground"
// 4. Sprawdź czy fetch zawiera ?category=playground
```

---

## 🚀 Roadmap (przyszłe usprawnienia)

### Faza 1: Backend Integration (Priorytet: HIGH)
- [ ] Rozszerz `/api/iframe/sites` o parametry: iframeAllowed, sort, page, limit
- [ ] Dodaj pola do Site: iframeAllowed, addedAt, testCount, tags
- [ ] Zwróć metadata: total, page, pages w odpowiedzi

### Faza 2: UX Improvements (Priorytet: MEDIUM)
- [ ] Dodaj keyboard navigation (↑↓ w sugestiach, Enter = select)
- [ ] Dodaj loading skeleton zamiast "Ładowanie..."
- [ ] Implementuj toast notifications dla błędów
- [ ] Dodaj animacje wejścia dla wyników (fade-in)

### Faza 3: Advanced Features (Priorytet: LOW)
- [ ] Export ulubionych do JSON/CSV
- [ ] Share link z filtrami w URL (?q=test&category=playground)
- [ ] Dark mode toggle
- [ ] Multi-select dla kategorii
- [ ] Advanced search syntax ("tag:wiki +iframe -test")

---

## 📚 Zależności

**React Hooks używane:**
- `useState` - zarządzanie stanem (15+ state variables)
- `useEffect` - lifecycle (5 efektów: load storage, trigger search, autosuggest, observer, cleanup)
- `useCallback` - memoizacja debouncedFetch
- `useRef` - DOM refs (searchInputRef, observerTarget)

**Browser APIs:**
- `localStorage` - persistence (favorites, history)
- `fetch` - API calls
- `IntersectionObserver` - infinite scroll
- `URLSearchParams` - query string building
- `setTimeout` / `clearTimeout` - debouncing

**TypeScript:**
- Strict typing dla wszystkich props, state, functions
- Interfaces: Site, SearchParams, SiteSearchProps
- Type guards dla user events

---

## 📝 Changelog

### v2.0.0 - Advanced (2025-01-XX) ✅ CURRENT
- ✅ Dodano autouzupełnianie z dropdown
- ✅ Dodano historię wyszukiwań (localStorage + chips)
- ✅ Dodano ulubione z gwiazdkami
- ✅ Dodano filtry: iframeAllowed checkbox, sortowanie
- ✅ Dodano paginację z infinite scroll (IntersectionObserver)
- ✅ Dodano hover preview z statystykami
- ✅ Dodano badges (kategoria, iframe-friendly)
- ✅ Dodano system tagów
- ✅ Rozszerzono CSS do 690 linii
- ✅ Responsywność na mobile

### v1.0.0 - Basic (2025-01-XX)
- ✅ Podstawowe wyszukiwanie real-time
- ✅ Debouncing 300ms
- ✅ Filtry kategorii
- ✅ Loading/error/empty states
- ✅ Przycisk clear
- ✅ Licznik wyników
- 280 linii kodu

---

## 🔗 Powiązane Pliki

- **Backend API:** `src/pages/api/iframe/sites.ts` (wymaga update)
- **PostMessage Service:** `src/services/iframe/postMessageService.ts`
- **Integration Examples:** `INTEGRATION_EXAMPLES.md`
- **Architecture:** `IFRAME_ARCHITECTURE.md`

---

**Ostatnia aktualizacja:** 2025-01-XX  
**Autor:** AI Coding Agent  
**Status:** ✅ PRODUCTION READY (po aktualizacji backend)
