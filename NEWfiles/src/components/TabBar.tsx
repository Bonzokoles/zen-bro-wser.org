/**
 * Tab Bar Component
 */

import React from 'react';

interface Tab {
  id: string;
  title: string;
  url: string;
  isActive: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onNewTab: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  onTabClick,
  onTabClose,
  onNewTab,
}) => {
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`tab ${tab.isActive ? 'active' : ''}`}
          onClick={() => onTabClick(tab.id)}
        >
          <span className="tab-title">{tab.title || 'New Tab'}</span>
          <button
            className="btn-close-tab"
            onClick={(e) => {
              e.stopPropagation();
              onTabClose(tab.id);
            }}
          >
            ×
          </button>
        </div>
      ))}
      <button className="btn-new-tab" onClick={onNewTab}>
        +
      </button>
    </div>
  );
};