# PLAN INTEGRACJI: Deep Search + CAYD Search Engine

## 🎯 Cel
Połączenie Deep Search (Gemini AI) z CAYD Search Engine w jeden potężny system wyszukiwania:
- **CAYD** - przeszukuje web w czasie rzeczywistym
- **Gemini AI** - analizuje wyniki i generuje raporty
- **JIMBO Library** - zapisuje najlepsze wyniki do biblioteki

---

## 📋 Etapy Implementacji

### ETAP 1: Zunifikowany interfejs wyszukiwania
**Cel**: Jeden input do wszystkich źródeł

**Komponenty**:
```
[Unified Search Bar]
  ├─ Toggle: 🌐 Web (CAYD) | 📚 Library | 🔬 Deep Analysis
  ├─ Filters: Date, Type, Language
  └─ Button: 🚀 Search All Sources
```

**Implementacja**:
1. Nowy endpoint `/api/unified-search`
2. Przyjmuje: `query`, `sources` (array: ['web', 'library', 'ai'])
3. Zwraca: unified JSON z wszystkich źródeł

**Kod pseudo**:
```python
@app.get("/api/unified-search")
async def unified_search(
    query: str,
    sources: List[str] = ['web', 'library', 'ai'],
    limit: int = 50
):
    results = {
        'query': query,
        'web_results': [],
        'library_results': [],
        'ai_analysis': None
    }
    
    # 1. CAYD Search (localhost:6040)
    if 'web' in sources:
        cayd_response = await httpx.get(
            f"http://localhost:6040/api/search?q={query}"
        )
        results['web_results'] = cayd_response.json()
    
    # 2. Library Search
    if 'library' in sources:
        results['library_results'] = dashboard.search_items(query, limit)
    
    # 3. Gemini AI Analysis
    if 'ai' in sources:
        combined_data = results['web_results'] + results['library_results']
        results['ai_analysis'] = await analyze_with_gemini(query, combined_data)
    
    return results
```

---

### ETAP 2: Przepływ danych Web → AI → Library
**Cel**: Automatyczne wzbogacanie i zapisywanie wyników

**Flow**:
```
User Query
    ↓
1. CAYD Search (10-20 wyników z web)
    ↓
2. Gemini AI (filtruje + wzbogaca metadata)
    ↓
3. ISO 8000 Quality Check
    ↓
4. Save to LIBRARIES/ (tylko quality_score > 7)
    ↓
5. Display unified results
```

**Kod pseudo**:
```python
async def enriched_search_flow(query: str):
    # 1. Get web results
    web_results = await cayd_search(query, limit=20)
    
    # 2. AI enrichment
    for item in web_results:
        ai_metadata = await gemini_enrich(item)
        item['tags'] = ai_metadata['tags']
        item['keywords'] = ai_metadata['keywords']
        item['summary'] = ai_metadata['summary']
        item['quality_score'] = ai_metadata['quality']
    
    # 3. Save best results to library
    saved = []
    for item in web_results:
        if item['quality_score'] >= 7:
            agent = get_appropriate_agent(item['tags'])
            if agent.save_to_library(item):
                saved.append(item)
    
    return {
        'web_results': web_results,
        'saved_to_library': len(saved),
        'ai_report': await generate_report(query, web_results)
    }
```

---

### ETAP 3: Multi-source comparison view
**Cel**: Porównanie wyników z różnych źródeł side-by-side

**UI Layout**:
```
┌─────────────────────────────────────────────────┐
│  🔍 Unified Search: "AI trends 2024"            │
├─────────────────┬──────────────┬────────────────┤
│  🌐 Web (CAYD)  │  📚 Library  │  🔬 AI Analysis│
├─────────────────┼──────────────┼────────────────┤
│ 15 results      │ 42 results   │ Executive Sum. │
│ Real-time       │ Cached       │ Insights       │
│                 │              │ Recommendations│
│ [Save Best 5]   │ [Export]     │ [Full Report]  │
└─────────────────┴──────────────┴────────────────┘
```

**Features**:
- **Cross-highlight**: Click item → highlight duplicates in other columns
- **Quality badges**: 🟢 High (8-10) | 🟡 Medium (5-7) | 🔴 Low (0-4)
- **Quick actions**: 
  - 💾 Save to library
  - 🔄 Refresh from source
  - 📊 View full analysis
  - 🔗 Open in new tab

---

### ETAP 4: Smart Agent Assignment
**Cel**: Automatyczne kierowanie wyników do właściwych agentów

**Logic**:
```python
def assign_to_agent(item: Dict) -> str:
    """Determine which agent should handle this item"""
    
    tags = item.get('tags', [])
    keywords = item.get('keywords', [])
    
    # Pattern matching
    if any(k in tags for k in ['ai', 'ml', 'chatbot']):
        return 'ZBYCHU_1_B'  # Business
    
    elif any(k in tags for k in ['seo', 'marketing', 'ecommerce']):
        return 'ZBYCHU_1_M'  # Marketing
    
    elif any(k in tags for k in ['stock', 'crypto', 'finance']):
        return 'ZBYCHU_1F'  # Finance
    
    elif any(k in tags for k in ['research', 'quantum', 'biotech']):
        return 'ZBYCHU_1_T'  # Tech
    
    elif any(k in tags for k in ['film', 'cinema', 'movie']):
        return 'ZBYCHU_1_F'  # Film
    
    elif any(k in tags for k in ['art', 'museum', 'painting']):
        return 'ZBYCHU_1_A'  # Art
    
    else:
        return 'ZBYCHU_1_B'  # Default: Business
```

---

### ETAP 5: Real-time collaboration dashboard
**Cel**: Live monitoring wszystkich źródeł

**Dashboard Panels**:
```
┌────────────────────────────────────────────┐
│  📊 JIMBO UNIFIED SEARCH DASHBOARD         │
├────────────────────────────────────────────┤
│                                            │
│  🔴 LIVE: 3 searches active                │
│  ├─ "quantum computing" → 12 results       │
│  ├─ "e-commerce 2024" → 8 results          │
│  └─ "AI agents" → 5 results                │
│                                            │
│  📈 Stats (last hour):                     │
│  ├─ CAYD queries: 47                       │
│  ├─ Library hits: 234                      │
│  ├─ AI analyses: 12                        │
│  └─ Saved to library: 28                   │
│                                            │
│  🤖 Agents Status:                         │
│  ├─ Business: ✅ Active (last: 2m ago)     │
│  ├─ Marketing: ✅ Active (last: 5m ago)    │
│  ├─ Finance: ✅ Active (last: 1m ago)      │
│  └─ Tech: ⚠️  Idle (last: 45m ago)         │
│                                            │
└────────────────────────────────────────────┘
```

---

## 🗂️ Struktura Plików

```
JIMBO_INC_CONTROL_CENTER/
├── backend/
│   ├── dashboard_api.py           # Main FastAPI server
│   ├── unified_search.py          # NEW: Unified search logic
│   ├── gemini_enrichment.py       # NEW: AI enrichment service
│   ├── agent_router.py            # NEW: Smart agent assignment
│   └── zbychu_agents/
│       ├── base_agent.py          # Base class (already exists)
│       └── zbychu_1m_marketing.py # Marketing agent (already exists)
│
├── frontend/
│   └── unified_search_ui.html     # NEW: Unified search interface
│
└── jimbo_deep_sea_arch/           # Existing Deep Sea project
    └── services/
        └── geminiService.ts       # Reference for Gemini integration
```

---

## 🔧 API Endpoints (nowe)

### 1. Unified Search
```
GET /api/unified-search
Params:
  - query: str (required)
  - sources: List[str] = ['web', 'library', 'ai']
  - limit: int = 50
  - filters: JSON (optional)

Response:
{
  "query": "AI trends 2024",
  "web_results": [...],
  "library_results": [...],
  "ai_analysis": {
    "report": "...",
    "insights": [...],
    "recommendations": [...]
  },
  "stats": {
    "web_count": 15,
    "library_count": 42,
    "quality_distribution": {...}
  }
}
```

### 2. Enriched Save
```
POST /api/enriched-save
Body:
{
  "query": "...",
  "items": [...],
  "auto_assign_agents": true
}

Response:
{
  "saved": 12,
  "skipped_duplicates": 3,
  "agents_used": ["ZBYCHU_1_B", "ZBYCHU_1_M"],
  "quality_scores": [8, 9, 7, ...]
}
```

### 3. Live Search Monitor
```
GET /api/search-monitor
Response:
{
  "active_searches": [...],
  "stats_last_hour": {...},
  "agents_status": {...}
}
```

---

## 📦 Dependencies (nowe pakiety)

```bash
pip install markdown2        # Markdown rendering
pip install beautifulsoup4   # HTML parsing (dla CAYD results)
pip install asyncio          # Async operations
```

---

## 🎨 UI Components (nowe)

### 1. UnifiedSearchBar.html
```html
<div class="unified-search">
  <input id="searchQuery" placeholder="Search web, library, or analyze..."/>
  
  <div class="source-toggles">
    <label><input type="checkbox" checked value="web"/> 🌐 Web</label>
    <label><input type="checkbox" checked value="library"/> 📚 Library</label>
    <label><input type="checkbox" checked value="ai"/> 🔬 AI Analysis</label>
  </div>
  
  <button onclick="unifiedSearch()">🚀 Search All</button>
</div>
```

### 2. ResultsComparison.html
```html
<div class="results-grid">
  <div class="column web-results">...</div>
  <div class="column library-results">...</div>
  <div class="column ai-analysis">...</div>
</div>
```

---

## ⚡ Quick Start (implementacja krok po kroku)

### Dzień 1: Podstawowa integracja
1. ✅ Deep Search już działa
2. ✅ CAYD działa na port 6040
3. ⏭️ Dodaj endpoint `/api/unified-search`
4. ⏭️ Test z prostym query

### Dzień 2: AI Enrichment
1. ⏭️ Stwórz `gemini_enrichment.py`
2. ⏭️ Dodaj auto-tagging do wyników CAYD
3. ⏭️ Test quality scoring

### Dzień 3: UI Multi-source
1. ⏭️ Stwórz 3-column layout
2. ⏭️ Dodaj source toggles
3. ⏭️ Live comparison view

### Dzień 4: Smart Saving
1. ⏭️ Agent router logic
2. ⏭️ Auto-save best results
3. ⏭️ Duplicate detection

### Dzień 5: Monitoring Dashboard
1. ⏭️ Live stats endpoint
2. ⏭️ Agent status display
3. ⏭️ Real-time updates (WebSocket?)

---

## 🎯 Metryki Sukcesu

✅ **Przed integracją**:
- CAYD: 15 wyników z web
- Library: 42 wyniki z cache
- Deep Search: analiza AI

✅ **Po integracji**:
- Unified: 57 wyników (15+42) w jednym widoku
- AI enrichment: wszystkie wyniki mają quality_score
- Auto-save: top 10 wyników trafia do biblioteki
- Cross-reference: wykrywa duplikaty między źródłami

---

## 🔮 Future Enhancements

### Faza 2 (opcjonalne):
- **Vector Search**: Semantic search w bibliotece (Chroma DB)
- **Knowledge Graph**: Połączenia między tematami
- **Trend Analysis**: Wykrywanie emerging topics
- **Multi-language**: Tłumaczenie wyników on-the-fly
- **Export formats**: PDF reports, CSV data, JSON backup

### Faza 3 (advanced):
- **Voice Search**: Speech-to-text integration
- **Image Search**: Visual similarity w bibliotece
- **Collaborative Filtering**: "Users who searched X also searched Y"
- **Scheduled Research**: Automated daily/weekly reports
- **Slack/Discord Bot**: Search from chat

---

## 📝 Notes

- Gemini API key: już skonfigurowany w Deep Search
- CAYD port: 6040 (check if running: `http://localhost:6040/api/status`)
- Library path: `U:\JIMBO_INC_CONTROL_CENTER\LIBRARIES\`
- Agents: 6 aktywnych (Business, Marketing, Finance, Tech, Film, Art)

**Priorytet**: Etap 1 + Etap 2 (unified search + AI enrichment) = największa wartość przy najmniejszym wysiłku

---

## 🚀 START: Pierwszy endpoint do implementacji

Skopiuj to do VSCode i zacznij od `/api/unified-search`:

```python
# backend/unified_search.py
import httpx
from typing import List, Dict
from dashboard_libraries import LibrariesDashboard

dashboard = LibrariesDashboard()

async def unified_search(
    query: str,
    sources: List[str] = ['web', 'library', 'ai'],
    limit: int = 50
) -> Dict:
    """
    Unified search across all sources
    """
    results = {
        'query': query,
        'web_results': [],
        'library_results': [],
        'ai_analysis': None,
        'stats': {}
    }
    
    # CAYD Web Search
    if 'web' in sources:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"http://localhost:6040/api/search?q={query}&limit={limit}"
                )
                if response.status_code == 200:
                    results['web_results'] = response.json()
        except Exception as e:
            results['web_results'] = {'error': str(e)}
    
    # Library Search
    if 'library' in sources:
        results['library_results'] = dashboard.search_items(query, limit)
    
    # AI Analysis (tylko jeśli są wyniki)
    if 'ai' in sources and (results['web_results'] or results['library_results']):
        # TODO: Implement Gemini analysis
        pass
    
    # Stats
    results['stats'] = {
        'web_count': len(results['web_results']) if isinstance(results['web_results'], list) else 0,
        'library_count': len(results['library_results']),
        'total': len(results['web_results']) + len(results['library_results']) if isinstance(results['web_results'], list) else len(results['library_results'])
    }
    
    return results
```

**Następny krok**: Dodaj endpoint do `dashboard_api.py`:
```python
from unified_search import unified_search

@app.get("/api/unified-search")
async def api_unified_search(
    query: str = Query(..., min_length=3),
    sources: str = Query("web,library,ai")
):
    source_list = sources.split(',')
    return await unified_search(query, source_list)
```

Test: `http://localhost:8001/api/unified-search?query=AI%20trends&sources=web,library`
