// src/active/services/omnisearch.ts
import type { Tab } from '../components/Browser';
// Assuming Bookmark and HistoryEntry interfaces are also in Browser.tsx
// In a real app, these would be in their own type definition files.
import type { Bookmark, HistoryEntry } from '../components/Browser';

export interface SearchResult {
  type: 'bookmark' | 'history' | 'tab';
  title: string;
  url: string;
  score: number; // A simple scoring mechanism
  favicon?: string;
}

export class OmniSearch {
  
  // These would be passed in the constructor in a real app
  private bookmarks: Bookmark[] = [];
  private history: HistoryEntry[] = [];
  private tabs: Tab[] = [];

  constructor(bookmarks: Bookmark[], history: HistoryEntry[], tabs: Tab[]) {
    this.bookmarks = bookmarks;
    this.history = history;
    this.tabs = tabs;
  }

  async search(query: string): Promise<SearchResult[]> {
    if (query.length < 2) {
      return [];
    }

    const lowerQuery = query.toLowerCase();

    const bookmarkResults = this.searchBookmarks(lowerQuery);
    const historyResults = this.searchHistory(lowerQuery);
    const tabResults = this.searchTabs(lowerQuery);

    const results = [...bookmarkResults, ...historyResults, ...tabResults];

    // Deduplicate results by URL, keeping the one with the highest score
    const deduplicated = new Map<string, SearchResult>();
    for (const result of results) {
      const existing = deduplicated.get(result.url);
      if (!existing || result.score > existing.score) {
        deduplicated.set(result.url, result);
      }
    }

    const finalResults = Array.from(deduplicated.values());

    // Sort by relevance score
    finalResults.sort((a, b) => b.score - a.score);

    return finalResults.slice(0, 10);
  }

  private searchBookmarks(query: string): SearchResult[] {
    return this.bookmarks
      .filter(b => b.title.toLowerCase().includes(query) || b.url.toLowerCase().includes(query))
      .map(b => ({
        type: 'bookmark',
        title: b.title,
        url: b.url,
        score: 0.8, // Higher score for bookmarks
        favicon: b.favicon
      }));
  }

  private searchHistory(query: string): SearchResult[] {
    return this.history
      .filter(h => h.title.toLowerCase().includes(query) || h.url.toLowerCase().includes(query))
      .map(h => ({
        type: 'history',
        title: h.title,
        url: h.url,
        score: 0.7, // Medium score for history
        favicon: h.favicon
      }));
  }

  private searchTabs(query: string): SearchResult[] {
    return this.tabs
      .filter(t => t.title.toLowerCase().includes(query) || t.url.toLowerCase().includes(query))
      .map(t => ({
        type: 'tab',
        title: t.title,
        url: t.url,
        score: 0.9, // Highest score for open tabs
        favicon: t.favicon
      }));
  }
}
