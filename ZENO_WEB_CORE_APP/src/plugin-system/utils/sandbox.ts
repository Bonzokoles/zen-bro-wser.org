/**
 * Plugin Sandbox
 * Provides a restricted PluginAPI context scoped to a single plugin,
 * enforcing declared permissions at runtime.
 */

import type {
  PluginAPI,
  PluginPermission,
  PluginStorageAPI,
  PluginEventsAPI,
  PluginBrowserAPI,
  PluginNotificationsAPI,
  PluginEventHandler,
} from '../api/plugin-api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function requirePermission(
  permission: PluginPermission,
  granted: Set<PluginPermission>,
  action: string
): void {
  if (!granted.has(permission)) {
    throw new Error(
      `Plugin permission denied: "${permission}" is required for "${action}".`
    );
  }
}

// ─── Sandboxed Storage ───────────────────────────────────────────────────────

function buildStorageAPI(
  pluginId: string,
  permissions: Set<PluginPermission>
): PluginStorageAPI {
  const prefix = `zeno:plugin:${pluginId}:`;

  const key = (k: string): string => `${prefix}${k}`;

  return {
    async get(k: string): Promise<unknown> {
      requirePermission('storage', permissions, 'storage.get');
      try {
        const raw = localStorage.getItem(key(k));
        if (raw === null) return undefined;
        return JSON.parse(raw) as unknown;
      } catch {
        // Corrupt or malformed storage entry – silently return undefined
        // and remove the bad value to prevent repeated errors.
        localStorage.removeItem(key(k));
        return undefined;
      }
    },
    async set(k: string, value: unknown): Promise<void> {
      requirePermission('storage', permissions, 'storage.set');
      localStorage.setItem(key(k), JSON.stringify(value));
    },
    async remove(k: string): Promise<void> {
      requirePermission('storage', permissions, 'storage.remove');
      localStorage.removeItem(key(k));
    },
    async clear(): Promise<void> {
      requirePermission('storage', permissions, 'storage.clear');
      Object.keys(localStorage)
        .filter((k) => k.startsWith(prefix))
        .forEach((k) => localStorage.removeItem(k));
    },
  };
}

// ─── Sandboxed Events ────────────────────────────────────────────────────────

function buildEventsAPI(): PluginEventsAPI {
  const listeners: Map<string, Set<PluginEventHandler>> = new Map();

  return {
    on(event: string, handler: PluginEventHandler): void {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(handler);
    },
    off(event: string, handler: PluginEventHandler): void {
      listeners.get(event)?.delete(handler);
    },
    emit(event: string, ...args: unknown[]): void {
      listeners.get(event)?.forEach((h) => {
        try {
          h(...args);
        } catch (err) {
          console.error(`[PluginSandbox] Event handler error on "${event}":`, err);
        }
      });
    },
  };
}

// ─── Sandboxed Browser API ───────────────────────────────────────────────────

function buildBrowserAPI(
  permissions: Set<PluginPermission>
): PluginBrowserAPI {
  return {
    async openTab(url: string): Promise<string> {
      requirePermission('tabs', permissions, 'browser.openTab');
      const event = new CustomEvent('zeno:plugin:openTab', { detail: { url } });
      window.dispatchEvent(event);
      return `tab-${Date.now()}`;
    },
    async closeTab(tabId: string): Promise<void> {
      requirePermission('tabs', permissions, 'browser.closeTab');
      window.dispatchEvent(
        new CustomEvent('zeno:plugin:closeTab', { detail: { tabId } })
      );
    },
    async getActiveTab() {
      requirePermission('tabs', permissions, 'browser.getActiveTab');
      return null;
    },
  };
}

// ─── Sandboxed Notifications API ─────────────────────────────────────────────

function buildNotificationsAPI(
  permissions: Set<PluginPermission>
): PluginNotificationsAPI {
  return {
    show(title: string, body: string): void {
      requirePermission('notifications', permissions, 'notifications.show');
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body });
      } else {
        console.info(`[Plugin Notification] ${title}: ${body}`);
      }
    },
  };
}

// ─── Public Factory ──────────────────────────────────────────────────────────

/**
 * Creates a fully sandboxed PluginAPI instance for the given plugin.
 * Only APIs backed by declared permissions are functional.
 */
export function createSandboxedAPI(
  pluginId: string,
  permissions: PluginPermission[]
): PluginAPI {
  const granted = new Set<PluginPermission>(permissions);

  const api: PluginAPI = {
    storage: buildStorageAPI(pluginId, granted),
    events: buildEventsAPI(),
  };

  if (granted.has('tabs')) {
    api.browser = buildBrowserAPI(granted);
  }

  if (granted.has('notifications')) {
    api.notifications = buildNotificationsAPI(granted);
  }

  return api;
}
