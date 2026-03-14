/**
 * Browser Manager - Tab and window management
 */

import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
  isActive: boolean;
  createdAt: Date;
  lastAccessedAt: Date;
}

export class BrowserManager {
  private tabs: Map<string, BrowserTab> = new Map();
  private activeTabId: string | null = null;
  private sessionFilePath: string;

  constructor(userDataPath: string = '') {
    this.sessionFilePath = userDataPath ? path.join(userDataPath, 'session.json') : '';
  }

  createTab(url = 'about:blank', title = 'New Tab'): BrowserTab {
    const tab: BrowserTab = {
      id: uuidv4(),
      url,
      title,
      isActive: this.tabs.size === 0, // First tab is active
      createdAt: new Date(),
      lastAccessedAt: new Date(),
    };

    this.tabs.set(tab.id, tab);

    if (tab.isActive) {
      this.activeTabId = tab.id;
    }

    console.log(`✅ Tab created: ${tab.id}`);
    return tab;
  }

  closeTab(tabId: string): boolean {
    if (!this.tabs.has(tabId)) {
      return false;
    }

    this.tabs.delete(tabId);

    // Switch to previous or next tab
    if (this.activeTabId === tabId) {
      const remainingTabs = Array.from(this.tabs.values());
      if (remainingTabs.length > 0) {
        this.activeTabId = remainingTabs[remainingTabs.length - 1].id;
      } else {
        this.activeTabId = null;
      }
    }

    console.log(`✅ Tab closed: ${tabId}`);
    return true;
  }

  navigate(tabId: string, url: string): boolean {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      return false;
    }

    tab.url = url;
    tab.lastAccessedAt = new Date();

    console.log(`🔗 Navigated to: ${url}`);
    return true;
  }

  setActiveTab(tabId: string): boolean {
    if (!this.tabs.has(tabId)) {
      return false;
    }

    // Deactivate current active tab
    if (this.activeTabId) {
      const activeTab = this.tabs.get(this.activeTabId);
      if (activeTab) {
        activeTab.isActive = false;
      }
    }

    // Activate new tab
    const newActiveTab = this.tabs.get(tabId);
    if (newActiveTab) {
      newActiveTab.isActive = true;
      newActiveTab.lastAccessedAt = new Date();
      this.activeTabId = tabId;
    }

    return true;
  }

  getTabs(): BrowserTab[] {
    return Array.from(this.tabs.values()).sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  getTab(tabId: string): BrowserTab | undefined {
    return this.tabs.get(tabId);
  }

  getActiveTab(): BrowserTab | null {
    if (!this.activeTabId) {
      return null;
    }
    return this.tabs.get(this.activeTabId) || null;
  }

  updateTabTitle(tabId: string, title: string): boolean {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      return false;
    }

    tab.title = title;
    return true;
  }

  updateTabFavicon(tabId: string, favicon: string): boolean {
    const tab = this.tabs.get(tabId);
    if (!tab) {
      return false;
    }

    tab.favicon = favicon;
    return true;
  }

  getTabCount(): number {
    return this.tabs.size;
  }

  clearAll(): void {
    this.tabs.clear();
    this.activeTabId = null;
    console.log('🗑️ All tabs cleared');
    this.saveSession();
  }

  public saveSession(): void {
    if (!this.sessionFilePath) return;
    try {
      const data = {
        tabs: Array.from(this.tabs.values()),
        activeTabId: this.activeTabId
      };
      fs.writeFileSync(this.sessionFilePath, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Failed to save browser session:', err);
    }
  }

  public loadSession(): boolean {
    if (!this.sessionFilePath || !fs.existsSync(this.sessionFilePath)) return false;
    try {
      const data = JSON.parse(fs.readFileSync(this.sessionFilePath, 'utf-8'));
      if (data && Array.isArray(data.tabs)) {
        this.tabs.clear();
        for (const t of data.tabs) {
          // ensure dates are properly parsed
          t.createdAt = new Date(t.createdAt);
          t.lastAccessedAt = new Date(t.lastAccessedAt);
          this.tabs.set(t.id, t);
        }
        this.activeTabId = data.activeTabId || null;
        console.log(`✅ Loaded ${this.tabs.size} tabs from session`);
        return true;
      }
    } catch (err) {
      console.error('Failed to load browser session:', err);
    }
    return false;
  }
}