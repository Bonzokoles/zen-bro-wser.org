/**
 * Marketplace Service
 * Plugin discovery, search, and rating system.
 */

import type { PluginManifest } from '../api/plugin-api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarketplaceEntry {
  manifest: PluginManifest;
  moduleUrl: string;
  rating: number;       // 0–5
  ratingCount: number;
  downloads: number;
  featured: boolean;
  publishedAt: number;
  updatedAt: number;
  screenshots?: string[];
}

export interface MarketplaceSearchOptions {
  query?: string;
  category?: string;
  sortBy?: 'rating' | 'downloads' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface MarketplaceSearchResult {
  entries: MarketplaceEntry[];
  total: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class MarketplaceService {
  private catalogUrl: string;
  private localCatalog: MarketplaceEntry[] | null = null;

  constructor(catalogUrl = 'https://plugins.zeno-browser.io/catalog.json') {
    this.catalogUrl = catalogUrl;
  }

  // ─── Catalog ───────────────────────────────────────────────────────────────

  /**
   * Fetches the full plugin catalog from the remote registry.
   * Falls back to the cached local catalog if the network is unavailable.
   */
  async fetchCatalog(): Promise<MarketplaceEntry[]> {
    try {
      const response = await fetch(this.catalogUrl, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(8_000),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = (await response.json()) as MarketplaceEntry[];
      this.localCatalog = data;
      return data;
    } catch (err) {
      console.warn('[MarketplaceService] Network unavailable, using cached catalog:', err);
      return this.localCatalog ?? [];
    }
  }

  // ─── Search ────────────────────────────────────────────────────────────────

  async search(options: MarketplaceSearchOptions = {}): Promise<MarketplaceSearchResult> {
    const catalog = await this.fetchCatalog();
    const {
      query = '',
      category,
      sortBy = 'rating',
      sortOrder = 'desc',
      limit = 20,
      offset = 0,
    } = options;

    let entries = catalog;

    // Text filter
    if (query.trim()) {
      const lq = query.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.manifest.name.toLowerCase().includes(lq) ||
          e.manifest.description.toLowerCase().includes(lq) ||
          e.manifest.author.toLowerCase().includes(lq) ||
          (e.manifest.categories ?? []).some((c) => c.toLowerCase().includes(lq))
      );
    }

    // Category filter
    if (category) {
      entries = entries.filter((e) =>
        (e.manifest.categories ?? []).includes(category)
      );
    }

    // Sort
    entries = [...entries].sort((a, b) => {
      let diff = 0;
      if (sortBy === 'rating') diff = a.rating - b.rating;
      else if (sortBy === 'downloads') diff = a.downloads - b.downloads;
      else if (sortBy === 'updatedAt') diff = a.updatedAt - b.updatedAt;
      else if (sortBy === 'name')
        diff = a.manifest.name.localeCompare(b.manifest.name);
      return sortOrder === 'asc' ? diff : -diff;
    });

    return {
      entries: entries.slice(offset, offset + limit),
      total: entries.length,
    };
  }

  // ─── Featured ──────────────────────────────────────────────────────────────

  async getFeatured(): Promise<MarketplaceEntry[]> {
    const catalog = await this.fetchCatalog();
    return catalog.filter((e) => e.featured);
  }

  // ─── Plugin Details ────────────────────────────────────────────────────────

  async getEntry(pluginId: string): Promise<MarketplaceEntry | null> {
    const catalog = await this.fetchCatalog();
    return catalog.find((e) => e.manifest.id === pluginId) ?? null;
  }

  // ─── Rating ────────────────────────────────────────────────────────────────

  /**
   * Submits a user rating (1–5) for a plugin.
   * Sends the rating to the registry endpoint.
   */
  async submitRating(pluginId: string, rating: number): Promise<void> {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5.');
    }

    try {
      const url = this.catalogUrl.replace('catalog.json', `ratings/${pluginId}`);
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
        signal: AbortSignal.timeout(5_000),
      });
    } catch (err) {
      console.warn('[MarketplaceService] Failed to submit rating:', err);
    }
  }

  // ─── Categories ────────────────────────────────────────────────────────────

  async getCategories(): Promise<string[]> {
    const catalog = await this.fetchCatalog();
    const set = new Set<string>();
    catalog.forEach((e) =>
      (e.manifest.categories ?? []).forEach((c) => set.add(c))
    );
    return Array.from(set).sort();
  }
}

export const marketplaceService = new MarketplaceService();
