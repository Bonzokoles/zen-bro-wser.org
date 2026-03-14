"use strict";
/**
 * Preload Script - Bridge between Renderer and Main Process
 * Provides secure IPC communication
 */
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
/**
 * Exposed API for renderer process
 */
const api = {
    // Browser operations
    browser: {
        newTab: () => electron_1.ipcRenderer.invoke('browser:new-tab'),
        closeTab: (tabId) => electron_1.ipcRenderer.invoke('browser:close-tab', tabId),
        navigate: (tabId, url) => electron_1.ipcRenderer.invoke('browser:navigate', tabId, url),
        getTabs: () => electron_1.ipcRenderer.invoke('browser:get-tabs'),
    },
    // AI Gateway
    ai: {
        execute: (request) => electron_1.ipcRenderer.invoke('ai:execute', request),
        getProviders: () => electron_1.ipcRenderer.invoke('ai:get-providers'),
        getMetrics: () => electron_1.ipcRenderer.invoke('ai:get-metrics'),
    },
    // Network monitoring
    network: {
        getReport: (tabId) => electron_1.ipcRenderer.invoke('network:get-report', tabId),
    },
    // Security
    security: {
        createContext: (tabId) => electron_1.ipcRenderer.invoke('security:create-context', tabId),
        getAuditLogs: (tabId) => electron_1.ipcRenderer.invoke('security:get-audit-logs', tabId),
    },
    // Window controls
    window: {
        minimize: () => electron_1.ipcRenderer.invoke('window:minimize'),
        maximize: () => electron_1.ipcRenderer.invoke('window:maximize'),
        close: () => electron_1.ipcRenderer.invoke('window:close'),
    },
    // Theme
    theme: {
        toggle: () => electron_1.ipcRenderer.invoke('theme:toggle'),
    },
    // Terminal Panel / Agent Generic Access
    invoke: (channel, ...args) => {
        const validChannels = [
            'crawler:search', 'crawler:extract',
            'library:index-file', 'library:search', 'library:save-web',
            'mcp:connect', 'mcp:list-tools', 'mcp:execute-tool',
            'tunnel:start', 'tunnel:stop', 'tunnel:metrics', 'tunnel:status'
        ];
        if (validChannels.includes(channel)) {
            return electron_1.ipcRenderer.invoke(channel, ...args);
        }
        throw new Error(`Unauthorized IPC channel: ${channel}`);
    },
    // System info
    system: {
        platform: process.platform,
        nodeVersion: process.version,
        arch: process.arch,
    },
};
/**
 * Expose API to renderer process
 */
electron_1.contextBridge.exposeInMainWorld('electronAPI', api);
