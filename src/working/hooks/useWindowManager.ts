/*
 * WORKING VERSION
 * Original: (nowy hook)
 * Started: 2026-03-15
 * Status: IN_PROGRESS
 *
 * Changes:
 * - Created useWindowManager hook for window management
 */
import React from 'react';

export type WindowType = 'chat' | 'music' | 'download' | 'library' | 'mcp' | 'reader';

interface WindowConfig {
  type: WindowType;
  title: string;
  url?: string;
  embedded?: boolean;
}

export function useWindowManager() {
  const [windows, setWindows] = React.useState<WindowConfig[]>([]);

  const openWindow = (type: WindowType, config?: Partial<WindowConfig>) =>
    setWindows(prev => [...prev.filter(w => w.type !== type), { type, title: type, ...config }]);

  const closeWindow = (type: WindowType) =>
    setWindows(prev => prev.filter(w => w.type !== type));

  const postMessage = (type: WindowType, message: unknown) =>
    window.postMessage({ target: type, payload: message }, '*');

  return { windows, openWindow, closeWindow, postMessage };
}
