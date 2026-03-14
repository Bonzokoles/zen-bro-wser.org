/**
 * Auto-Updater Service
 * Handles checking for and installing updates
 */
export interface UpdateInfo {
    version: string;
    releaseDate: string;
    releaseNotes: string[];
    isUpdateAvailable: boolean;
}
export declare class AutoUpdaterService {
    private isCheckingForUpdate;
    private updateCheckInterval;
    constructor();
    private configureAutoUpdater;
    private setupIPC;
    private notifyUpdateAvailable;
    private notifyUpdateReady;
    /**
     * Start automatic update checks
     */
    startAutoChecks(intervalHours?: number): void;
    /**
     * Stop automatic update checks
     */
    stopAutoChecks(): void;
    /**
     * Manual check for updates
     */
    checkForUpdates(): Promise<UpdateInfo>;
    private parseReleaseNotes;
}
export declare const autoUpdaterService: AutoUpdaterService;
