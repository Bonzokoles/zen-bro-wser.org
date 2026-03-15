/**
 * Security Monitor Panel
 */

import React, { useState, useEffect } from 'react';

interface SecurityMonitorProps {
  onClose: () => void;
}

export const SecurityMonitor: React.FC<SecurityMonitorProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [report, setReport] = useState<any>(null);

  const electronAPI = (window as any).electronAPI;

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const auditLogs = await electronAPI.security.getAuditLogs();
      setLogs(auditLogs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  return (
    <div className="security-panel floating-panel">
      <div className="panel-header">
        <h2>🔒 Security Monitor</h2>
        <button className="btn-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="panel-content">
        <div className="audit-logs">
          <h3>Audit Logs:</h3>
          {logs.length === 0 ? (
            <p>No security events logged</p>
          ) : (
            <ul>
              {logs.slice(-10).map((log, i) => (
                <li key={i} className={`log-${log.type.toLowerCase()}`}>
                  <span className="log-type">{log.type}</span>
                  <span className="log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={loadLogs} className="btn-small">
          Refresh Logs
        </button>
      </div>
    </div>
  );
};