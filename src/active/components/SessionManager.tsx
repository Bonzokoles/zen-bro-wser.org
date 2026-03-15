// src/active/components/SessionManager.tsx
import React, { useState, useEffect } from 'react';
import type { Session } from '../services/session-manager';
import { SessionManager as SessionManagerClass } from '../services/session-manager';

interface SessionManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSession: (tabs: any[]) => void;
  onSaveSession: (name: string) => Promise<void>;
}

const sessionManager = new SessionManagerClass();

const SessionManager: React.FC<SessionManagerProps> = ({ isOpen, onClose, onRestoreSession, onSaveSession }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionName, setSessionName] = useState('');

  const refreshSessions = async () => {
    const loadedSessions = await sessionManager.getSessions();
    setSessions(loadedSessions);
  };

  useEffect(() => {
    if (isOpen) {
      refreshSessions();
    }
  }, [isOpen]);

  const handleSaveSession = async () => {
    if (!sessionName.trim()) return;
    await onSaveSession(sessionName);
    setSessionName('');
    refreshSessions();
  };

  const handleRestore = async (sessionId: string) => {
    try {
      const tabs = await sessionManager.restoreSession(sessionId);
      onRestoreSession(tabs);
      onClose();
    } catch (error) {
      alert(`Error restoring session: ${(error as Error).message}`);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      await sessionManager.deleteSession(sessionId);
      refreshSessions();
    }
  };
  
  const formatDate = (date: Date) => new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);

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
          <h2 style={{ margin: 0, color: 'white', fontSize: '18px' }}>Saved Sessions</h2>
        </div>
        
        <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(80vh - 140px)' }}>
          {sessions.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center' }}>No saved sessions.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sessions.map(session => (
                <div key={session.id} style={{
                  padding: '12px', background: '#334155', borderRadius: '8px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '16px' }}>{session.name}</h3>
                    <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>
                      {session.tabs.length} tabs • Last used: {formatDate(session.lastAccessed)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleRestore(session.id)} style={{ /* styles */ }}>Restore</button>
                    <button onClick={() => handleDelete(session.id)} style={{ /* styles */ }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #334155', display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="New session name..."
            style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
          />
          <button onClick={handleSaveSession} style={{ /* styles */ }}>Save Current Session</button>
          <button onClick={onClose} style={{ /* styles */ }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default SessionManager;
