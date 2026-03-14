// src/active/components/WorkspaceSwitcher.tsx
import React, { useState, useEffect } from 'react';
import type { Workspace } from '../services/workspace-manager';

interface WorkspaceSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSwitchWorkspace: (workspaceId: string) => void;
  onCreateWorkspace: (name: string, icon: string, color: string) => void;
}

const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  isOpen,
  onClose,
  workspaces,
  activeWorkspaceId,
  onSwitchWorkspace,
  onCreateWorkspace,
}) => {
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceIcon, setNewWorkspaceIcon] = useState('✨');
  const [newWorkspaceColor, setNewWorkspaceColor] = useState('#6366f1');

  const handleCreate = () => {
    if (newWorkspaceName.trim()) {
      onCreateWorkspace(newWorkspaceName, newWorkspaceIcon, newWorkspaceColor);
      setNewWorkspaceName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)', zIndex: 2000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '700px', maxHeight: '80vh', backgroundColor: '#1e293b',
        borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #334155' }}>
          <h2 style={{ margin: 0, color: 'white', fontSize: '18px' }}>Workspace Switcher</h2>
        </div>
        
        <div style={{ padding: '16px', overflowY: 'auto', maxHeight: 'calc(80vh - 200px)' }}>
          <h3 style={{ color: 'white', marginBottom: '12px' }}>Your Workspaces</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => onSwitchWorkspace(ws.id)}
                style={{
                  background: activeWorkspaceId === ws.id ? ws.color : '#334155',
                  color: 'white', border: 'none', borderRadius: '8px',
                  padding: '16px', cursor: 'pointer', fontSize: '14px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: activeWorkspaceId === ws.id ? `0 4px 15px ${ws.color}40` : 'none'
                }}
              >
                <span style={{ fontSize: '28px' }}>{ws.icon}</span>
                <span>{ws.name}</span>
              </button>
            ))}
          </div>

          <h3 style={{ color: 'white', marginBottom: '12px' }}>Create New Workspace</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Workspace Name"
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: 'white' }}
            />
            <input
              type="text"
              value={newWorkspaceIcon}
              onChange={(e) => setNewWorkspaceIcon(e.target.value)}
              placeholder="Icon (e.g., 🏠)"
              style={{ width: '60px', padding: '8px', borderRadius: '6px', border: '1px solid #475569', background: '#0f172a', color: 'white', textAlign: 'center' }}
            />
            <input
              type="color"
              value={newWorkspaceColor}
              onChange={(e) => setNewWorkspaceColor(e.target.value)}
              style={{ width: '40px', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            />
            <button onClick={handleCreate} style={{ /* styles */ }}>Create</button>
          </div>
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #334155', textAlign: 'right' }}>
          <button onClick={onClose} style={{ /* styles */ }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSwitcher;
