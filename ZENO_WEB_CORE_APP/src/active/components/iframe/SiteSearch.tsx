/**
 * SiteSearch Component - ZAAWANSOWANA wyszukiwarka stron iframe
 * 
 * Funkcje:
 * ✅ Real-time search z debouncing (500ms)
 * ✅ Filtry: kategoria, iframeAllowed, popularność
 * ✅ Sortowanie: alfabetycznie, data dodania, popularność
 * ✅ Paginacja / infinite scroll
 * ✅ Autouzupełnianie podczas wpisywania
 * ✅ Historia wyszukiwań (localStorage)
 * ✅ Ulubione (localStorage)
 * ✅ Szczegóły na hover
 * ✅ Responsywność
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';

// ============================================
// TYPES
// ============================================

interface Site {
  id: string;
  name: string;
  url: string;
  category?: string;
  description?: string;
  sandbox?: string;
  height?: string;
  iframeAllowed?: boolean;
  addedAt?: string;
  testCount?: number;
  tags?: string[];
}

interface SearchParams {
  q?: string;
  category?: string;
  iframeAllowed?: boolean;
  sort?: 'alphabet' | 'added' | 'popular';
  page?: number;
  limit?: number;
}

interface SiteSearchProps {
  onSelectSite?: (site: Site) => void;
  initialCategory?: string;
  enableFavorites?: boolean;
  enableHistory?: boolean;
  pageSize?: number;
}

// ============================================
// HELPER: Debounce
// ============================================

function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ============================================
// COMPONENT
// ============================================

export default function SiteSearch({
  onSelectSite,
  initialCategory = '',
  enableFavorites = true,
  enableHistory = true,
  pageSize = 20
}: SiteSearchProps) {
  // Search params
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [iframeAllowed, setIframeAllowed] = useState(false);
  const [sort, setSort] = useState<'alphabet' | 'added' | 'popular'>('alphabet');
  
  // Results
  const [results, setResults] = useState<Site[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // ============================================
  // LIFECYCLE: Load favorites & history
  // ============================================
  
  useEffect(() => {
    if (enableFavorites) {
      const saved = localStorage.getItem('iframe-favorites');
      if (saved) setFavorites(JSON.parse(saved));
    }
    
    if (enableHistory) {
      const saved = localStorage.getItem('iframe-search-history');
      if (saved) setSearchHistory(JSON.parse(saved));
    }
  }, [enableFavorites, enableHistory]);

  // ============================================
  // API: Fetch sites
  // ============================================

  const fetchSites = async (params: SearchParams) => {
    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/iframe/sites', window.location.origin);
      
      if (params.q) url.searchParams.append('q', params.q);
      if (params.category) url.searchParams.append('category', params.category);
      if (params.iframeAllowed !== undefined) url.searchParams.append('iframeAllowed', String(params.iframeAllowed));
      if (params.sort) url.searchParams.append('sort', params.sort);
      if (params.page) url.searchParams.append('page', String(params.page));
      if (params.limit) url.searchParams.append('limit', String(params.limit));

      const res = await fetch(url.toString());
      const data = await res.json();

      if (data.success) {
        const newResults = data.data || [];
        
        // Append or replace results based on page
        if (params.page && params.page > 1) {
          setResults(prev => [...prev, ...newResults]);
        } else {
          setResults(newResults);
        }
        
        // Check if more results available
        setHasMore(newResults.length === (params.limit || pageSize));
      } else {
        setError(data.error || 'Failed to fetch sites');
        setResults([]);
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DEBOUNCED SEARCH
  // ============================================

  const debouncedFetch = useCallback(
    debounce((q: string, c: string, iframe: boolean, s: string, p: number) => {
      fetchSites({ 
        q, 
        category: c, 
        iframeAllowed: iframe, 
        sort: s as any, 
        page: p, 
        limit: pageSize 
      });
    }, 500),
    [pageSize]
  );

  // Trigger search on param changes
  useEffect(() => {
    setPage(1);
    debouncedFetch(searchQuery, category, iframeAllowed, sort, 1);
    
    // Save to history
    if (searchQuery.trim() && enableHistory) {
      saveToHistory(searchQuery);
    }
  }, [searchQuery, category, iframeAllowed, sort, enableHistory]);

  // ============================================
  // AUTOUZUPEŁNIANIE
  // ============================================

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Generate suggestions from results + history
    const resultNames = results.map(r => r.name);
    const allSuggestions = [...resultNames, ...searchHistory];
    
    const filtered = allSuggestions
      .filter(name => name.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter((v, i, a) => a.indexOf(v) === i) // unique
      .slice(0, 5);
    
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [searchQuery, results, searchHistory]);

  // ============================================
  // HISTORY & FAVORITES
  // ============================================

  const saveToHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('iframe-search-history', JSON.stringify(newHistory));
  };

  const toggleFavorite = (siteId: string) => {
    const newFavorites = favorites.includes(siteId)
      ? favorites.filter(id => id !== siteId)
      : [...favorites, siteId];
    
    setFavorites(newFavorites);
    localStorage.setItem('iframe-favorites', JSON.stringify(newFavorites));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('iframe-search-history');
  };

  // ============================================
  // PAGINATION
  // ============================================

  const loadMore = () => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSites({ 
      q: searchQuery, 
      category, 
      iframeAllowed, 
      sort, 
      page: nextPage, 
      limit: pageSize 
    });
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, page]);

  // ============================================
  // SITE SELECTION
  // ============================================

  const handleSelectSite = (site: Site) => {
    setSelectedSite(site);
    
    if (onSelectSite) {
      onSelectSite(site);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="site-search">
      {/* Search input with autocomplete */}
      <div className="search-container">
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder="Szukaj strony... (min. 2 znaki)"
          className="search-input"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              searchInputRef.current?.focus();
            }}
            className="clear-button"
            aria-label="Wyczyść wyszukiwanie"
          >
            ✕
          </button>
        )}

        {/* Autocomplete suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="suggestion-item"
                onClick={() => {
                  setSearchQuery(suggestion);
                  setShowSuggestions(false);
                }}
              >
                🔍 {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced filters */}
      <div className="filters">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="">Wszystkie kategorie</option>
          <option value="documentation">Dokumentacja</option>
          <option value="playground">Playground</option>
          <option value="tools">Narzędzia</option>
          <option value="testing">Testy</option>
        </select>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={iframeAllowed}
            onChange={(e) => setIframeAllowed(e.target.checked)}
          />
          <span>Tylko iframe-friendly</span>
        </label>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'alphabet' | 'added' | 'popular')}
          className="sort-select"
        >
          <option value="alphabet">Alfabetycznie</option>
          <option value="added">Data dodania</option>
          <option value="popular">Popularność</option>
        </select>
      </div>

      {/* Search history */}
      {enableHistory && searchHistory.length > 0 && (
        <div className="search-history">
          <div className="history-header">
            <span>Ostatnie wyszukiwania:</span>
            <button onClick={clearHistory} className="clear-history-btn">
              Wyczyść
            </button>
          </div>
          <div className="history-chips">
            {searchHistory.slice(0, 5).map((query, idx) => (
              <button
                key={idx}
                className="history-chip"
                onClick={() => setSearchQuery(query)}
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && page === 1 && <div className="loading">Wyszukiwanie...</div>}

      {/* Error state */}
      {error && (
        <div className="error">
          <p>Błąd: {error}</p>
        </div>
      )}

      {/* Results count */}
      {!loading && !error && (
        <div className="results-count">
          Znaleziono: {results.length} {results.length === 1 ? 'stronę' : 'stron'}
          {hasMore && ' (więcej dostępnych)'}
        </div>
      )}

      {/* Results list */}
      <div className="results-list">
        {!loading && !error && results.length === 0 && (
          <div className="empty-state">
            <p>Brak wyników dla "{searchQuery}"</p>
            <p className="empty-hint">Spróbuj innej frazy lub wybierz inną kategorię</p>
          </div>
        )}

        {results.map((site) => (
          <div
            key={site.id}
            className="site-card"
            onClick={() => handleSelectSite(site)}
            onMouseEnter={() => setSelectedSite(site)}
            onMouseLeave={() => setSelectedSite(null)}
          >
            <div className="site-header">
              <h3>{site.name}</h3>
              <div className="site-badges">
                <span className="site-category">{site.category}</span>
                {site.iframeAllowed && (
                  <span className="badge-iframe" title="Obsługuje iframe">
                    ✓ iframe
                  </span>
                )}
              </div>
            </div>
            <p className="site-description">{site.description}</p>
            <div className="site-footer">
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="site-link"
                onClick={(e) => e.stopPropagation()}
              >
                {site.url}
              </a>
              {enableFavorites && (
                <button
                  className={`favorite-btn ${favorites.includes(site.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(site.id);
                  }}
                  title={favorites.includes(site.id) ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                >
                  {favorites.includes(site.id) ? '★' : '☆'}
                </button>
              )}
            </div>
            {site.tags && site.tags.length > 0 && (
              <div className="site-tags">
                {site.tags.map((tag, idx) => (
                  <span key={idx} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Hover preview */}
            {selectedSite?.id === site.id && (
              <div className="site-preview">
                <div className="preview-stats">
                  {site.testCount !== undefined && (
                    <span>🧪 Testów: {site.testCount}</span>
                  )}
                  {site.addedAt && (
                    <span>📅 {new Date(site.addedAt).toLocaleDateString('pl-PL')}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading more indicator */}
        {loading && page > 1 && (
          <div className="loading-more">Ładowanie więcej...</div>
        )}

        {/* Infinite scroll target */}
        {hasMore && !loading && (
          <div ref={observerTarget} className="scroll-target" />
        )}

        {/* Load more button (fallback) */}
        {hasMore && !loading && (
          <button onClick={loadMore} className="load-more-btn">
            Załaduj więcej
          </button>
        )}
      </div>

      {/* Embedded CSS */}
      <style>{`
        .site-search {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Search container */
        .search-container {
          position: relative;
          margin-bottom: 16px;
        }

        .search-input {
          width: 100%;
          padding: 12px 40px 12px 16px;
          font-size: 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #4a90e2;
          box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
        }

        .clear-button {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 20px;
          color: #999;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .clear-button:hover {
          background: #f0f0f0;
          color: #666;
        }

        /* Suggestions dropdown */
        .suggestions-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-top: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }

        .suggestion-item {
          padding: 10px 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .suggestion-item:hover {
          background: #f5f5f5;
        }

        /* Filters */
        .filters {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .category-select,
        .sort-select {
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-label input {
          cursor: pointer;
        }

        /* Search history */
        .search-history {
          margin-bottom: 16px;
          padding: 12px;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 14px;
          color: #666;
        }

        .clear-history-btn {
          background: none;
          border: none;
          color: #e74c3c;
          cursor: pointer;
          font-size: 12px;
        }

        .history-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .history-chip {
          padding: 4px 12px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 16px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .history-chip:hover {
          background: #4a90e2;
          color: white;
          border-color: #4a90e2;
        }

        /* Results count */
        .results-count {
          margin-bottom: 12px;
          font-size: 14px;
          color: #666;
        }

        /* Loading & Error */
        .loading, .loading-more {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .error {
          padding: 16px;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 8px;
          color: #c33;
          margin-bottom: 16px;
        }

        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #999;
        }

        .empty-hint {
          font-size: 14px;
          margin-top: 8px;
        }

        /* Results list */
        .results-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .site-card {
          padding: 16px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .site-card:hover {
          border-color: #4a90e2;
          box-shadow: 0 4px 12px rgba(74, 144, 226, 0.15);
          transform: translateY(-2px);
        }

        .site-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 8px;
        }

        .site-header h3 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }

        .site-badges {
          display: flex;
          gap: 8px;
        }

        .site-category {
          padding: 4px 8px;
          background: #e3f2fd;
          color: #1976d2;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .badge-iframe {
          padding: 4px 8px;
          background: #e8f5e9;
          color: #388e3c;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .site-description {
          margin: 8px 0;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        .site-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 12px;
        }

        .site-link {
          color: #4a90e2;
          text-decoration: none;
          font-size: 14px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 70%;
        }

        .site-link:hover {
          text-decoration: underline;
        }

        .favorite-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #ccc;
          transition: color 0.2s;
        }

        .favorite-btn:hover,
        .favorite-btn.active {
          color: #ffd700;
        }

        .site-tags {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .tag {
          padding: 2px 8px;
          background: #f0f0f0;
          border-radius: 12px;
          font-size: 11px;
          color: #666;
        }

        .site-preview {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #eee;
        }

        .preview-stats {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #666;
        }

        /* Pagination */
        .scroll-target {
          height: 20px;
        }

        .load-more-btn {
          width: 100%;
          padding: 12px;
          background: #4a90e2;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .load-more-btn:hover {
          background: #357abd;
        }

        /* Responsive */
        @media (max-width: 600px) {
          .site-search {
            padding: 12px;
          }

          .filters {
            flex-direction: column;
          }

          .category-select,
          .sort-select {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
