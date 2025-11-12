// src/active/services/session-manager.ts
import type { Tab } from '../components/Browser';

export interface Session {
  id: string;
  name: string;
  tabs: Tab[];
  created: Date;
  lastAccessed: Date;
}

// Simple storage wrapper for localStorage
const storage = {
  async set(key: string, value: any): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  },
  async get(key: string): Promise<any> {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  },
  async keys(): Promise<string[]> {
    return Object.keys(localStorage);
  }
};

export class SessionManager {
  async saveSession(name: string, tabs: Tab[]): Promise<Session> {
    const session: Session = {
      id: `session_${crypto.randomUUID()}`,
      name,
      tabs: tabs.map(t => ({ ...t, isActive: false })), // Ensure no tab is active on save
      created: new Date(),
      lastAccessed: new Date()
    };

    await storage.set(session.id, session);
    return session;
  }

  async restoreSession(id: string): Promise<Tab[]> {
    const session = await storage.get(id);
    if (!session) {
      throw new Error('Session not found');
    }

    session.lastAccessed = new Date();
    await storage.set(id, session);

    // Set the first tab to be active
    if (session.tabs.length > 0) {
      session.tabs[0].isActive = true;
    }

    return session.tabs;
  }

  async getSessions(): Promise<Session[]> {
    const keys = await storage.keys();
    const sessionKeys = keys.filter(k => k.startsWith('session_'));

    const sessions: Session[] = [];
    for (const key of sessionKeys) {
      const sessionData = await storage.get(key);
      // Re-hydrate dates
      sessionData.created = new Date(sessionData.created);
      sessionData.lastAccessed = new Date(sessionData.lastAccessed);
      sessions.push(sessionData);
    }

    // Sort by most recently accessed
    return sessions.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
  }

  async deleteSession(id: string): Promise<void> {
    await storage.remove(id);
  }
}
