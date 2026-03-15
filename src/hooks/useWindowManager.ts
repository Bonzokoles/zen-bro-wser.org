import { useState, useCallback } from 'react';

export type WindowType =
  | 'ai-chat'
  | 'local-ai'
  | 'bookmarks'
  | 'history'
  | 'tools'
  | 'music'
  | 'video'
  | 'admin'
  | 'settings'
  | 'wikipedia'
  | 'on-this-day'
  | 'birthday'
  | 'mcp-console'
  | 'clock'
  | 'shortcuts'
  | 'music-widget'
  | 'iframe';

export interface ManagedWindow {
  id: string;
  type: WindowType;
  title: string;
  icon: string;
  url?: string;
  zIndex: number;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
}

export interface WindowMessage {
  from: string;
  to: string;
  type: string;
  data: unknown;
  timestamp: number;
}

const CONFIGS: Record<WindowType, { title: string; icon: string; w: number; h: number }> = {
  'ai-chat':      { title: 'AI Chat',           icon: '🤖', w: 440,  h: 580 },
  'local-ai':     { title: 'Local AI · Ollama', icon: '🦙', w: 580,  h: 640 },
  'bookmarks':    { title: 'Bookmarks',          icon: '⭐', w: 500,  h: 540 },
  'history':      { title: 'Historia',           icon: '📜', w: 500,  h: 540 },
  'tools':        { title: 'Tools',              icon: '🛠️', w: 620,  h: 500 },
  'music':        { title: 'Music Player',       icon: '🎵', w: 420,  h: 530 },
  'video':        { title: 'Video Player',       icon: '🎬', w: 700,  h: 490 },
  'admin':        { title: 'Admin Panel',        icon: '🔐', w: 680,  h: 580 },
  'settings':     { title: 'Ustawienia',         icon: '⚙️', w: 600,  h: 550 },
  'wikipedia':    { title: 'Wikipedia',          icon: '📚', w: 500,  h: 580 },
  'on-this-day':  { title: 'On This Day',        icon: '📅', w: 460,  h: 500 },
  'birthday':     { title: 'Birthday Song',      icon: '🎂', w: 420,  h: 460 },
  'mcp-console':  { title: 'MCP Console',        icon: '🔧', w: 700,  h: 440 },
  'clock':        { title: 'Zegar',              icon: '⏰', w: 340,  h: 280 },
  'shortcuts':    { title: 'Skróty',             icon: '⌨️', w: 420,  h: 460 },
  'music-widget': { title: 'Music Widget',       icon: '🎼', w: 360,  h: 240 },
  'iframe':       { title: 'Browser Window',     icon: '🌐', w: 920,  h: 690 },
};

let globalZ = 1010;
let winCount = 0;

export function useWindowManager() {
  const [windows, setWindows] = useState<ManagedWindow[]>([]);

  const openWindow = useCallback(
    (type: WindowType, opts?: { url?: string; title?: string }): string => {
      // For non-iframe types, bring existing window to front instead of opening duplicate
      if (type !== 'iframe') {
        let existingId: string | undefined;
        setWindows(prev => {
          const existing = prev.find(w => w.type === type);
          if (existing) {
            existingId = existing.id;
            return prev.map(w =>
              w.id === existing.id ? { ...w, zIndex: ++globalZ } : w
            );
          }
          return prev;
        });
        if (existingId) return existingId;
      }

      const cfg = CONFIGS[type];
      const offset = (winCount % 10) * 28;
      winCount++;
      const id = `${type}-${Date.now()}`;

      setWindows(prev => [
        ...prev,
        {
          id,
          type,
          title: opts?.title ?? cfg.title,
          icon: cfg.icon,
          url: opts?.url,
          zIndex: ++globalZ,
          initialX: 120 + offset,
          initialY: 100 + offset,
          initialWidth: cfg.w,
          initialHeight: cfg.h,
        },
      ]);

      return id;
    },
    []
  );

  const closeWindow = useCallback((id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  }, []);

  const isOpen = useCallback(
    (type: WindowType) => windows.some(w => w.type === type),
    [windows]
  );

  /** Dispatch a custom event for cross-window communication via postMessage bus */
  const sendMessage = useCallback(
    (from: string, to: string, type: string, data: unknown) => {
      const detail: WindowMessage = { from, to, type, data, timestamp: Date.now() };
      window.dispatchEvent(new CustomEvent('zeno-window-message', { detail }));
    },
    []
  );

  return { windows, openWindow, closeWindow, isOpen, sendMessage };
}
