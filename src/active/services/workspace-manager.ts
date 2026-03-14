// src/active/services/workspace-manager.ts
import type { Tab, Bookmark } from '../components/Browser';

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
  tabs: Tab[];
  bookmarks: Bookmark[];
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

export class WorkspaceManager {
  workspaces: Map<string, Workspace> = new Map();
  activeWorkspaceId: string | null = null;

  constructor() {
    this.loadWorkspaces();
  }

  private async loadWorkspaces() {
    const keys = await storage.keys();
    const workspaceKeys = keys.filter(k => k.startsWith('workspace_'));

    for (const key of workspaceKeys) {
      const workspaceData = await storage.get(key);
      this.workspaces.set(workspaceData.id, workspaceData);
    }

    this.activeWorkspaceId = await storage.get('activeWorkspaceId');

    // If no workspaces, create default ones
    if (this.workspaces.size === 0) {
      this.createWorkTemplate();
      this.createPersonalTemplate();
      this.createResearchTemplate();
      this.activeWorkspaceId = Array.from(this.workspaces.keys())[0];
      this.persist();
    }
  }

  async persist() {
    for (const workspace of this.workspaces.values()) {
      await storage.set(workspace.id, workspace);
    }
    await storage.set('activeWorkspaceId', this.activeWorkspaceId);
  }

  createWorkspace(name: string, icon: string, color: string, initialTabs: Tab[] = [], initialBookmarks: Bookmark[] = []): Workspace {
    const workspace: Workspace = {
      id: `workspace_${crypto.randomUUID()}`,
      name,
      icon,
      color,
      tabs: initialTabs,
      bookmarks: initialBookmarks
    };

    this.workspaces.set(workspace.id, workspace);
    this.persist();
    return workspace;
  }

  async switchWorkspace(id: string, currentTabs: Tab[], currentBookmarks: Bookmark[]) {
    // Save current workspace state
    if (this.activeWorkspaceId) {
      const current = this.workspaces.get(this.activeWorkspaceId);
      if (current) {
        current.tabs = currentTabs.map(t => ({ ...t, isActive: false })); // Save all tabs as inactive
        current.bookmarks = currentBookmarks;
        await storage.set(current.id, current);
      }
    }

    // Load new workspace
    const newWorkspace = this.workspaces.get(id);
    if (!newWorkspace) throw new Error('Workspace not found');

    this.activeWorkspaceId = id;
    await this.persist();

    return { tabs: newWorkspace.tabs, bookmarks: newWorkspace.bookmarks };
  }

  getWorkspaces(): Workspace[] {
    return Array.from(this.workspaces.values());
  }

  getActiveWorkspace(): Workspace | undefined {
    return this.activeWorkspaceId ? this.workspaces.get(this.activeWorkspaceId) : undefined;
  }

  // Predefined workspace templates
  createWorkTemplate(): Workspace {
    return this.createWorkspace('Work', '💼', '#3b82f6', [
      { id: 'work-1', title: 'Jira', url: 'https://jira.com', isActive: false, isLoading: false, favicon: '💼' },
      { id: 'work-2', title: 'Confluence', url: 'https://confluence.com', isActive: false, isLoading: false, favicon: '📄' }
    ]);
  }

  createPersonalTemplate(): Workspace {
    return this.createWorkspace('Personal', '🏠', '#10b981', [
      { id: 'personal-1', title: 'Gmail', url: 'https://gmail.com', isActive: false, isLoading: false, favicon: '✉️' },
      { id: 'personal-2', title: 'YouTube', url: 'https://youtube.com', isActive: false, isLoading: false, favicon: '▶️' }
    ], [
      { id: 'bm-gmail', title: 'Gmail', url: 'https://gmail.com', favicon: '✉️' },
      { id: 'bm-calendar', title: 'Calendar', url: 'https://calendar.google.com', favicon: '📅' }
    ]);
  }

  createResearchTemplate(): Workspace {
    return this.createWorkspace('Research', '🔬', '#8b5cf6', [
      { id: 'research-1', title: 'Wikipedia', url: 'https://wikipedia.org', isActive: false, isLoading: false, favicon: '📚' },
      { id: 'research-2', title: 'Google Scholar', url: 'https://scholar.google.com', isActive: false, isLoading: false, favicon: '🎓' }
    ]);
  }
}
