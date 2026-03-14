/**
 * Cloudflare Tunnel Management Panel
 * Floating panel for managing tunnels
 */

import React, { useState, useEffect } from 'react';
import './CloudflareTunnelPanel.css';

interface TunnelStatus {
  hostname: string;
  service: string;
  status: 'active' | 'disconnected' | 'error';
  lastCheck: Date;
  uptime: number;
  requestsPerMinute: number;
}

interface CloudflareTunnelPanelProps {
  onClose: () => void;
}

export const CloudflareTunnelPanel: React.FC<CloudflareTunnelPanelProps> = ({
  onClose,
}) => {
  const [tunnels, setTunnels] = useState<TunnelStatus[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const electronAPI = (window as any).electronAPI;

  useEffect(() => {
    loadTunnelStatus();

    if (autoRefresh) {
      const interval = setInterval(loadTunnelStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadTunnelStatus = async () => {
    try {
      const status = await electronAPI.tunnel?.status?.();
      const metrics = await electronAPI.tunnel?.metrics?.();

      if (status) setTunnels(status);
      if (metrics) setMetrics(metrics);
    } catch (error) {
      console.error('Failed to load tunnel status:', error);
    }
  };

  const handleReconnect = async () => {
    setLoading(true);
    try {
      await electronAPI.tunnel?.reconnect?.();
      await loadTunnelStatus();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#00aa00';
      case 'error':
        return '#ff0000';
      case 'disconnected':
        return '#ffaa00';
      default:
        return '#666';
    }
  };

  return (
    <div className="tunnel-panel floating-panel">
      <div className="panel-header">
        <h2>🌐 Cloudflare Tunnels</h2>
        <button className="btn-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="panel-content">
        {/* Metrics Summary */}
        {metrics && (
          <div className="metrics-summary">
            <div className="metric">
              <span className="metric-label">Active Routes</span>
              <span className="metric-value">{metrics.activeRoutes}/{metrics.totalRoutes}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Failed</span>
              <span className="metric-value error">{metrics.failedRoutes}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Avg Uptime</span>
              <span className="metric-value">
                {(metrics.uptime || 0).toFixed(1)}s
              </span>
            </div>
          </div>
        )}

        {/* Tunnel Status Table */}
        <div className="tunnels-table">
          <table>
            <thead>
              <tr>
                <th>Hostname</th>
                <th>Service</th>
                <th>Status</th>
                <th>Uptime</th>
                <th>RPM</th>
              </tr>
            </thead>
            <tbody>
              {tunnels.map((tunnel) => (
                <tr key={tunnel.hostname}>
                  <td className="hostname">
                    <a
                      href={`https://${tunnel.hostname}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {tunnel.hostname}
                    </a>
                  </td>
                  <td className="service">{tunnel.service}</td>
                  <td className="status">
                    <span
                      className={`status-badge status-${tunnel.status}`}
                      style={{ backgroundColor: getStatusColor(tunnel.status) }}
                    >
                      {tunnel.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="uptime">{tunnel.uptime}s</td>
                  <td className="rpm">{tunnel.requestsPerMinute}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Controls */}
        <div className="panel-controls">
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>

          <button
            className="btn-primary"
            onClick={handleReconnect}
            disabled={loading}
          >
            {loading ? 'Reconnecting...' : 'Reconnect'}
          </button>

          <button className="btn-secondary" onClick={loadTunnelStatus}>
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
};