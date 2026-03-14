/**
 * Auto-Updater
 * Checks for plugin updates and applies them with signature verification.
 */

import type { PluginMeta } from '../api/plugin-api';
import { pluginRegistry } from '../core/plugin-registry';
import { pluginManager } from '../core/plugin-manager';
import { meetsMinVersion } from '../utils/validation';
import type { MarketplaceEntry } from './marketplace-service';
import { marketplaceService } from './marketplace-service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UpdateAvailable {
  installedMeta: PluginMeta;
  availableEntry: MarketplaceEntry;
  fromVersion: string;
  toVersion: string;
}

export interface UpdateResult {
  pluginId: string;
  success: boolean;
  error?: string;
}

// ─── Auto-Updater ─────────────────────────────────────────────────────────────

export class AutoUpdater {
  private checkIntervalMs: number;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(checkIntervalMs = 60 * 60 * 1_000 /* 1 hour */) {
    this.checkIntervalMs = checkIntervalMs;
  }

  // ─── Check for Updates ─────────────────────────────────────────────────────

  /**
   * Compares installed plugin versions against the marketplace catalog.
   * Returns a list of plugins that have newer versions available.
   */
  async checkForUpdates(): Promise<UpdateAvailable[]> {
    const installed = pluginRegistry.getAll();
    const updates: UpdateAvailable[] = [];

    for (const meta of installed) {
      try {
        const entry = await marketplaceService.getEntry(meta.id);
        if (
          entry &&
          !meetsMinVersion(meta.version, entry.manifest.version) &&
          entry.manifest.version !== meta.version
        ) {
          updates.push({
            installedMeta: meta,
            availableEntry: entry,
            fromVersion: meta.version,
            toVersion: entry.manifest.version,
          });
        }
      } catch (err) {
        console.warn(
          `[AutoUpdater] Could not check update for "${meta.id}":`,
          err
        );
      }
    }

    return updates;
  }

  // ─── Apply Updates ─────────────────────────────────────────────────────────

  /**
   * Updates a single plugin to the latest marketplace version.
   */
  async updatePlugin(pluginId: string): Promise<UpdateResult> {
    try {
      const entry = await marketplaceService.getEntry(pluginId);
      if (!entry) {
        throw new Error(`Plugin "${pluginId}" not found in marketplace.`);
      }

      await pluginManager.update(pluginId, entry.moduleUrl);

      return { pluginId, success: true };
    } catch (err) {
      const error = String(err);
      console.error(`[AutoUpdater] Failed to update "${pluginId}":`, err);
      return { pluginId, success: false, error };
    }
  }

  /**
   * Updates all plugins that have available updates.
   */
  async updateAll(): Promise<UpdateResult[]> {
    const updates = await this.checkForUpdates();
    const results: UpdateResult[] = [];

    for (const update of updates) {
      const result = await this.updatePlugin(update.installedMeta.id);
      results.push(result);
    }

    return results;
  }

  // ─── Scheduled Updates ─────────────────────────────────────────────────────

  /**
   * Starts a background interval that periodically checks for and applies updates.
   */
  startAutoUpdate(onUpdate?: (results: UpdateResult[]) => void): void {
    if (this.intervalId !== null) return;

    this.intervalId = setInterval(async () => {
      const results = await this.updateAll();
      if (results.length > 0) {
        onUpdate?.(results);
      }
    }, this.checkIntervalMs);
  }

  stopAutoUpdate(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const autoUpdater = new AutoUpdater();
