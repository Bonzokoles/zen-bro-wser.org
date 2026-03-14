import { autoUpdater, AppUpdater } from 'electron-updater';
import { app, BrowserWindow, dialog, ipcMain, Notification } from 'electron';
import log from 'electron-log';
import path from 'path';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface UpdateStatus {
  state: 'idle' | 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  currentVersion: string;
  progress?: {
    percent: number;
    transferred: number;
    total: number;
    bytesPerSecond: number;
  };
  error?: string;
}

export interface UpdaterConfig {
  autoDownload: boolean;
  autoInstallOnAppQuit: boolean;
  allowPrerelease: boolean;
  checkInterval: number; // ms
  feedURL?: string;
}

// ─────────────────────────────────────────────────────────────
// Default configuration
// ─────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: UpdaterConfig = {
  autoDownload: false,
  autoInstallOnAppQuit: true,
  allowPrerelease: false,
  checkInterval: 4 * 60 * 60 * 1000, // 4 hours
};

// ─────────────────────────────────────────────────────────────
// AutoUpdaterService class
// ─────────────────────────────────────────────────────────────

export class AutoUpdaterService {
  private updater: AppUpdater;
  private mainWindow: BrowserWindow | null = null;
  private config: UpdaterConfig;
  private status: UpdateStatus;
  private checkInterval: ReturnType<typeof setInterval> | null = null;
  private updateDownloaded = false;

  constructor(config: Partial<UpdaterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.updater = autoUpdater;
    this.status = {
      state: 'idle',
      currentVersion: app.getVersion(),
    };

    this.configureUpdater();
    this.setupEventHandlers();
    this.setupIPCHandlers();
  }

  // ── Configuration ──────────────────────────────────────────

  private configureUpdater(): void {
    log.transports.file.level = 'info';
    this.updater.logger = log;

    this.updater.autoDownload = this.config.autoDownload;
    this.updater.autoInstallOnAppQuit = this.config.autoInstallOnAppQuit;
    this.updater.allowPrerelease = this.config.allowPrerelease;

    if (this.config.feedURL) {
      this.updater.setFeedURL(this.config.feedURL);
    }
  }

  // ── Event Handlers ─────────────────────────────────────────

  private setupEventHandlers(): void {
    this.updater.on('checking-for-update', () => {
      log.info('[AutoUpdater] Checking for updates...');
      this.setStatus({ state: 'checking' });
    });

    this.updater.on('update-available', (info) => {
      log.info(`[AutoUpdater] Update available: v${info.version}`);
      this.setStatus({
        state: 'available',
        version: info.version,
      });

      if (this.config.autoDownload) {
        this.downloadUpdate();
      } else {
        this.notifyUpdateAvailable(info.version);
      }
    });

    this.updater.on('update-not-available', (info) => {
      log.info(`[AutoUpdater] Already up to date: v${info.version}`);
      this.setStatus({ state: 'not-available', version: info.version });
    });

    this.updater.on('download-progress', (progress) => {
      log.info(`[AutoUpdater] Download progress: ${progress.percent.toFixed(1)}%`);
      this.setStatus({
        state: 'downloading',
        progress: {
          percent: progress.percent,
          transferred: progress.transferred,
          total: progress.total,
          bytesPerSecond: progress.bytesPerSecond,
        },
      });
    });

    this.updater.on('update-downloaded', (info) => {
      log.info(`[AutoUpdater] Update downloaded: v${info.version}`);
      this.updateDownloaded = true;
      this.setStatus({
        state: 'downloaded',
        version: info.version,
      });

      this.notifyUpdateReady(info.version);
    });

    this.updater.on('error', (error) => {
      log.error('[AutoUpdater] Error:', error.message);

      // Don't surface dev-mode errors to user
      if (error.message.includes('ENOENT') && !app.isPackaged) {
        log.info('[AutoUpdater] Ignoring update error in dev mode');
        return;
      }

      this.setStatus({
        state: 'error',
        error: error.message,
      });
    });
  }

  // ── IPC Handlers ───────────────────────────────────────────

  private setupIPCHandlers(): void {
    ipcMain.handle('updater:check', () => this.checkForUpdates());
    ipcMain.handle('updater:download', () => this.downloadUpdate());
    ipcMain.handle('updater:install', () => this.installUpdate());
    ipcMain.handle('updater:status', () => this.status);
    ipcMain.handle('updater:getVersion', () => app.getVersion());
  }

  // ── Public API ─────────────────────────────────────────────

  /**
   * Set the main window reference for sending status updates
   */
  public setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * Check for updates manually
   */
  public async checkForUpdates(): Promise<void> {
    if (!app.isPackaged) {
      log.info('[AutoUpdater] Skipping update check in development mode');
      return;
    }

    try {
      await this.updater.checkForUpdates();
    } catch (error) {
      log.error('[AutoUpdater] Check failed:', error);
    }
  }

  /**
   * Start periodic update checks
   */
  public startPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Initial check after 30 seconds
    setTimeout(() => this.checkForUpdates(), 30_000);

    // Periodic checks
    this.checkInterval = setInterval(
      () => this.checkForUpdates(),
      this.config.checkInterval
    );

    log.info(`[AutoUpdater] Periodic checks started (every ${this.config.checkInterval / 3600000}h)`);
  }

  /**
   * Stop periodic update checks
   */
  public stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Download available update
   */
  public async downloadUpdate(): Promise<void> {
    try {
      await this.updater.downloadUpdate();
    } catch (error) {
      log.error('[AutoUpdater] Download failed:', error);
    }
  }

  /**
   * Install the downloaded update and restart the app
   */
  public installUpdate(): void {
    if (!this.updateDownloaded) {
      log.warn('[AutoUpdater] No update downloaded yet');
      return;
    }

    log.info('[AutoUpdater] Quitting and installing update...');
    this.updater.quitAndInstall(false, true);
  }

  /**
   * Get current update status
   */
  public getStatus(): UpdateStatus {
    return this.status;
  }

  // ── Private helpers ────────────────────────────────────────

  private setStatus(update: Partial<UpdateStatus>): void {
    this.status = {
      ...this.status,
      ...update,
    };
    this.broadcastStatus();
  }

  private broadcastStatus(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('updater:status', this.status);
    }
  }

  private notifyUpdateAvailable(version: string): void {
    if (Notification.isSupported()) {
      new Notification({
        title: 'ZENO Browser Update Available',
        body: `Version ${version} is available. Click to download.`,
        icon: path.join(__dirname, '../../assets/installer/icon.png'),
      }).show();
    }

    // Also show dialog if window is open
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: `ZENO Browser ${version} is available.`,
        detail: 'Would you like to download and install the update now?',
        buttons: ['Download Now', 'Later'],
        defaultId: 0,
      }).then(({ response }) => {
        if (response === 0) {
          this.downloadUpdate();
        }
      });
    }
  }

  private notifyUpdateReady(version: string): void {
    if (Notification.isSupported()) {
      new Notification({
        title: 'ZENO Browser Ready to Update',
        body: `Version ${version} downloaded. Restart to apply.`,
      }).show();
    }

    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      dialog.showMessageBox(this.mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: `ZENO Browser ${version} has been downloaded.`,
        detail: 'Restart now to apply the update, or it will be applied on next launch.',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
      }).then(({ response }) => {
        if (response === 0) {
          this.installUpdate();
        }
      });
    }
  }

  // ── Cleanup ────────────────────────────────────────────────

  public dispose(): void {
    this.stopPeriodicChecks();
    ipcMain.removeHandler('updater:check');
    ipcMain.removeHandler('updater:download');
    ipcMain.removeHandler('updater:install');
    ipcMain.removeHandler('updater:status');
    ipcMain.removeHandler('updater:getVersion');
  }
}

// ─────────────────────────────────────────────────────────────
// Singleton factory
// ─────────────────────────────────────────────────────────────

let _instance: AutoUpdaterService | null = null;

export function createAutoUpdater(config?: Partial<UpdaterConfig>): AutoUpdaterService {
  if (!_instance) {
    _instance = new AutoUpdaterService(config);
  }
  return _instance;
}

export function getAutoUpdater(): AutoUpdaterService | null {
  return _instance;
}
