/**
 * Preload Script - Bridge between Renderer and Main Process
 * Provides secure IPC communication
 */
/**
 * Exposed API for renderer process
 */
declare const api: {
    browser: {
        newTab: () => Promise<any>;
        closeTab: (tabId: string) => Promise<any>;
        navigate: (tabId: string, url: string) => Promise<any>;
        getTabs: () => Promise<any>;
    };
    ai: {
        execute: (request: any) => Promise<any>;
        getProviders: () => Promise<any>;
        getMetrics: () => Promise<any>;
    };
    network: {
        getReport: (tabId: string) => Promise<any>;
    };
    security: {
        createContext: (tabId: string) => Promise<any>;
        getAuditLogs: (tabId?: string) => Promise<any>;
    };
    window: {
        minimize: () => Promise<any>;
        maximize: () => Promise<any>;
        close: () => Promise<any>;
    };
    theme: {
        toggle: () => Promise<any>;
    };
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    system: {
        platform: NodeJS.Platform;
        nodeVersion: string;
        arch: NodeJS.Architecture;
    };
};
/**
 * Type definitions for renderer
 */
declare global {
    interface Window {
        electronAPI: typeof api;
    }
}
export type ElectronAPI = typeof api;
export {};
