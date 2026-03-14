/**
 * Browser Manager - Tab and window management
 */
export interface BrowserTab {
    id: string;
    title: string;
    url: string;
    favicon?: string;
    isActive: boolean;
    createdAt: Date;
    lastAccessedAt: Date;
}
export declare class BrowserManager {
    private tabs;
    private activeTabId;
    private sessionFilePath;
    constructor(userDataPath?: string);
    createTab(url?: string, title?: string): BrowserTab;
    closeTab(tabId: string): boolean;
    navigate(tabId: string, url: string): boolean;
    setActiveTab(tabId: string): boolean;
    getTabs(): BrowserTab[];
    getTab(tabId: string): BrowserTab | undefined;
    getActiveTab(): BrowserTab | null;
    updateTabTitle(tabId: string, title: string): boolean;
    updateTabFavicon(tabId: string, favicon: string): boolean;
    getTabCount(): number;
    clearAll(): void;
    saveSession(): void;
    loadSession(): boolean;
}
