"use strict";
/**
 * Auto-Updater Service
 * Handles checking for and installing updates
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoUpdaterService = exports.AutoUpdaterService = void 0;
const electron_1 = require("electron");
const electron_updater_1 = require("electron-updater");
class AutoUpdaterService {
    constructor() {
        this.isCheckingForUpdate = false;
        this.updateCheckInterval = null;
        this.configureAutoUpdater();
        this.setupIPC();
    }
    configureAutoUpdater() {
        electron_updater_1.autoUpdater.logger = require('electron-log');
        electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
        electron_updater_1.autoUpdater.on('checking-for-update', () => {
            console.log('🔄 Checking for updates...');
        });
        electron_updater_1.autoUpdater.on('update-available', (info) => {
            console.log(`✅ Update available: ${info.version}`);
            this.notifyUpdateAvailable(info);
        });
        electron_updater_1.autoUpdater.on('update-not-available', () => {
            console.log('✅ You are up to date');
        });
        electron_updater_1.autoUpdater.on('error', (error) => {
            console.error('❌ Update error:', error);
        });
        electron_updater_1.autoUpdater.on('download-progress', (progress) => {
            console.log(`📥 Download progress: ${progress.percent}%`);
            electron_1.ipcMain.emit('update-progress', progress);
        });
        electron_updater_1.autoUpdater.on('update-downloaded', () => {
            console.log('✅ Update downloaded, will install on quit');
            this.notifyUpdateReady();
        });
    }
    setupIPC() {
        electron_1.ipcMain.handle('updater:check-for-updates', async () => {
            try {
                const result = await electron_updater_1.autoUpdater.checkForUpdates();
                if (!result)
                    return { isUpdateAvailable: false };
                return {
                    isUpdateAvailable: result.updateInfo.version !== electron_1.app.getVersion(),
                    version: result.updateInfo.version,
                    releaseDate: result.updateInfo.releaseDate,
                };
            }
            catch (error) {
                console.error('Failed to check for updates:', error);
                return { isUpdateAvailable: false, error: error.message };
            }
        });
        electron_1.ipcMain.handle('updater:install-update', async () => {
            electron_updater_1.autoUpdater.quitAndInstall();
        });
        electron_1.ipcMain.handle('updater:get-current-version', async () => {
            return electron_1.app.getVersion();
        });
    }
    notifyUpdateAvailable(info) {
        electron_1.dialog
            .showMessageBox({
            type: 'info',
            title: 'Update Available',
            message: `ZENO Browser ${info.version} is available`,
            detail: 'Downloading update in background...',
            buttons: ['Later', 'Install Now'],
        })
            .then((result) => {
            if (result.response === 1) {
                electron_updater_1.autoUpdater.downloadUpdate();
            }
        });
    }
    notifyUpdateReady() {
        electron_1.dialog
            .showMessageBox({
            type: 'info',
            title: 'Update Ready',
            message: 'Update is ready to install',
            detail: 'Application will restart to apply update',
            buttons: ['Later', 'Install & Restart'],
        })
            .then((result) => {
            if (result.response === 1) {
                electron_updater_1.autoUpdater.quitAndInstall();
            }
        });
    }
    /**
     * Start automatic update checks
     */
    startAutoChecks(intervalHours = 1) {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
        }
        console.log(`🔄 Starting auto-update checks every ${intervalHours}h`);
        // Check immediately
        electron_updater_1.autoUpdater.checkForUpdates();
        // Then check periodically
        this.updateCheckInterval = setInterval(() => {
            electron_updater_1.autoUpdater.checkForUpdates();
        }, intervalHours * 60 * 60 * 1000);
    }
    /**
     * Stop automatic update checks
     */
    stopAutoChecks() {
        if (this.updateCheckInterval) {
            clearInterval(this.updateCheckInterval);
            this.updateCheckInterval = null;
            console.log('🛑 Auto-update checks stopped');
        }
    }
    /**
     * Manual check for updates
     */
    async checkForUpdates() {
        try {
            if (this.isCheckingForUpdate) {
                return { version: '', releaseDate: '', releaseNotes: [], isUpdateAvailable: false };
            }
            this.isCheckingForUpdate = true;
            const result = await electron_updater_1.autoUpdater.checkForUpdates();
            if (!result)
                return { version: '', releaseDate: '', releaseNotes: [], isUpdateAvailable: false };
            return {
                version: result.updateInfo.version,
                releaseDate: result.updateInfo.releaseDate || new Date().toISOString(),
                releaseNotes: this.parseReleaseNotes(result.updateInfo.releaseNotes),
                isUpdateAvailable: result.updateInfo.version !== electron_1.app.getVersion(),
            };
        }
        catch (error) {
            console.error('Error checking for updates:', error);
            throw error;
        }
        finally {
            this.isCheckingForUpdate = false;
        }
    }
    parseReleaseNotes(notes) {
        if (!notes)
            return [];
        if (Array.isArray(notes))
            return notes;
        if (typeof notes === 'string')
            return notes.split('\n');
        return [];
    }
}
exports.AutoUpdaterService = AutoUpdaterService;
exports.autoUpdaterService = new AutoUpdaterService();
