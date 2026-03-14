/**
 * ZENO Browser - Auto-Updater Service (Electron)
 * Manages automatic updates via electron-updater
 */

// Only runs in Electron main process
export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
  downloadUrl?: string;
}

export interface UpdaterConfig {
  autoDownload?: boolean;
  autoInstallOnAppQuit?: boolean;
  allowPrerelease?: boolean;
  feedUrl?: string;
}

export class AutoUpdater {
  private config: UpdaterConfig;
  private updateAvailable = false;
  private currentVersion: string;

  constructor(currentVersion: string, config: UpdaterConfig = {}) {
    this.currentVersion = currentVersion;
    this.config = {
      autoDownload: false,
      autoInstallOnAppQuit: true,
      allowPrerelease: false,
      ...config,
    };
  }

  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      const url = this.config.feedUrl || 
        'https://api.github.com/repos/Bonzokoles/zen-bro-wser.org/releases/latest';
      const response = await fetch(url, {
        headers: { 'User-Agent': `ZENO-Browser/${this.currentVersion}` },
      });
      if (!response.ok) return null;
      const release = await response.json() as { tag_name: string; published_at: string; body?: string };
      const latestVersion = release.tag_name.replace(/^v/, '');
      if (this.isNewerVersion(latestVersion, this.currentVersion)) {
        this.updateAvailable = true;
        return {
          version: latestVersion,
          releaseDate: release.published_at,
          releaseNotes: release.body,
        };
      }
      return null;
    } catch (err) {
      console.error('Update check failed:', err);
      return null;
    }
  }

  private isNewerVersion(latest: string, current: string): boolean {
    const latestParts = latest.split('.').map(Number);
    const currentParts = current.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((latestParts[i] || 0) > (currentParts[i] || 0)) return true;
      if ((latestParts[i] || 0) < (currentParts[i] || 0)) return false;
    }
    return false;
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  getConfig(): UpdaterConfig {
    return { ...this.config };
  }
}

export function createAutoUpdater(version: string, config?: UpdaterConfig): AutoUpdater {
  return new AutoUpdater(version, config);
}
