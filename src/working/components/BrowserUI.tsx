/**
 * Browser UI - Main React Component
 * Handles tab management, navigation, and AI integration
 */

import React, { useState, useEffect } from 'react';
import { AIPanel } from './AIPanel';
import TabBar from './TabBar';
import AddressBar from './AddressBar';
import { SecurityMonitor } from './SecurityMonitor';

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isActive: boolean;
}

export const BrowserUI: React.FC = () => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [currentUrl, setCurrentUrl] = useState('about:blank');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  const electronAPI = (window as any).electronAPI;

  useEffect(() => {
    loadTabs();
  }, []);

  const loadTabs = async () => {
    try {
      const loadedTabs = await electronAPI.browser.getTabs();
      setTabs(loadedTabs);
    } catch (error) {
      console.error('Failed to load tabs:', error);
    }
  };

  const handleNewTab = async () => {
    try {
      const newTab = await electronAPI.browser.newTab();
      setTabs([...tabs, newTab]);
    } catch (error) {
      console.error('Failed to create tab:', error);
    }
  };

  const handleCloseTab = async (tabId: string) => {
    try {
      await electronAPI.browser.closeTab(tabId);
      setTabs(tabs.filter(t => t.id !== tabId));
    } catch (error) {
      console.error('Failed to close tab:', error);
    }
  };

  const handleNavigate = async (url: string) => {
    try {
      const activeTab = tabs.find(t => t.isActive);
      if (activeTab) {
        setLoading(true);
        await electronAPI.browser.navigate(activeTab.id, url);
        setCurrentUrl(url);
      }
    } catch (error) {
      console.error('Failed to navigate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = async (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setCurrentUrl(tab.url);
      setTabs(
        tabs.map(t => ({
          ...t,
          isActive: t.id === tabId,
        }))
      );
    }
  };

  return (
    <div className="browser-container">
      {/* Header */}
      <header className="browser-header">
        <div className="controls">
          <button className="btn-icon" onClick={() => handleNavigate('about:blank')}>
            ←
          </button>
          <button className="btn-icon" onClick={() => handleNavigate(currentUrl)}>
            →
          </button>
          <button className="btn-icon" onClick={() => loadTabs()}>
            ⟳
          </button>
        </div>

        {/* Address Bar */}
        <AddressBar
          url={currentUrl}
          onNavigate={handleNavigate}
          loading={loading}
        />

        <div className="header-controls">
          <button
            className="btn-icon"
            onClick={() => setShowAIPanel(!showAIPanel)}
            title="AI Assistant"
          >
            🤖
          </button>
          <button
            className="btn-icon"
            onClick={() => setShowSecurityPanel(!showSecurityPanel)}
            title="Security"
          >
            🔒
          </button>
          <button className="btn-icon" onClick={() => handleNewTab()} title="New Tab">
            +
          </button>
        </div>
      </header>

      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        onTabClick={handleTabClick}
        onTabClose={handleCloseTab}
        onNewTab={handleNewTab}
      />

      {/* Main Content */}
      <main className="browser-main">
        {/* Web View Placeholder */}
        <div className="web-view">
          <p>Browser window would render here</p>
          <p>Current URL: {currentUrl}</p>
        </div>

        {/* Floating Panels */}
        {showAIPanel && <AIPanel onClose={() => setShowAIPanel(false)} />}
        {showSecurityPanel && (
          <SecurityMonitor onClose={() => setShowSecurityPanel(false)} />
        )}
      </main>

      {/* Status Bar */}
      <footer className="browser-footer">
        <span>Ready</span>
        <span>{tabs.length} tab(s)</span>
      </footer>
    </div>
  );
};