"use strict";
/**
 * Tunnel UI Bridge - Expose tunnel controls to React
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.tunnelBridge = exports.TunnelUIBridge = void 0;
const electron_1 = require("electron");
const cloudflare_tunnel_1 = require("./cloudflare-tunnel");
class TunnelUIBridge {
    constructor() {
        this.tunnelManager = null;
        this.setupIPCHandlers();
    }
    /**
     * Initialize tunnel
     */
    async initialize(config) {
        try {
            this.tunnelManager = new cloudflare_tunnel_1.CloudflareTunnelManager(config);
            return await this.tunnelManager.start();
        }
        catch (error) {
            console.error('Failed to initialize tunnel:', error);
            return false;
        }
    }
    /**
     * Setup IPC handlers for React components
     */
    setupIPCHandlers() {
        electron_1.ipcMain.handle('tunnel:initialize', async (_, config) => {
            return this.initialize(config);
        });
        electron_1.ipcMain.handle('tunnel:start', async () => {
            if (!this.tunnelManager)
                return false;
            return await this.tunnelManager.start();
        });
        electron_1.ipcMain.handle('tunnel:stop', async () => {
            if (!this.tunnelManager)
                return;
            await this.tunnelManager.stop();
        });
        electron_1.ipcMain.handle('tunnel:status', async () => {
            if (!this.tunnelManager)
                return null;
            return this.tunnelManager.getStatus();
        });
        electron_1.ipcMain.handle('tunnel:metrics', async () => {
            if (!this.tunnelManager)
                return null;
            return this.tunnelManager.getMetrics();
        });
        electron_1.ipcMain.handle('tunnel:reconnect', async () => {
            if (!this.tunnelManager)
                return false;
            return await this.tunnelManager.reconnect();
        });
        electron_1.ipcMain.handle('tunnel:host-status', async (_, hostname) => {
            if (!this.tunnelManager)
                return null;
            return this.tunnelManager.getHostStatus(hostname);
        });
    }
    /**
     * Get tunnel manager instance
     */
    getTunnelManager() {
        return this.tunnelManager;
    }
}
exports.TunnelUIBridge = TunnelUIBridge;
exports.tunnelBridge = new TunnelUIBridge();
