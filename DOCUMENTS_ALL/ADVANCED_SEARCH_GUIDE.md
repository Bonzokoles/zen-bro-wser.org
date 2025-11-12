# 🔍 Advanced Search Guide - Tavily Integration

## Przegląd

ZENO Browser używa **Tavily API** do zaawansowanego wyszukiwania internetowego z AI. Wszystkie funkcje są dostępne przez `mcpService`.

---

## 🚀 Quick Start

### Podstawowe wyszukiwanie
```typescript
import { mcpService } from './services/mcpService';

// Proste wyszukiwanie
const results = await mcpService.chat('search for latest AI news');

// Bezpośrednie wywołanie
const searchResult = await mcpService.advancedSearch('artificial intelligence');
```

---

## 📋 Wszystkie opcje wyszukiwania

### 1. **advancedSearch()** - Pełna kontrola

```typescript
const results = await mcpService.advancedSearch('query', {
  // Liczba wyników (1-20)
  maxResults: 10,
  
  // Głębokość wyszukiwania
  searchDepth: 'basic',      // Szybsze (default)
  searchDepth: 'advanced',   // Dokładniejsze, wolniejsze
  
  // AI-generated answer
  includeAnswer: true,       // Default: true
  
  // Obrazy w wynikach
  includeImages: true,       // Default: false
  
  // Raw HTML content
  includeRawContent: true,   // Default: false
  
  // Zakres czasowy (dni wstecz)
  days: 7,                   // Ostatni tydzień
  days: 30,                  // Ostatni miesiąc
  
  // Filtrowanie domen
  includeDomains: ['github.com', 'stackoverflow.com'],
  excludeDomains: ['pinterest.com', 'facebook.com'],
  
  // Kategoria tematyczna
  topic: 'general',          // Default
  topic: 'news',            // Wiadomości
  topic: 'finance'          // Finanse
});
```

---

## 🎯 Quick Presets (Gotowe szablony)

### Wyszukiwanie wiadomości
```typescript
// Wiadomości z ostatnich 7 dni
const news = await mcpService.searchNews('OpenAI GPT-5', 7);

// Wiadomości z ostatniego miesiąca
const oldNews = await mcpService.searchNews('cryptocurrency', 30);
```

**Co robi:**
- `topic: 'news'`
- `searchDepth: 'advanced'`
- `includeAnswer: true`
- `maxResults: 10`

---

### Wyszukiwanie z obrazami
```typescript
const withImages = await mcpService.searchWithImages('northern lights photography');
```

**Co robi:**
- `includeImages: true`
- `includeAnswer: true`
- `maxResults: 10`

---

### Deep Search (Dogłębne wyszukiwanie)
```typescript
const deepResults = await mcpService.deepSearch('quantum computing algorithms');
```

**Co robi:**
- `searchDepth: 'advanced'`
- `includeAnswer: true`
- `includeRawContent: true`
- `maxResults: 15`

**Użycie:** Badania naukowe, analiza techniczna

---

### Wyszukiwanie w konkretnych domenach
```typescript
// Tylko GitHub i Stack Overflow
const devResults = await mcpService.searchDomain(
  'react hooks tutorial',
  ['github.com', 'stackoverflow.com']
);

// Tylko oficjalne dokumentacje
const docs = await mcpService.searchDomain(
  'Python async/await',
  ['python.org', 'docs.python.org', 'peps.python.org']
);
```

---

## 💡 Przykłady użycia

### 1. Badanie konkurencji (bez ich stron)
```typescript
const competitorAnalysis = await mcpService.advancedSearch(
  'best project management tools 2025',
  {
    excludeDomains: ['asana.com', 'monday.com', 'trello.com'],
    searchDepth: 'advanced',
    maxResults: 15
  }
);
```

---

### 2. Wyszukiwanie akademickie
```typescript
const academic = await mcpService.advancedSearch(
  'machine learning bias mitigation',
  {
    includeDomains: ['arxiv.org', 'scholar.google.com', 'ieee.org'],
    searchDepth: 'advanced',
    includeRawContent: true,
    maxResults: 20
  }
);
```

---

### 3. Wiadomości tech z obrazami
```typescript
const techNews = await mcpService.advancedSearch(
  'AI breakthroughs 2025',
  {
    topic: 'news',
    days: 14,
    includeImages: true,
    includeAnswer: true,
    maxResults: 12
  }
);
```

---

### 4. Szybkie sprawdzenie faktów
```typescript
const factCheck = await mcpService.advancedSearch(
  'climate change statistics 2025',
  {
    includeDomains: ['ipcc.ch', 'nasa.gov', 'noaa.gov'],
    searchDepth: 'advanced',
    includeAnswer: true
  }
);
```

---

## 📊 Struktura odpowiedzi

```typescript
{
  success: true,
  data: {
    results: [
      {
        title: "Page Title",
        url: "https://example.com",
        content: "Snippet of content...",
        score: 0.95,  // Relevance score (0-1)
        published_date: "2025-01-10"
      }
    ],
    answer: "AI-generated summary of results...",
    images: [
      {
        url: "https://...",
        description: "..."
      }
    ],
    query: "original query",
    response_time: 1.23,
    searchParams: {
      query: "...",
      depth: "basic",
      maxResults: 5,
      hasAnswer: true,
      hasImages: false
    }
  },
  toolsUsed: ['web_search']
}
```

---

## 🔧 Integracja w komponencie

### Przykład w React
```typescript
import { useState } from 'react';
import { mcpService } from '../services/mcpService';

function SearchComponent() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    try {
      // Użyj odpowiedniego presetu
      const response = await mcpService.searchNews(query, 7);
      
      if (response.success) {
        setResults(response.data.results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        onKeyPress={(e) => e.key === 'Enter' && handleSearch(e.target.value)}
      />
      {loading && <p>Searching...</p>}
      {results && results.map(r => (
        <div key={r.url}>
          <h3>{r.title}</h3>
          <p>{r.content}</p>
          <a href={r.url}>{r.url}</a>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎓 Best Practices

### ✅ Dobre praktyki

1. **Używaj presetów** dla typowych przypadków:
   ```typescript
   // Zamiast:
   advancedSearch('news', { topic: 'news', days: 7, searchDepth: 'advanced' })
   
   // Użyj:
   searchNews('news', 7)
   ```

2. **Filtruj domeny** dla lepszej jakości:
   ```typescript
   searchDomain('React tutorial', ['react.dev', 'github.com'])
   ```

3. **Używaj `searchDepth: 'basic'`** dla szybkich zapytań:
   ```typescript
   advancedSearch('quick fact', { searchDepth: 'basic' })
   ```

4. **Ograniczaj `maxResults`** dla lepszej wydajności:
   ```typescript
   advancedSearch('query', { maxResults: 5 }) // Wystarczy dla większości przypadków
   ```

---

### ❌ Unikaj

1. Nie używaj `includeRawContent` bez potrzeby (duże odpowiedzi)
2. Nie ustawiaj `maxResults > 20` (limit API)
3. Nie mieszaj `includeDomains` i `excludeDomains` (może dać 0 wyników)

---

## 🆘 Troubleshooting

### Brak wyników
```typescript
// Sprawdź czy klucz API jest ustawiony
if (!import.meta.env.VITE_TAVILY_API_KEY) {
  console.error('Tavily API key missing!');
}

// Upewnij się że mcpService jest zainicjalizowany
await mcpService.initialize({
  provider: 'gemini',
  apiKey: 'your-key'
});
```

### Błąd 401 (Unauthorized)
- Sprawdź klucz API w `.env.local`
- Upewnij się że klucz zaczyna się od `tvly-`

### Wolne wyszukiwanie
- Użyj `searchDepth: 'basic'` zamiast `'advanced'`
- Zmniejsz `maxResults`
- Wyłącz `includeRawContent`

---

## 📈 Limity API

**Darmowy tier (tvly-dev-...):**
- 1,000 wyszukiwań/miesiąc
- Max 5 wyników na zapytanie

**Produkcyjny tier (tvly-prod-...):**
- Sprawdź swój plan na https://app.tavily.com/billing
- Zazwyczaj: nielimitowane zapytania
- $0.002 per search (bardzo tanie!)

---

## 🔗 Więcej informacji

- **Tavily API Docs:** https://docs.tavily.com
- **Dashboard:** https://app.tavily.com
- **Pricing:** https://tavily.com/pricing

---

**Pytania?** Zobacz `mcpService.ts` lub `ToolExecutionService.ts` dla implementacji.
