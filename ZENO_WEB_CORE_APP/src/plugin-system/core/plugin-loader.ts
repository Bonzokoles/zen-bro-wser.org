/**
 * Plugin Loader
 * Dynamically imports plugin modules, validates them, and instantiates plugins.
 */

import type { Plugin, PluginFactory, PluginManifest } from '../api/plugin-api';
import { castManifest } from '../utils/validation';
import { createSandboxedAPI } from '../utils/sandbox';

export class PluginLoader {
  /**
   * Loads a plugin from a URL or module specifier.
   * Expects the module to export:
   *   - `manifest`: PluginManifest
   *   - `default`: PluginFactory
   */
  async load(moduleUrl: string): Promise<Plugin> {
    let mod: Record<string, unknown>;

    try {
      mod = (await import(/* @vite-ignore */ moduleUrl)) as Record<string, unknown>;
    } catch (err) {
      throw new Error(
        `[PluginLoader] Failed to import plugin module "${moduleUrl}": ${String(err)}`
      );
    }

    // Validate manifest
    const manifest = castManifest(mod['manifest']);

    // Obtain factory
    const factory = mod['default'];
    if (typeof factory !== 'function') {
      throw new Error(
        `[PluginLoader] Plugin "${manifest.id}" does not export a default factory function.`
      );
    }

    // Create sandboxed API
    const api = createSandboxedAPI(manifest.id, manifest.permissions);

    // Instantiate plugin
    let plugin: Plugin;
    try {
      plugin = (factory as PluginFactory)(api);
    } catch (err) {
      throw new Error(
        `[PluginLoader] Plugin "${manifest.id}" factory threw an error: ${String(err)}`
      );
    }

    return plugin;
  }

  /**
   * Loads a plugin from an inline manifest + factory pair (for testing / built-ins).
   */
  loadFromFactory(
    manifest: PluginManifest,
    factory: PluginFactory
  ): Plugin {
    castManifest(manifest); // validate
    const api = createSandboxedAPI(manifest.id, manifest.permissions);
    return factory(api);
  }
}

export const pluginLoader = new PluginLoader();
