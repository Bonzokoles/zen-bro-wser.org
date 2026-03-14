/**
 * Update Notification Component
 * Shows update availability and progress
 */

import React, { useState, useEffect } from 'react';
import './UpdateNotification.css';

interface UpdateNotificationProps {
  onDismiss: () => void;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onDismiss }) => {
  const [updateInfo, setUpdateInfo] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const electronAPI = (window as any).electronAPI;

  useEffect(() => {
    checkForUpdates();

    // Listen for update progress
    const unsubscribe = electronAPI?.on?.('update-progress', (progressData: any) => {
      setProgress(Math.round(progressData.percent));
      setIsDownloading(true);
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      const result = await electronAPI?.updater?.checkForUpdates?.();
      if (result?.isUpdateAvailable) {
        setUpdateInfo(result);
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  const handleInstall = async () => {
    try {
      await electronAPI?.updater?.installUpdate?.();
    } catch (error) {
      console.error('Failed to install update:', error);
    }
  };

  if (!updateInfo?.isUpdateAvailable) {
    return null;
  }

  return (
    <div className="update-notification">
      <div className="notification-content">
        <h3>Update Available</h3>
        <p>ZENO Browser {updateInfo.version} is now available</p>

        {isDownloading && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
            <span className="progress-text">{progress}%</span>
          </div>
        )}

        {isReady && (
          <p className="ready-message">✅ Update is ready to install</p>
        )}

        <div className="notification-actions">
          <button className="btn-dismiss" onClick={onDismiss}>
            Dismiss
          </button>
          <button
            className="btn-install"
            onClick={handleInstall}
            disabled={!isReady && !isDownloading}
          >
            {isReady ? 'Install & Restart' : isDownloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
};