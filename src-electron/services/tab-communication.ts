import { EventEmitter } from 'events';

export interface TabMessage {
  id: string;
  fromTabId: string;
  toTabId?: string; // undefined = broadcast
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

export class TabCommunicationManager extends EventEmitter {
  private tabs: Map<string, TabContext> = new Map();
  private messageQueue: TabMessage[] = [];

  registerTab(tabId: string): TabContext {
    const context: TabContext = {
      tabId,
      sessionData: new Map(),
      cookies: new Map(),
    };
    this.tabs.set(tabId, context);
    this.emit('tab-registered', { tabId });
    return context;
  }

  unregisterTab(tabId: string) {
    this.tabs.delete(tabId);
    this.emit('tab-unregistered', { tabId });
  }

  sendMessage(
    fromTabId: string,
    toTabId: string | undefined,
    type: string,
    payload: any
  ): string {
    const message: TabMessage = {
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
    } else {
      this.tabs.forEach((_, tabId) => {
        if (tabId !== fromTabId) {
          this.emit(`message:${tabId}`, message);
        }
      });
    }

    return message.id;
  }

  shareSession(fromTabId: string, toTabId: string, data: Record<string, any>) {
    const fromContext = this.tabs.get(fromTabId);
    const toContext = this.tabs.get(toTabId);

    if (fromContext && toContext) {
      Object.entries(data).forEach(([key, value]) => {
        toContext.sessionData.set(key, value);
      });
      this.emit('session-shared', { fromTabId, toTabId, keys: Object.keys(data) });
    }
  }

  shareCookies(fromTabId: string, toTabId: string) {
    const fromContext = this.tabs.get(fromTabId);
    const toContext = this.tabs.get(toTabId);

    if (fromContext && toContext) {
      fromContext.cookies.forEach((value, key) => {
        toContext.cookies.set(key, value);
      });
      this.emit('cookies-shared', { fromTabId, toTabId });
    }
  }

  shareAuthToken(fromTabId: string, toTabId: string | undefined) {
    const fromContext = this.tabs.get(fromTabId);

    if (fromContext?.authToken) {
      if (toTabId) {
        const toContext = this.tabs.get(toTabId);
        if (toContext) {
          toContext.authToken = fromContext.authToken;
        }
      } else {
        this.tabs.forEach((context, tabId) => {
          if (tabId !== fromTabId) {
            context.authToken = fromContext.authToken;
          }
        });
      }
      this.emit('auth-shared', { fromTabId, toTabId });
    }
  }

  getTabContext(tabId: string): TabContext | undefined {
    return this.tabs.get(tabId);
  }

  getAllTabs(): TabContext[] {
    return Array.from(this.tabs.values());
  }

  getMessageHistory(fromTabId?: string, toTabId?: string): TabMessage[] {
    return this.messageQueue.filter(msg => {
      if (fromTabId && msg.fromTabId !== fromTabId) return false;
      if (toTabId && msg.toTabId !== toTabId) return false;
      return true;
    });
  }
}
