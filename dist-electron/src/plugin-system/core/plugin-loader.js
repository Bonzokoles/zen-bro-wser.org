"use strict";
/**
 * Plugin Loader - Handles loading plugin code
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginLoader = void 0;
const plugin_api_1 = require("./plugin-api");
class PluginLoader {
    /**
     * Load plugin from source (file path or URL)
     */
    async load(source, options = {}) {
        try {
            // Determine source type
            if (source.startsWith('http://') || source.startsWith('https://')) {
                return await this.loadFromURL(source, options);
            }
            else {
                return await this.loadFromFile(source, options);
            }
        }
        catch (error) {
            console.error(`Failed to load plugin from ${source}:`, error);
            throw error;
        }
    }
    /**
     * Load from URL
     */
    async loadFromURL(url, options) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const code = await response.text();
            return this.executeCode(code, options);
        }
        catch (error) {
            throw new Error(`Failed to load from URL ${url}: ${error}`);
        }
    }
    /**
     * Load from file system
     */
    async loadFromFile(filePath, options) {
        try {
            // Use dynamic import for .ts/.js files
            if (filePath.endsWith('.ts') || filePath.endsWith('.js')) {
                const module = await Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
                return module;
            }
            throw new Error(`Unsupported file type: ${filePath}`);
        }
        catch (error) {
            throw new Error(`Failed to load from file ${filePath}: ${error}`);
        }
    }
    /**
     * Execute code in sandboxed context
     */
    executeCode(code, options) {
        if (options.sandboxed) {
            return this.executeSandboxed(code);
        }
        else {
            return this.executeUnsafe(code);
        }
    }
    /**
     * Execute code in sandboxed environment
     */
    executeSandboxed(code) {
        try {
            // Create a new Function with limited scope
            const fn = new Function('BasePlugin', `
        "use strict";
        ${code}
        return { default: exports.default || null };
      `);
            const result = fn(plugin_api_1.BasePlugin);
            return result;
        }
        catch (error) {
            throw new Error(`Sandboxed execution failed: ${error}`);
        }
    }
    /**
     * Execute code unsafely (use with caution)
     */
    executeUnsafe(code) {
        try {
            // eslint-disable-next-line no-eval
            return eval(`(function() { ${code}; return { default: exports.default || null }; })()`);
        }
        catch (error) {
            throw new Error(`Execution failed: ${error}`);
        }
    }
}
exports.PluginLoader = PluginLoader;
