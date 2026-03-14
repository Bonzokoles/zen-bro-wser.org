/**
 * Plugin Manager
 * Central orchestrator for plugin lifecycle, dependency resolution, and version management.
 */

import type { Plugin, PluginManifest, PluginMeta } from '../api/plugin-api';
import { pluginRegistry } from './plugin-registry';
import { pluginLoader } from './plugin-loader';
import { pluginEventBus } from '../api/hooks';
import { meetsMinVersion } from '../utils/validation';

// ─── Browser Version ─────────────────────────────────────────────────────────

const BROWSER_VERSION = '1.0.0';

// ─── Plugin Manager ──────────────────────────────────────────────────────────

export class PluginManager {
  /** Runtime plugin instances (not persisted) */
  private instances: Map<string, Plugin> = new Map();

  // ─── Install ───────────────────────────────────────────────────────────────

  /**
   * Installs a plugin from the given module URL.
   * Validates the manifest, resolves dependencies, then runs install().
   */
  async install(moduleUrl: string): Promise<PluginMeta> {
    const plugin = await pluginLoader.load(moduleUrl);
    const { manifest } = plugin;

    if (pluginRegistry.has(manifest.id)) {
      throw new Error(`Plugin "${manifest.id}" is already installed.`);
    }

    this.checkBrowserVersion(manifest);
    await this.resolveDependencies(manifest);

    if (plugin.install) {
      await plugin.install();
    }

    const meta: PluginMeta = {
      ...manifest,
      status: 'installed',
      installedAt: Date.now(),
      updatedAt: Date.now(),
      installPath: moduleUrl,
      enabled: false,
    };

    pluginRegistry.register(meta);
    this.instances.set(manifest.id, plugin);

    pluginEventBus.emit('plugin:install', {
      pluginId: manifest.id,
      timestamp: Date.now(),
      meta,
    });

    return meta;
  }

  // ─── Enable ────────────────────────────────────────────────────────────────

  async enable(pluginId: string): Promise<void> {
    const meta = this.requireMeta(pluginId);
    const plugin = await this.requireInstance(meta);

    if (plugin.enable) {
      await plugin.enable();
    }

    pluginRegistry.update(pluginId, { status: 'enabled', enabled: true });

    pluginEventBus.emit('plugin:enable', {
      pluginId,
      timestamp: Date.now(),
    });
  }

  // ─── Disable ───────────────────────────────────────────────────────────────

  async disable(pluginId: string): Promise<void> {
    const meta = this.requireMeta(pluginId);
    const plugin = await this.requireInstance(meta);

    if (plugin.disable) {
      await plugin.disable();
    }

    pluginRegistry.update(pluginId, { status: 'disabled', enabled: false });

    pluginEventBus.emit('plugin:disable', {
      pluginId,
      timestamp: Date.now(),
    });
  }

  // ─── Uninstall ─────────────────────────────────────────────────────────────

  async uninstall(pluginId: string): Promise<void> {
    const meta = this.requireMeta(pluginId);
    const plugin = this.instances.get(pluginId);

    if (plugin?.uninstall) {
      await plugin.uninstall();
    }

    pluginRegistry.remove(pluginId);
    this.instances.delete(pluginId);

    pluginEventBus.emit('plugin:uninstall', {
      pluginId,
      timestamp: Date.now(),
      meta,
    });
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  /**
   * Updates a plugin by uninstalling the old version and installing the new one.
   */
  async update(pluginId: string, newModuleUrl: string): Promise<PluginMeta> {
    const wasEnabled = pluginRegistry.get(pluginId)?.enabled ?? false;

    pluginEventBus.emit('plugin:update', {
      pluginId,
      timestamp: Date.now(),
    });

    await this.uninstall(pluginId);
    const meta = await this.install(newModuleUrl);

    if (wasEnabled) {
      await this.enable(pluginId);
    }

    return meta;
  }

  // ─── Accessors ─────────────────────────────────────────────────────────────

  getAll(): PluginMeta[] {
    return pluginRegistry.getAll();
  }

  getEnabled(): PluginMeta[] {
    return pluginRegistry.getEnabled();
  }

  getInstance(pluginId: string): Plugin | undefined {
    return this.instances.get(pluginId);
  }

  // ─── Boot (re-enable persisted plugins) ────────────────────────────────────

  /**
   * Called at app startup to reload all previously enabled plugins from their stored paths.
   */
  async boot(): Promise<void> {
    const enabled = pluginRegistry.getEnabled();
    for (const meta of enabled) {
      try {
        const plugin = await pluginLoader.load(meta.installPath);
        this.instances.set(meta.id, plugin);
        if (plugin.enable) {
          await plugin.enable();
        }
      } catch (err) {
        pluginRegistry.update(meta.id, { status: 'error' });
        pluginEventBus.emit('plugin:error', {
          pluginId: meta.id,
          timestamp: Date.now(),
          error: String(err),
        });
        console.error(`[PluginManager] Failed to boot plugin "${meta.id}":`, err);
      }
    }
  }

  // ─── Internals ─────────────────────────────────────────────────────────────

  private requireMeta(pluginId: string): PluginMeta {
    const meta = pluginRegistry.get(pluginId);
    if (!meta) {
      throw new Error(`Plugin "${pluginId}" is not installed.`);
    }
    return meta;
  }

  private async requireInstance(meta: PluginMeta): Promise<Plugin> {
    let plugin = this.instances.get(meta.id);
    if (!plugin) {
      plugin = await pluginLoader.load(meta.installPath);
      this.instances.set(meta.id, plugin);
    }
    return plugin;
  }

  private checkBrowserVersion(manifest: PluginManifest): void {
    if (
      manifest.minBrowserVersion &&
      !meetsMinVersion(BROWSER_VERSION, manifest.minBrowserVersion)
    ) {
      throw new Error(
        `Plugin "${manifest.id}" requires ZENO Browser >= ${manifest.minBrowserVersion}, ` +
          `but current version is ${BROWSER_VERSION}.`
      );
    }
  }

  private async resolveDependencies(manifest: PluginManifest): Promise<void> {
    if (!manifest.dependencies) return;

    for (const [depId, requiredRange] of Object.entries(manifest.dependencies)) {
      const dep = pluginRegistry.get(depId);
      if (!dep) {
        throw new Error(
          `Plugin "${manifest.id}" depends on "${depId}" which is not installed.`
        );
      }
      if (!meetsMinVersion(dep.version, requiredRange.replace(/[^0-9.]/g, ''))) {
        throw new Error(
          `Plugin "${manifest.id}" requires "${depId}" >= ${requiredRange}, ` +
            `but installed version is ${dep.version}.`
        );
      }
    }
  }
}

export const pluginManager = new PluginManager();
