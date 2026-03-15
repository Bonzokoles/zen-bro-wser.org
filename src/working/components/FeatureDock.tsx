/*
 * WORKING VERSION
 * Original: (nowy komponent)
 * Started: 2026-03-15
 * Status: IN_PROGRESS
 *
 * Changes:
 * - Created FeatureDock component for ZENO Browser
 */
import React from 'react';
import type { WindowType } from '../hooks/useWindowManager';

interface FeatureDockProps {
  onOpenWindow: (type: WindowType) => void;
}

const features: { type: WindowType; icon: string; label: string }[] = [
  { type: 'chat', icon: '💬', label: 'Chat' },
  { type: 'music', icon: '🎵', label: 'Music' },
  { type: 'download', icon: '⬇️', label: 'Downloads' },
  { type: 'library', icon: '📚', label: 'Library' },
  { type: 'mcp', icon: '🔧', label: 'MCP Console' },
  { type: 'reader', icon: '📖', label: 'Reader' },
  { type: 'omni', icon: '🔍', label: 'OmniSearch' },
];

export const FeatureDock: React.FC<FeatureDockProps> = ({ onOpenWindow }) => (
  <nav className="fixed bottom-0 left-0 w-full bg-slate-900 flex justify-center gap-2 py-2 z-[1100] border-t border-slate-700/30">
    {features.map(({ type, icon, label }) => (
      <button
        key={type}
        onClick={() => onOpenWindow(type as WindowType)}
        className="flex flex-col items-center justify-center px-3 py-1 rounded-[2px] bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium shadow-sm transition-all"
        style={{ borderRadius: 2 }}
        aria-label={label}
      >
        <span className="text-xl mb-1">{icon}</span>
        <span>{label}</span>
      </button>
    ))}
  </nav>
);
