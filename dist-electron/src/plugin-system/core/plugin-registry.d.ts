/**
 * Plugin Registry - Tracks plugin metadata and state
 */
import type { PluginMetadata } from './plugin-api';
export declare class PluginRegistry {
    private registry;
    /**
     * Register plugin
     */
    register(metadata: PluginMetadata): void;
    /**
     * Unregister plugin
     */
    unregister(pluginId: string): void;
    /**
     * Get plugin metadata
     */
    getMetadata(pluginId: string): PluginMetadata | undefined;
    /**
     * Get all metadata
     */
    getAllMetadata(): PluginMetadata[];
    /**
     * Find plugins by capability
     */
    findByCapability(capability: string): PluginMetadata[];
    /**
     * Check if plugin exists
     */
    exists(pluginId: string): boolean;
    /**
     * Clear registry
     */
    clear(): void;
}
