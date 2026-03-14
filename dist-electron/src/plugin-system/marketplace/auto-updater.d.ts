/**
 * Auto-Updater - Automatically checks and updates plugins
 */
import { EventEmitter } from 'events';
import { MarketplaceService } from './marketplace-service';
import { PluginManager } from '../core/plugin-manager';
export interface UpdateInfo {
    pluginId: string;
    currentVersion: string;
    newVersion: string;
    changelog?: string;
}
export declare class PluginAutoUpdater extends EventEmitter {
    private marketplaceService;
    private pluginManager;
    private checkInterval;
    private updates;
    constructor(marketplaceService: MarketplaceService, pluginManager: PluginManager);
    /**
     * Start auto-update checks
     */
    startAutoCheck(intervalMs?: number): void;
    /**
     * Stop auto-update checks
     */
    stopAutoCheck(): void;
    /**
     * Check for updates
     */
    checkForUpdates(): Promise<UpdateInfo[]>;
    /**
     * Apply update
     */
    applyUpdate(pluginId: string): Promise<void>;
    /**
     * Get available updates
     */
    getAvailableUpdates(): UpdateInfo[];
    /**
     * Check if version is newer
     */
    private isNewerVersion;
    /**
     * Save blob to temporary location
     */
    private saveBlobToTemp;
}
