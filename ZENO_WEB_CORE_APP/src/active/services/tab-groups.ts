// src/active/services/tab-groups.ts
import type { Tab } from '../components/Browser';

export interface TabGroup {
  id: string;
  name: string;
  color: string;
  tabIds: string[];
  collapsed: boolean;
}

// A simple color palette for groups
const GROUP_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f97316', // orange
  '#8b5cf6', // violet
];

export class TabGroupManager {
  groups: Map<string, TabGroup> = new Map();
  private colorIndex = 0;

  private getNextColor(): string {
    const color = GROUP_COLORS[this.colorIndex];
    this.colorIndex = (this.colorIndex + 1) % GROUP_COLORS.length;
    return color;
  }

  createGroup(name: string, tabIds: string[]): TabGroup {
    const group: TabGroup = {
      id: crypto.randomUUID(),
      name,
      color: this.getNextColor(),
      tabIds,
      collapsed: false,
    };
    this.groups.set(group.id, group);
    return group;
  }

  autoGroupTabsByDomain(tabs: Tab[]): TabGroup[] {
    const domains = this.groupByDomain(tabs);
    
    // Clear existing groups before creating new ones
    this.groups.clear();
    this.colorIndex = 0;

    const newGroups: TabGroup[] = [];
    for (const [domain, domainTabs] of domains.entries()) {
      // Only create groups for domains with more than one tab
      if (domainTabs.length > 1) {
        const group = this.createGroup(domain, domainTabs.map(t => t.id));
        newGroups.push(group);
      }
    }
    return newGroups;
  }

  private groupByDomain(tabs: Tab[]): Map<string, Tab[]> {
    const groups = new Map<string, Tab[]>();
    tabs.forEach(tab => {
      try {
        // Ignore special URLs
        if (tab.url.startsWith('about:')) return;

        const domain = new URL(tab.url).hostname.replace('www.', '');
        if (!groups.has(domain)) {
          groups.set(domain, []);
        }
        groups.get(domain)!.push(tab);
      } catch (error) {
        console.warn(`Invalid URL for tab grouping: ${tab.url}`);
      }
    });
    return groups;
  }

  removeGroup(groupId: string) {
    this.groups.delete(groupId);
  }

  addTabToGroup(groupId: string, tabId: string) {
    const group = this.groups.get(groupId);
    if (group && !group.tabIds.includes(tabId)) {
      group.tabIds.push(tabId);
    }
  }
}
