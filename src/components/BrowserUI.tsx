/**
 * Browser UI - Main React Component
 * ZENO Premium Theme & Platform Architecture (K.R.A.F.T. v3)
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { AIPanel } from './AIPanel';
import { TabBar } from './TabBar';
import { AddressBar } from './AddressBar';
import { SecurityMonitor } from './SecurityMonitor';
import { TerminalPanel } from './TerminalPanel';
import WebView from './WebView';
import './BrowserUI.css';

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

  // Guard against SSR – window is not available during Astro server-side rendering
  const electronAPI = (typeof window !== 'undefined') ? (window as any).electronAPI : undefined;

  useEffect(() => {
    loadTabs();
  }, []);

  const loadTabs = async () => {
    try {
      if (electronAPI) {
        const loadedTabs = await electronAPI.browser.getTabs();
        setTabs(loadedTabs);
      } else {
        setTabs([{ id: 'mock-1', title: 'Start Page', url: 'about:blank', isActive: true }]);
      }
    } catch (error) {
      console.error('Failed to load tabs:', error);
    }
  };

  const handleNewTab = async () => {
    try {
      if (electronAPI) {
        const newTab = await electronAPI.browser.newTab();
        setTabs([...tabs, newTab]);
      } else {
        const newTab = { id: `mock-${Date.now()}`, title: 'New Tab', url: 'about:blank', isActive: true };
        setTabs(tabs.map(t => ({...t, isActive: false })).concat(newTab));
      }
    } catch (error) {
      console.error('Failed to create tab:', error);
    }
  };

  const handleCloseTab = async (tabId: string) => {
    try {
      if (electronAPI) {
        await electronAPI.browser.closeTab(tabId);
      }
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
        if (electronAPI) {
          await electronAPI.browser.navigate(activeTab.id, url);
        }
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
      {/* Header Bar */}
      <header className="browser-header">
        <div className="controls">
          <button className="zeno-btn" onClick={() => handleNavigate('about:blank')} title="Back">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
          </button>
          <button className="zeno-btn" onClick={() => handleNavigate(currentUrl)} title="Forward">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
          </button>
          <button className="zeno-btn" onClick={() => loadTabs()} title="Reload">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
          </button>
        </div>

        {/* Scalable Address Bar */}
        <div style={{ flex: 1, margin: '0 12px' }}>
          <AddressBar
            url={currentUrl}
            onNavigate={handleNavigate}
            loading={loading}
          />
        </div>

        <div className="header-controls">
          <button
            className={`zeno-btn ${showAIPanel ? 'primary' : ''}`}
            onClick={() => setShowAIPanel(!showAIPanel)}
            title="ZENO Intelligence AI"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"></path></svg> AI
          </button>
          <button
            className={`zeno-btn ${showSecurityPanel ? 'primary' : ''}`}
            onClick={() => setShowSecurityPanel(!showSecurityPanel)}
            title="Sandbox & Security Panel"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
          </button>
          <button className="zeno-btn" onClick={() => handleNewTab()} title="New Sandbox Tab">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"></path></svg>
          </button>
        </div>
      </header>

      {/* Tabs Row */}
      <TabBar
        tabs={tabs}
        onTabClick={handleTabClick}
        onTabClose={handleCloseTab}
        onNewTab={handleNewTab}
      />

      {/* Main Content Area */}
      <main className="browser-main zeno-glass-panel" style={{ borderRadius: 0, borderRight: 0, borderLeft: 0, borderBottom: 0 }}>
        
        {/* Web View Placeholder (Sandbox/Classic Dual Engine) */}
        <section className="web-view">
          <WebView 
             url={currentUrl || 'about:blank'} 
             isLoading={loading} 
             title={tabs.find(t => t.isActive)?.title || 'ZENO'} 
             topOffset={0} 
          />
        </section>

        {/* Floating Tool Panels Layer */}
        <div className="floating-overlay">
          {showAIPanel && (
            <div className="zeno-glass-panel animate-slide-up">
              <AIPanel onClose={() => setShowAIPanel(false)} />
            </div>
          )}
          
          {showSecurityPanel && (
            <div className="zeno-glass-panel animate-slide-up">
              <SecurityMonitor onClose={() => setShowSecurityPanel(false)} />
            </div>
          )}
        </div>
      </main>

      {/* Terminal Console Panel at Bottom */}
      <TerminalPanel />

      {/* Status Footer */}
      <footer className="browser-footer">
        <span>ZENO Base Node Online</span>
        <span style={{ color: 'var(--zeno-primary)' }}>{tabs.length} Instances Isolated</span>
      </footer>
    </div>
  );
};