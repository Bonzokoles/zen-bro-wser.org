import { EventEmitter } from 'events';
export interface TabMessage {
    id: string;
    fromTabId: string;
    toTabId?: string;
    type: string;
    payload: any;
    timestamp: Date;
}
export interface TabContext {
    tabId: string;
    sessionData: Map<string, any>;
    cookies: Map<string, string>;
    authToken?: string;
    sharedClipboard?: string;
}
export declare class TabCommunicationManager extends EventEmitter {
    private tabs;
    private messageQueue;
    registerTab(tabId: string): TabContext;
    unregisterTab(tabId: string): void;
    sendMessage(fromTabId: string, toTabId: string | undefined, type: string, payload: any): string;
    shareSession(fromTabId: string, toTabId: string, data: Record<string, any>): void;
    shareCookies(fromTabId: string, toTabId: string): void;
    shareAuthToken(fromTabId: string, toTabId: string | undefined): void;
    getTabContext(tabId: string): TabContext | undefined;
    getAllTabs(): TabContext[];
    getMessageHistory(fromTabId?: string, toTabId?: string): TabMessage[];
}
