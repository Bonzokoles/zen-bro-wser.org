// src/active/services/download-manager.ts

export interface Download {
  id: string;
  url: string;
  filename: string;
  filesize: number; // Total size in bytes
  downloaded: number; // Bytes downloaded
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  error?: string;
}

export class DownloadManager {
  downloads: Map<string, Download> = new Map();
  activeDownloads = 0;
  maxConcurrent = 3;

  constructor() {
    // Restore downloads from localStorage on init
    this.loadDownloads();
    // Start processing any pending downloads
    this.processQueue();
  }

  private async loadDownloads() {
    const savedDownloads = localStorage.getItem('downloads');
    if (savedDownloads) {
      const downloadsArray: Download[] = JSON.parse(savedDownloads);
      downloadsArray.forEach(d => {
        // Re-hydrate Date objects
        d.startTime = new Date(d.startTime);
        if (d.endTime) d.endTime = new Date(d.endTime);
        this.downloads.set(d.id, d);
      });
    }
  }

  private saveDownloads() {
    localStorage.setItem('downloads', JSON.stringify(Array.from(this.downloads.values())));
  }

  async startDownload(url: string, filename?: string): Promise<string> {
    const id = crypto.randomUUID();

    // Simulate getting file info (head request might be blocked by CORS)
    const simulatedFilesize = Math.floor(Math.random() * 10 * 1024 * 1024) + 1024 * 1024; // 1MB to 11MB

    const download: Download = {
      id,
      url,
      filename: filename || this.extractFilename(url),
      filesize: simulatedFilesize,
      downloaded: 0,
      status: 'pending',
      startTime: new Date()
    };

    this.downloads.set(id, download);
    this.saveDownloads();
    this.emit('added', download);
    this.processQueue();

    return id;
  }

  private async processQueue() {
    if (this.activeDownloads >= this.maxConcurrent) return;

    const pending = Array.from(this.downloads.values())
      .find(d => d.status === 'pending' || d.status === 'paused');

    if (!pending) return;

    this.activeDownloads++;
    pending.status = 'downloading';
    this.emit('statusChange', pending);
    this.saveDownloads();

    try {
      await this.simulateDownload(pending);
      pending.status = 'completed';
      pending.endTime = new Date();
      this.emit('completed', pending);
    } catch (error) {
      pending.status = 'failed';
      pending.error = (error as Error).message;
      this.emit('failed', pending);
    } finally {
      this.activeDownloads--;
      this.saveDownloads();
      this.processQueue(); // Process next in queue
    }
  }

  private async simulateDownload(download: Download): Promise<void> {
    const totalChunks = 100;
    const chunkSize = download.filesize / totalChunks;

    for (let i = 0; i < totalChunks; i++) {
      if (download.status === 'paused') {
        throw new Error('Download paused');
      }
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      download.downloaded += chunkSize;
      if (download.downloaded > download.filesize) download.downloaded = download.filesize;
      this.emit('progress', download);
    }
  }

  pauseDownload(id: string) {
    const download = this.downloads.get(id);
    if (download && download.status === 'downloading') {
      download.status = 'paused';
      this.emit('statusChange', download);
      this.saveDownloads();
    }
  }

  resumeDownload(id: string) {
    const download = this.downloads.get(id);
    if (download && download.status === 'paused') {
      download.status = 'pending';
      this.emit('statusChange', download);
      this.saveDownloads();
      this.processQueue();
    }
  }

  cancelDownload(id: string) {
    const download = this.downloads.get(id);
    if (download) {
      this.downloads.delete(id);
      this.emit('cancelled', download);
      this.saveDownloads();
    }
  }

  private extractFilename(url: string): string {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const filename = path.split('/').pop();
      return filename || 'download';
    } catch {
      return 'download';
    }
  }

  private emit(event: string, data: Download) {
    window.dispatchEvent(new CustomEvent(`download:${event}`, { detail: data }));
  }
}
