/**
 * Plugin Loader - Handles loading plugin code
 */
export interface LoaderOptions {
    sandboxed?: boolean;
}
export declare class PluginLoader {
    /**
     * Load plugin from source (file path or URL)
     */
    load(source: string, options?: LoaderOptions): Promise<any>;
    /**
     * Load from URL
     */
    private loadFromURL;
    /**
     * Load from file system
     */
    private loadFromFile;
    /**
     * Execute code in sandboxed context
     */
    private executeCode;
    /**
     * Execute code in sandboxed environment
     */
    private executeSandboxed;
    /**
     * Execute code unsafely (use with caution)
     */
    private executeUnsafe;
}
