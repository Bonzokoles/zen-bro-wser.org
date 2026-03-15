// src/active/components/DownloadManager.tsx
import React, { useState, useEffect, useMemo } from 'react';
import type { Download } from '../services/download-manager';
import { DownloadManager as DownloadManagerClass } from '../services/download-manager';

interface DownloadManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const downloadManager = new DownloadManagerClass();

const DownloadManager: React.FC<DownloadManagerProps> = ({ isOpen, onClose }) => {
  const [downloads, setDownloads] = useState<Download[]>([]);

  const refreshDownloads = () => {
    setDownloads(Array.from(downloadManager.downloads.values()));
  };

  useEffect(() => {
    if (isOpen) {
      refreshDownloads();
    }

    const handler = () => {
      refreshDownloads();
    };

    window.addEventListener('download:progress', handler);
    window.addEventListener('download:statusChange', handler);
    window.addEventListener('download:completed', handler);
    window.addEventListener('download:failed', handler);
    window.addEventListener('download:cancelled', handler);
    window.addEventListener('download:added', handler);

    return () => {
      window.removeEventListener('download:progress', handler);
      window.removeEventListener('download:statusChange', handler);
      window.removeEventListener('download:completed', handler);
      window.removeEventListener('download:failed', handler);
      window.removeEventListener('download:cancelled', handler);
      window.removeEventListener('download:added', handler);
    };
  }, [isOpen]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (download: Download) => {
    if (download.status !== 'downloading') return '';
    const elapsed = (Date.now() - download.startTime.getTime()) / 1000; // in seconds
    if (elapsed === 0) return '0 B/s';
    const speed = download.downloaded / elapsed;
    return `${formatBytes(speed)}/s`;
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '600px', maxHeight: '80vh', backgroundColor: '#1e293b',
        borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #334155' }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '18px' }}>Downloads</h2>
        </div>
        
        <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(80vh - 140px)' }}>
          {downloads.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>No active downloads.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {downloads.map(download => (
                <div key={download.id} style={{
                  padding: '12px', background: '#334155', borderRadius: '8px',
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>{download.filename}</span>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                      {formatBytes(download.downloaded)} / {formatBytes(download.filesize)}
                    </span>
                  </div>
                  <div style={{ width: '100%', background: '#475569', borderRadius: '4px', height: '8px' }}>
                    <div
                      style={{
                        width: `${(download.downloaded / download.filesize) * 100}%`,
                        background: '#10b981', borderRadius: '4px', height: '100%',
                        transition: 'width 0.3s ease-out'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                      {download.status === 'downloading' && formatSpeed(download)}
                      {download.status === 'completed' && '✓ Completed'}
                      {download.status === 'failed' && `✗ Failed: ${download.error}`}
                      {download.status === 'paused' && '‖ Paused'}
                      {download.status === 'pending' && '... Pending'}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {download.status === 'downloading' && (
                        <button onClick={() => downloadManager.pauseDownload(download.id)} style={{ /* styles */ }}>Pause</button>
                      )}
                      {download.status === 'paused' && (
                        <button onClick={() => downloadManager.resumeDownload(download.id)} style={{ /* styles */ }}>Resume</button>
                      )}
                      {(download.status === 'downloading' || download.status === 'paused' || download.status === 'pending') && (
                        <button onClick={() => downloadManager.cancelDownload(download.id)} style={{ /* styles */ }}>Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #334155', textAlign: 'right' }}>
          <button onClick={onClose} style={{ /* styles */ }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default DownloadManager;
