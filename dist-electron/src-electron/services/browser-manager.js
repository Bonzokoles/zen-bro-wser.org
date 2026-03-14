"use strict";
/**
 * Browser Manager - Tab and window management
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrowserManager = void 0;
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class BrowserManager {
    constructor(userDataPath = '') {
        this.tabs = new Map();
        this.activeTabId = null;
        this.sessionFilePath = userDataPath ? path.join(userDataPath, 'session.json') : '';
    }
    createTab(url = 'about:blank', title = 'New Tab') {
        const tab = {
            id: (0, uuid_1.v4)(),
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
    closeTab(tabId) {
        if (!this.tabs.has(tabId)) {
            return false;
        }
        this.tabs.delete(tabId);
        // Switch to previous or next tab
        if (this.activeTabId === tabId) {
            const remainingTabs = Array.from(this.tabs.values());
            if (remainingTabs.length > 0) {
                this.activeTabId = remainingTabs[remainingTabs.length - 1].id;
            }
            else {
                this.activeTabId = null;
            }
        }
        console.log(`✅ Tab closed: ${tabId}`);
        return true;
    }
    navigate(tabId, url) {
        const tab = this.tabs.get(tabId);
        if (!tab) {
            return false;
        }
        tab.url = url;
        tab.lastAccessedAt = new Date();
        console.log(`🔗 Navigated to: ${url}`);
        return true;
    }
    setActiveTab(tabId) {
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
    getTabs() {
        return Array.from(this.tabs.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }
    getTab(tabId) {
        return this.tabs.get(tabId);
    }
    getActiveTab() {
        if (!this.activeTabId) {
            return null;
        }
        return this.tabs.get(this.activeTabId) || null;
    }
    updateTabTitle(tabId, title) {
        const tab = this.tabs.get(tabId);
        if (!tab) {
            return false;
        }
        tab.title = title;
        return true;
    }
    updateTabFavicon(tabId, favicon) {
        const tab = this.tabs.get(tabId);
        if (!tab) {
            return false;
        }
        tab.favicon = favicon;
        return true;
    }
    getTabCount() {
        return this.tabs.size;
    }
    clearAll() {
        this.tabs.clear();
        this.activeTabId = null;
        console.log('🗑️ All tabs cleared');
        this.saveSession();
    }
    saveSession() {
        if (!this.sessionFilePath)
            return;
        try {
            const data = {
                tabs: Array.from(this.tabs.values()),
                activeTabId: this.activeTabId
            };
            fs.writeFileSync(this.sessionFilePath, JSON.stringify(data, null, 2));
        }
        catch (err) {
            console.error('Failed to save browser session:', err);
        }
    }
    loadSession() {
        if (!this.sessionFilePath || !fs.existsSync(this.sessionFilePath))
            return false;
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
        }
        catch (err) {
            console.error('Failed to load browser session:', err);
        }
        return false;
    }
}
exports.BrowserManager = BrowserManager;
