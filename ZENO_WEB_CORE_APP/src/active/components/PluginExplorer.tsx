import React, { useState, useEffect, useCallback } from 'react';
import { pluginIPCBridge } from '../services/plugin-ipc-bridge';
import type { MarketplaceEntry } from '../services/plugin-ipc-bridge';

interface PluginExplorerProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall?: (entry: MarketplaceEntry) => void;
}

const STAR_LABELS = ['', '★', '★★', '★★★', '★★★★', '★★★★★'];

const PluginExplorer: React.FC<PluginExplorerProps> = ({
  isOpen,
  onClose,
  onInstall,
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [entries, setEntries] = useState<MarketplaceEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

  // Load categories once
  useEffect(() => {
    if (!isOpen) return;
    pluginIPCBridge
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, [isOpen]);

  // Track installed
  useEffect(() => {
    if (!isOpen) return;
    const ids = new Set(pluginIPCBridge.getInstalledPlugins().map((p) => p.id));
    setInstalled(ids);
  }, [isOpen]);

  const search = useCallback(async (q: string, cat: string, p: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await pluginIPCBridge.searchMarketplace({
        query: q,
        category: cat || undefined,
        sortBy: 'rating',
        sortOrder: 'desc',
        limit: PAGE_SIZE,
        offset: p * PAGE_SIZE,
      });
      setEntries(result.entries);
      setTotal(result.total);
    } catch {
      setError('Failed to load plugins. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setPage(0);
      void search(query, category, 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, query, category, search]);

  const handleInstall = async (entry: MarketplaceEntry) => {
    try {
      await pluginIPCBridge.installPlugin(entry.moduleUrl);
      setInstalled((prev) => new Set(prev).add(entry.manifest.id));
      onInstall?.(entry);
    } catch (err) {
      setError(`Install failed: ${String(err)}`);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    void search(query, category, newPage);
  };

  if (!isOpen) return null;

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 text-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">🧩 Plugin Explorer</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 px-6 py-3 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search plugins…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {error && (
            <div className="bg-red-900/50 border border-red-600 rounded-lg px-4 py-2 text-sm mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              Loading plugins…
            </div>
          ) : entries.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400">
              No plugins found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {entries.map((entry) => {
                const isInstalled = installed.has(entry.manifest.id);
                return (
                  <div
                    key={entry.manifest.id}
                    className="bg-gray-800 rounded-xl p-4 flex flex-col gap-2 border border-gray-700 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {entry.manifest.icon ? (
                        <img
                          src={entry.manifest.icon}
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-blue-700 flex items-center justify-center text-lg flex-shrink-0">
                          🧩
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium truncate">{entry.manifest.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          by {entry.manifest.author} · v{entry.manifest.version}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300 line-clamp-2">
                      {entry.manifest.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-1">
                      <span
                        className="text-yellow-400 text-sm"
                        title={`${entry.rating.toFixed(1)} / 5 (${entry.ratingCount} ratings)`}
                      >
                        {STAR_LABELS[Math.round(entry.rating)]} {entry.rating.toFixed(1)}
                      </span>
                      <button
                        onClick={() => void handleInstall(entry)}
                        disabled={isInstalled}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          isInstalled
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                        }`}
                      >
                        {isInstalled ? 'Installed' : 'Install'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-6 py-3 border-t border-gray-700">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="px-3 py-1 bg-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-600 text-sm"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-400">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 bg-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-600 text-sm"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginExplorer;
