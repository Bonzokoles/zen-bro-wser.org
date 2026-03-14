// src/active/components/TabGroups.tsx
import React from 'react';
import type { TabGroup } from '../services/tab-groups';

interface TabGroupsProps {
  groups: TabGroup[];
  activeGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onAutoGroup: () => void;
}

const TabGroups: React.FC<TabGroupsProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  onAutoGroup,
}) => {
  if (groups.length === 0) {
    return (
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={onAutoGroup}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #334155',
            background: '#1e293b',
            color: '#f1f5f9',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          + Auto Group Tabs
        </button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '8px 12px',
      borderBottom: '1px solid #475569',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      overflowX: 'auto'
    }}>
      <button
        onClick={() => onSelectGroup(null)}
        style={{
          padding: '6px 12px',
          borderRadius: '8px',
          border: 'none',
          background: !activeGroupId ? '#6366f1' : '#334155',
          color: 'white',
          fontSize: '13px',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        All Tabs
      </button>

      {groups.map(group => (
        <button
          key={group.id}
          onClick={() => onSelectGroup(group.id)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: 'none',
            borderLeft: `4px solid ${group.color}`,
            background: activeGroupId === group.id ? '#6366f1' : '#334155',
            color: 'white',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexShrink: 0
          }}
        >
          <span>{group.name}</span>
          <span style={{
            fontSize: '11px',
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '4px',
            padding: '2px 5px'
          }}>
            {group.tabIds.length}
          </span>
        </button>
      ))}
      
      <button
        onClick={onAutoGroup}
        style={{
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid #334155',
          background: '#1e293b',
          color: '#f1f5f9',
          fontSize: '12px',
          cursor: 'pointer',
          marginLeft: 'auto'
        }}
      >
        Re-Group
      </button>
    </div>
  );
};

export default TabGroups;
