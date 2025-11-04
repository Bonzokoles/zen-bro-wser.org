import React from 'react';
import type { Mode } from '../types';
import { ChatIcon, ImageIcon, MicIcon, SettingsIcon, SunIcon, MoonIcon } from './icons/Icons';

interface SidebarProps {
  activeMode: Mode;
  setMode: (mode: Mode) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeMode, setMode, theme, setTheme }) => {
  const navItems = [
    { id: 'chat', label: 'Chat', icon: <ChatIcon /> },
    { id: 'image-analyzer', label: 'Image Analyzer', icon: <ImageIcon /> },
    { id: 'transcriber', label: 'Transcriber', icon: <MicIcon /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon /> },
  ] as const;

  return (
    <nav className="w-full bg-white dark:bg-gray-950 p-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">
            Gemini Suite
            </h1>
        </div>
        <ul className="flex items-center space-x-1">
            {navItems.map((item) => (
            <li key={item.id}>
                <button
                onClick={() => setMode(item.id)}
                className={`flex items-center px-4 py-2 text-sm text-left transition-colors duration-200 ${
                    activeMode === item.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
                >
                <span className="mr-2">{item.icon}</span>
                {item.label}
                </button>
            </li>
            ))}
        </ul>
      </div>
      
      <button
        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        className="flex items-center justify-center p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <MoonIcon /> : <SunIcon />}
      </button>
    </nav>
  );
};