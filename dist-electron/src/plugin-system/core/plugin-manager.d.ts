/**
 * Plugin Manager - Central plugin orchestration
 */
import { EventEmitter } from 'events';
import { BasePlugin } from './plugin-api';
import type { PluginMetadata } from './plugin-api';
export interface PluginLoadOptions {
    sandboxed?: boolean;
    autoEnable?: boolean;
}
export declare class PluginManager extends EventEmitter {
    private plugins;
    private loader;
    private registry;
    private enabledPlugins;
    constructor();
    /**
     * Load plugin from file or URL
     */
    loadPlugin(source: string, options?: PluginLoadOptions): Promise<BasePlugin>;
    /**
     * Unload plugin
     */
    unloadPlugin(pluginId: string): Promise<void>;
    /**
     * Enable plugin
     */
    enablePlugin(pluginId: string): Promise<void>;
    /**
     * Disable plugin
     */
    disablePlugin(pluginId: string): Promise<void>;
    /**
     * Get all loaded plugins
     */
    getPlugins(): Map<string, BasePlugin>;
    /**
     * Get plugin by ID
     */
    getPlugin(pluginId: string): BasePlugin | undefined;
    /**
     * Get plugin metadata
     */
    getPluginMetadata(pluginId: string): PluginMetadata | undefined;
    /**
     * Check if plugin is enabled
     */
    isPluginEnabled(pluginId: string): boolean;
    /**
     * Get enabled plugins
     */
    getEnabledPlugins(): BasePlugin[];
    /**
     * Validate plugin metadata
     */
    private validatePlugin;
    /**
     * Create plugin context
     */
    private createContext;
}
export declare const pluginManager: PluginManager;
