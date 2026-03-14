/**
 * Plugin Lifecycle Hooks & Event Types
 */

import type { PluginMeta } from './plugin-api';

// ─── Lifecycle Event Names ────────────────────────────────────────────────────

export type PluginLifecycleEvent =
  | 'plugin:install'
  | 'plugin:enable'
  | 'plugin:disable'
  | 'plugin:uninstall'
  | 'plugin:error'
  | 'plugin:update';

// ─── Lifecycle Payload ───────────────────────────────────────────────────────

export interface PluginLifecyclePayload {
  pluginId: string;
  timestamp: number;
  meta?: Partial<PluginMeta>;
  error?: string;
}

// ─── Lifecycle Hook Handler ──────────────────────────────────────────────────

export type PluginLifecycleHandler = (
  payload: PluginLifecyclePayload
) => void | Promise<void>;

// ─── Global Plugin Event Bus ─────────────────────────────────────────────────

class PluginEventBus {
  private handlers: Map<string, Set<PluginLifecycleHandler>> = new Map();

  on(event: PluginLifecycleEvent, handler: PluginLifecycleHandler): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  off(event: PluginLifecycleEvent, handler: PluginLifecycleHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit(event: PluginLifecycleEvent, payload: PluginLifecyclePayload): void {
    this.handlers.get(event)?.forEach((h) => {
      try {
        void Promise.resolve(h(payload));
      } catch (err) {
        console.error(`[PluginEventBus] Handler error on "${event}":`, err);
      }
    });
  }

  clear(): void {
    this.handlers.clear();
  }
}

export const pluginEventBus = new PluginEventBus();
