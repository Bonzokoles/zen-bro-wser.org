"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabCommunicationManager = void 0;
const events_1 = require("events");
class TabCommunicationManager extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this.tabs = new Map();
        this.messageQueue = [];
    }
    registerTab(tabId) {
        const context = {
            tabId,
            sessionData: new Map(),
            cookies: new Map(),
        };
        this.tabs.set(tabId, context);
        this.emit('tab-registered', { tabId });
        return context;
    }
    unregisterTab(tabId) {
        this.tabs.delete(tabId);
        this.emit('tab-unregistered', { tabId });
    }
    sendMessage(fromTabId, toTabId, type, payload) {
        const message = {
            id: `msg-${Date.now()}-${Math.random()}`,
            fromTabId,
            toTabId,
            type,
            payload,
            timestamp: new Date(),
        };
        this.messageQueue.push(message);
        if (toTabId) {
            this.emit(`message:${toTabId}`, message);
        }
        else {
            this.tabs.forEach((_, tabId) => {
                if (tabId !== fromTabId) {
                    this.emit(`message:${tabId}`, message);
                }
            });
        }
        return message.id;
    }
    shareSession(fromTabId, toTabId, data) {
        const fromContext = this.tabs.get(fromTabId);
        const toContext = this.tabs.get(toTabId);
        if (fromContext && toContext) {
            Object.entries(data).forEach(([key, value]) => {
                toContext.sessionData.set(key, value);
            });
            this.emit('session-shared', { fromTabId, toTabId, keys: Object.keys(data) });
        }
    }
    shareCookies(fromTabId, toTabId) {
        const fromContext = this.tabs.get(fromTabId);
        const toContext = this.tabs.get(toTabId);
        if (fromContext && toContext) {
            fromContext.cookies.forEach((value, key) => {
                toContext.cookies.set(key, value);
            });
            this.emit('cookies-shared', { fromTabId, toTabId });
        }
    }
    shareAuthToken(fromTabId, toTabId) {
        const fromContext = this.tabs.get(fromTabId);
        if (fromContext?.authToken) {
            if (toTabId) {
                const toContext = this.tabs.get(toTabId);
                if (toContext) {
                    toContext.authToken = fromContext.authToken;
                }
            }
            else {
                this.tabs.forEach((context, tabId) => {
                    if (tabId !== fromTabId) {
                        context.authToken = fromContext.authToken;
                    }
                });
            }
            this.emit('auth-shared', { fromTabId, toTabId });
        }
    }
    getTabContext(tabId) {
        return this.tabs.get(tabId);
    }
    getAllTabs() {
        return Array.from(this.tabs.values());
    }
    getMessageHistory(fromTabId, toTabId) {
        return this.messageQueue.filter(msg => {
            if (fromTabId && msg.fromTabId !== fromTabId)
                return false;
            if (toTabId && msg.toTabId !== toTabId)
                return false;
            return true;
        });
    }
}
exports.TabCommunicationManager = TabCommunicationManager;
