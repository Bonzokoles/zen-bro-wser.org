/**
 * Plugin IPC Bridge
 * Connects the React UI layer to the plugin-system core.
 * In Electron this would use ipcRenderer; here we expose a clean async API
 * over the singleton managers, making future Electron migration straightforward.
 */

import type { PluginMeta } from '../../plugin-system/api/plugin-api';
import { pluginManager } from '../../plugin-system/core/plugin-manager';
import { pluginRegistry } from '../../plugin-system/core/plugin-registry';
import { marketplaceService } from '../../plugin-system/marketplace/marketplace-service';
import { autoUpdater } from '../../plugin-system/marketplace/auto-updater';
import type {
  MarketplaceEntry,
  MarketplaceSearchOptions,
  MarketplaceSearchResult,
} from '../../plugin-system/marketplace/marketplace-service';
import type {
  UpdateAvailable,
  UpdateResult,
} from '../../plugin-system/marketplace/auto-updater';

// ─── IPC Bridge ──────────────────────────────────────────────────────────────

class PluginIPCBridge {
  // ─── Plugin Lifecycle ───────────────────────────────────────────────────────

  async installPlugin(moduleUrl: string): Promise<PluginMeta> {
    return pluginManager.install(moduleUrl);
  }

  async enablePlugin(pluginId: string): Promise<void> {
    return pluginManager.enable(pluginId);
  }

  async disablePlugin(pluginId: string): Promise<void> {
    return pluginManager.disable(pluginId);
  }

  async uninstallPlugin(pluginId: string): Promise<void> {
    return pluginManager.uninstall(pluginId);
  }

  async updatePlugin(pluginId: string): Promise<UpdateResult> {
    return autoUpdater.updatePlugin(pluginId);
  }

  // ─── Registry Queries ───────────────────────────────────────────────────────

  getInstalledPlugins(): PluginMeta[] {
    return pluginRegistry.getAll();
  }

  getEnabledPlugins(): PluginMeta[] {
    return pluginRegistry.getEnabled();
  }

  getPlugin(pluginId: string): PluginMeta | undefined {
    return pluginRegistry.get(pluginId);
  }

  // ─── Marketplace ───────────────────────────────────────────────────────────

  async searchMarketplace(
    options: MarketplaceSearchOptions = {}
  ): Promise<MarketplaceSearchResult> {
    return marketplaceService.search(options);
  }

  async getFeatured(): Promise<MarketplaceEntry[]> {
    return marketplaceService.getFeatured();
  }

  async getMarketplaceEntry(pluginId: string): Promise<MarketplaceEntry | null> {
    return marketplaceService.getEntry(pluginId);
  }

  async getCategories(): Promise<string[]> {
    return marketplaceService.getCategories();
  }

  async submitRating(pluginId: string, rating: number): Promise<void> {
    return marketplaceService.submitRating(pluginId, rating);
  }

  // ─── Updates ───────────────────────────────────────────────────────────────

  async checkForUpdates(): Promise<UpdateAvailable[]> {
    return autoUpdater.checkForUpdates();
  }

  async updateAll(): Promise<UpdateResult[]> {
    return autoUpdater.updateAll();
  }

  startAutoUpdate(onUpdate?: (results: UpdateResult[]) => void): void {
    autoUpdater.startAutoUpdate(onUpdate);
  }

  stopAutoUpdate(): void {
    autoUpdater.stopAutoUpdate();
  }

  // ─── Boot ──────────────────────────────────────────────────────────────────

  async boot(): Promise<void> {
    return pluginManager.boot();
  }
}

export const pluginIPCBridge = new PluginIPCBridge();
export type { PluginMeta, MarketplaceEntry, UpdateAvailable, UpdateResult };
