/**
 * Plugin Registry
 * Persists installed plugin metadata to localStorage.
 */

import type { PluginMeta } from '../api/plugin-api';

const STORAGE_KEY = 'zeno:plugin-registry';

export class PluginRegistry {
  private plugins: Map<string, PluginMeta> = new Map();

  constructor() {
    this.load();
  }

  // ─── Persistence ─────────────────────────────────────────────────────────

  private load(): void {
    try {
      const raw =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem(STORAGE_KEY)
          : null;
      if (raw) {
        const entries: PluginMeta[] = JSON.parse(raw);
        entries.forEach((meta) => this.plugins.set(meta.id, meta));
      }
    } catch {
      console.warn('[PluginRegistry] Failed to load registry from storage.');
    }
  }

  private save(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(Array.from(this.plugins.values()))
        );
      }
    } catch {
      console.warn('[PluginRegistry] Failed to persist registry to storage.');
    }
  }

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  register(meta: PluginMeta): void {
    this.plugins.set(meta.id, meta);
    this.save();
  }

  get(id: string): PluginMeta | undefined {
    return this.plugins.get(id);
  }

  getAll(): PluginMeta[] {
    return Array.from(this.plugins.values());
  }

  getEnabled(): PluginMeta[] {
    return this.getAll().filter((p) => p.enabled);
  }

  update(id: string, patch: Partial<PluginMeta>): void {
    const existing = this.plugins.get(id);
    if (!existing) return;
    this.plugins.set(id, { ...existing, ...patch, updatedAt: Date.now() });
    this.save();
  }

  remove(id: string): void {
    this.plugins.delete(id);
    this.save();
  }

  has(id: string): boolean {
    return this.plugins.has(id);
  }

  clear(): void {
    this.plugins.clear();
    this.save();
  }
}

export const pluginRegistry = new PluginRegistry();
