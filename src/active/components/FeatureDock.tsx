import React, { useState, useEffect, useRef } from 'react';
import type { WindowType } from '../hooks/useWindowManager';

interface DockItem {
  type: WindowType;
  icon: string;
  label: string;
  color: string;
}

const PRIMARY: DockItem[] = [
  { type: 'ai-chat',   icon: '🤖', label: 'AI Chat',  color: 'from-indigo-500 to-violet-600' },
  { type: 'local-ai',  icon: '🦙', label: 'Local AI', color: 'from-violet-500 to-purple-700' },
  { type: 'bookmarks', icon: '⭐', label: 'Zakładki', color: 'from-yellow-400 to-orange-500' },
  { type: 'tools',     icon: '🛠️', label: 'Narzędzia',color: 'from-amber-500 to-orange-600' },
  { type: 'music',     icon: '🎵', label: 'Muzyka',   color: 'from-fuchsia-400 to-pink-500' },
  { type: 'settings',  icon: '⚙️', label: 'Ustawienia',color: 'from-slate-500 to-slate-700' },
];

const MORE: DockItem[] = [
  { type: 'history',     icon: '📜', label: 'Historia',  color: 'from-blue-400 to-indigo-500' },
  { type: 'video',       icon: '🎬', label: 'Video',     color: 'from-amber-400 to-orange-500' },
  { type: 'wikipedia',   icon: '📚', label: 'Wikipedia', color: 'from-blue-500 to-cyan-600' },
  { type: 'on-this-day', icon: '📅', label: 'This Day',  color: 'from-blue-600 to-indigo-700' },
  { type: 'birthday',    icon: '🎂', label: 'Birthday',  color: 'from-pink-500 to-rose-600' },
  { type: 'mcp-console', icon: '🔧', label: 'MCP',       color: 'from-slate-600 to-slate-800' },
  { type: 'admin',       icon: '🔐', label: 'Admin',     color: 'from-red-600 to-red-800' },
  { type: 'clock',       icon: '⏰', label: 'Zegar',     color: 'from-cyan-400 to-blue-500' },
];

interface FeatureDockProps {
  theme: 'dark' | 'light';
  onOpen: (type: WindowType) => void;
  isOpen: (type: WindowType) => boolean;
  onAddBookmark: () => void;
}

export const FeatureDock: React.FC<FeatureDockProps> = ({
  theme,
  onOpen,
  isOpen,
  onAddBookmark,
}) => {
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "More" flyout when clicking outside
  useEffect(() => {
    if (!showMore) return;
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMore]);

  const darkBg = 'bg-slate-900/95 border-slate-700/80 text-slate-200 shadow-[0_-4px_24px_rgba(15,23,42,0.6)]';
  const lightBg = 'bg-white/95 border-slate-200 text-slate-700 shadow-[0_-4px_24px_rgba(0,0,0,0.1)]';
  const bg = theme === 'dark' ? darkBg : lightBg;

  const DockBtn = ({ type, icon, label, color }: DockItem) => {
    const active = isOpen(type);
    return (
      <button
        onClick={() => { onOpen(type); if (showMore) setShowMore(false); }}
        title={label}
        className={[
          'relative flex flex-col items-center justify-center gap-0.5',
          'w-[62px] py-2 rounded-xl border-none cursor-pointer transition-all duration-200 select-none',
          active
            ? `bg-gradient-to-br ${color} text-white shadow-lg scale-105`
            : theme === 'dark'
              ? 'bg-white/5 hover:bg-white/10 text-slate-300 hover:-translate-y-0.5'
              : 'bg-black/5 hover:bg-black/10 text-slate-600 hover:-translate-y-0.5',
        ].join(' ')}
      >
        <span className="text-[18px] leading-tight">{icon}</span>
        <span className="text-[9px] font-medium leading-tight whitespace-nowrap overflow-hidden max-w-full px-1 text-ellipsis">{label}</span>
        {active && (
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/80" />
        )}
      </button>
    );
  };

  const divider = (
    <div className={`w-px h-8 mx-0.5 flex-shrink-0 ${theme === 'dark' ? 'bg-slate-700/80' : 'bg-slate-300'}`} />
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1000]">
      {/* "More" flyout */}
      {showMore && (
        <div
          ref={moreRef}
          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-1.5 px-3 py-2.5 rounded-2xl border backdrop-blur-xl ${bg}`}
          onClick={e => e.stopPropagation()}
        >
          {MORE.map(item => (
            <DockBtn key={item.type} {...item} />
          ))}
        </div>
      )}

      {/* Main dock bar */}
      <div className={`flex items-center justify-center gap-1.5 px-5 py-2 border-t backdrop-blur-xl ${bg}`}>
        {PRIMARY.map(item => (
          <DockBtn key={item.type} {...item} />
        ))}

        {divider}

        {/* Add Bookmark */}
        <button
          onClick={onAddBookmark}
          title="Dodaj zakładkę"
          className={[
            'flex flex-col items-center justify-center gap-0.5',
            'w-[62px] py-2 rounded-xl border-none cursor-pointer transition-all duration-200 select-none hover:-translate-y-0.5',
            theme === 'dark'
              ? 'bg-white/5 hover:bg-white/10 text-slate-300'
              : 'bg-black/5 hover:bg-black/10 text-slate-600',
          ].join(' ')}
        >
          <span className="text-[18px] leading-tight">➕</span>
          <span className="text-[9px] font-medium">Dodaj</span>
        </button>

        {/* More */}
        <button
          onClick={() => setShowMore(v => !v)}
          title="Więcej narzędzi"
          className={[
            'flex flex-col items-center justify-center gap-0.5',
            'w-[62px] py-2 rounded-xl border-none cursor-pointer transition-all duration-200 select-none hover:-translate-y-0.5',
            showMore
              ? 'bg-gradient-to-br from-slate-500 to-slate-700 text-white scale-105 shadow-lg'
              : theme === 'dark'
                ? 'bg-white/5 hover:bg-white/10 text-slate-300'
                : 'bg-black/5 hover:bg-black/10 text-slate-600',
          ].join(' ')}
        >
          <span className="text-[18px] leading-tight">{showMore ? '✕' : '⋯'}</span>
          <span className="text-[9px] font-medium">{showMore ? 'Zamknij' : 'Więcej'}</span>
        </button>
      </div>
    </div>
  );
};
