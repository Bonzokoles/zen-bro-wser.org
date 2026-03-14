/**
 * Plugin API Specification
 * Defines the standard interface for all ZENO Browser plugins.
 */

// ─── Permission System ───────────────────────────────────────────────────────

export type PluginPermission =
  | 'network'
  | 'storage'
  | 'tabs'
  | 'bookmarks'
  | 'history'
  | 'notifications'
  | 'clipboard'
  | 'downloads'
  | 'settings';

// ─── Plugin Status & Framework ───────────────────────────────────────────────

export type PluginStatus =
  | 'installed'
  | 'enabled'
  | 'disabled'
  | 'error'
  | 'updating';

export type PluginFramework = 'react' | 'vue' | 'svelte' | 'vanilla';

// ─── Plugin Manifest ─────────────────────────────────────────────────────────

export interface PluginManifest {
  /** Unique identifier, e.g. "com.example.my-plugin" */
  id: string;
  /** Human-readable name */
  name: string;
  /** SemVer string, e.g. "1.2.3" */
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license: string;
  /** Permissions required by the plugin */
  permissions: PluginPermission[];
  /** Peer plugin dependencies: pluginId → version range */
  dependencies?: Record<string, string>;
  framework?: PluginFramework;
  /** Module entry point relative to the plugin root */
  entryPoint: string;
  /** URL or data-URI for the plugin icon */
  icon?: string;
  categories?: string[];
  /** Minimum ZENO Browser version required */
  minBrowserVersion?: string;
}

// ─── Installed Plugin Metadata ───────────────────────────────────────────────

export interface PluginMeta extends PluginManifest {
  status: PluginStatus;
  installedAt: number;
  updatedAt: number;
  installPath: string;
  enabled: boolean;
}

// ─── Storage API ─────────────────────────────────────────────────────────────

export interface PluginStorageAPI {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

// ─── Event Emitter API ───────────────────────────────────────────────────────

export type PluginEventHandler = (...args: unknown[]) => void;

export interface PluginEventsAPI {
  on(event: string, handler: PluginEventHandler): void;
  off(event: string, handler: PluginEventHandler): void;
  emit(event: string, ...args: unknown[]): void;
}

// ─── Browser Tab API ─────────────────────────────────────────────────────────

export interface BrowserTabInfo {
  id: string;
  url: string;
  title: string;
}

export interface PluginBrowserAPI {
  openTab(url: string): Promise<string>;
  closeTab(tabId: string): Promise<void>;
  getActiveTab(): Promise<BrowserTabInfo | null>;
}

// ─── Notification API ────────────────────────────────────────────────────────

export interface PluginNotificationsAPI {
  show(title: string, body: string): void;
}

// ─── Aggregate Plugin API ────────────────────────────────────────────────────

export interface PluginAPI {
  storage: PluginStorageAPI;
  events: PluginEventsAPI;
  browser?: PluginBrowserAPI;
  notifications?: PluginNotificationsAPI;
}

// ─── Plugin Interface ────────────────────────────────────────────────────────

export interface Plugin {
  manifest: PluginManifest;
  api: PluginAPI;

  // Lifecycle hooks
  install?(): Promise<void>;
  enable?(): Promise<void>;
  disable?(): Promise<void>;
  uninstall?(): Promise<void>;

  // Optional settings UI (React node)
  renderSettings?(): unknown;
}

// ─── Plugin Factory ──────────────────────────────────────────────────────────

/** Each plugin module must export a default factory function */
export type PluginFactory = (api: PluginAPI) => Plugin;
