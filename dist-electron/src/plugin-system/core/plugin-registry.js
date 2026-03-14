"use strict";
/**
 * Plugin Registry - Tracks plugin metadata and state
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginRegistry = void 0;
class PluginRegistry {
    constructor() {
        this.registry = new Map();
    }
    /**
     * Register plugin
     */
    register(metadata) {
        this.registry.set(metadata.id, metadata);
    }
    /**
     * Unregister plugin
     */
    unregister(pluginId) {
        this.registry.delete(pluginId);
    }
    /**
     * Get plugin metadata
     */
    getMetadata(pluginId) {
        return this.registry.get(pluginId);
    }
    /**
     * Get all metadata
     */
    getAllMetadata() {
        return Array.from(this.registry.values());
    }
    /**
     * Find plugins by capability
     */
    findByCapability(capability) {
        return Array.from(this.registry.values()).filter((m) => m.capabilities.includes(capability));
    }
    /**
     * Check if plugin exists
     */
    exists(pluginId) {
        return this.registry.has(pluginId);
    }
    /**
     * Clear registry
     */
    clear() {
        this.registry.clear();
    }
}
exports.PluginRegistry = PluginRegistry;
