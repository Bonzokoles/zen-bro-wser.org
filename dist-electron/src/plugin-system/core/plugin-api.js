"use strict";
/**
 * Plugin API - Core interface for all plugins
 * Standardized API that all plugins must implement
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePlugin = void 0;
/**
 * Base Plugin Class - All plugins should extend this
 */
class BasePlugin {
    getContext() {
        return this.context;
    }
    setContext(context) {
        this.context = context;
        this.metadata = this.getMetadata();
    }
}
exports.BasePlugin = BasePlugin;
