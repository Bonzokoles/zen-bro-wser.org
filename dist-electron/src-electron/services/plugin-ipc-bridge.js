"use strict";
/**
 * Plugin IPC Bridge - Communication between React and Electron for plugin system
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluginIPCBridge = exports.PluginIPCBridge = void 0;
const electron_1 = require("electron");
const plugin_manager_1 = require("../../src/plugin-system/core/plugin-manager");
const marketplace_service_1 = require("../../src/plugin-system/marketplace/marketplace-service");
const auto_updater_1 = require("../../src/plugin-system/marketplace/auto-updater");
let autoUpdater;
class PluginIPCBridge {
    constructor() {
        this.setupHandlers();
        autoUpdater = new auto_updater_1.PluginAutoUpdater(marketplace_service_1.marketplaceService, plugin_manager_1.pluginManager);
    }
    setupHandlers() {
        // Load plugin
        electron_1.ipcMain.handle('plugin:load', async (_, source) => {
            try {
                const plugin = await plugin_manager_1.pluginManager.loadPlugin(source);
                return { success: true, pluginId: plugin.constructor.name };
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
        // Unload plugin
        electron_1.ipcMain.handle('plugin:unload', async (_, pluginId) => {
            try {
                await plugin_manager_1.pluginManager.unloadPlugin(pluginId);
                return { success: true };
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
        // Enable plugin
        electron_1.ipcMain.handle('plugin:enable', async (_, pluginId) => {
            try {
                await plugin_manager_1.pluginManager.enablePlugin(pluginId);
                return { success: true };
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
        // Disable plugin
        electron_1.ipcMain.handle('plugin:disable', async (_, pluginId) => {
            try {
                await plugin_manager_1.pluginManager.disablePlugin(pluginId);
                return { success: true };
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
        // Get installed plugins
        electron_1.ipcMain.handle('plugin:get-installed', async () => {
            const plugins = plugin_manager_1.pluginManager.getPlugins();
            return Array.from(plugins.values()).map((plugin) => {
                const metadata = plugin_manager_1.pluginManager.getPluginMetadata(plugin.constructor.name);
                return {
                    id: plugin.constructor.name,
                    name: metadata?.name,
                    version: metadata?.version,
                    author: metadata?.author,
                    enabled: plugin_manager_1.pluginManager.isPluginEnabled(plugin.constructor.name),
                };
            });
        });
        // Search marketplace
        electron_1.ipcMain.handle('plugin:search-marketplace', async (_, query) => {
            try {
                const results = await marketplace_service_1.marketplaceService.search(query);
                return { success: true, plugins: results };
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
        // Get featured plugins
        electron_1.ipcMain.handle('plugin:get-featured', async () => {
            try {
                const plugins = await marketplace_service_1.marketplaceService.getFeatured();
                return { success: true, plugins };
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
        // Get trending plugins
        electron_1.ipcMain.handle('plugin:get-trending', async () => {
            try {
                const plugins = await marketplace_service_1.marketplaceService.getTrending();
                return { success: true, plugins };
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
        // Check for updates
        electron_1.ipcMain.handle('plugin:check-updates', async () => {
            try {
                const updates = await autoUpdater.checkForUpdates();
                return { success: true, updates };
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
        // Apply update
        electron_1.ipcMain.handle('plugin:apply-update', async (_, pluginId) => {
            try {
                await autoUpdater.applyUpdate(pluginId);
                return { success: true };
            }
            catch (error) {
                return { success: false, error: error.message };
            }
        });
        // Start auto-update
        electron_1.ipcMain.handle('plugin:start-auto-update', async () => {
            autoUpdater.startAutoCheck();
            return { success: true };
        });
    }
}
exports.PluginIPCBridge = PluginIPCBridge;
exports.pluginIPCBridge = new PluginIPCBridge();
