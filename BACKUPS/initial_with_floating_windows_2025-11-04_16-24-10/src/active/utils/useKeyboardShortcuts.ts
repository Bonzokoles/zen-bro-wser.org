// src/active/utils/useKeyboardShortcuts.ts
import { useEffect } from 'react';

// Placeholder functions for actions
// In a real app, these would be connected to state management (e.g., Zustand, Redux)
const createNewTab = () => console.log('Action: Create New Tab');
const closeCurrentTab = () => console.log('Action: Close Current Tab');
const switchToNextTab = () => console.log('Action: Switch to Next Tab');
const switchToPreviousTab = () => console.log('Action: Switch to Previous Tab');
const focusAddressBar = () => {
    const addressBar = document.getElementById('address-bar-input'); // Assuming an ID
    if (addressBar) {
        addressBar.focus();
    }
    console.log('Action: Focus Address Bar');
};
const openOmniSearch = () => console.log('Action: Open Omni Search');
const bookmarkCurrentPage = () => console.log('Action: Bookmark Current Page');
const clearHistory = () => console.log('Action: Clear History');
const toggleDevTools = () => console.log('Action: Toggle Dev Tools');


export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.includes('Mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + T: New tab
      if (mod && e.key === 't') {
        e.preventDefault();
        createNewTab();
      }

      // Cmd/Ctrl + W: Close tab
      if (mod && e.key === 'w') {
        e.preventDefault();
        closeCurrentTab();
      }

      // Cmd/Ctrl + Tab: Next tab
      if (mod && !e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        switchToNextTab();
      }

      // Cmd/Ctrl + Shift + Tab: Previous tab
      if (mod && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        switchToPreviousTab();
      }

      // Cmd/Ctrl + L: Focus address bar
      if (mod && e.key === 'l') {
        e.preventDefault();
        focusAddressBar();
      }

      // Cmd/Ctrl + K: Open search
      if (mod && e.key === 'k') {
        e.preventDefault();
        openOmniSearch();
      }

      // Cmd/Ctrl + D: Bookmark
      if (mod && e.key === 'd') {
        e.preventDefault();
        bookmarkCurrentPage();
      }

      // Cmd/Ctrl + Shift + Delete: Clear history
      if (mod && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
        clearHistory();
      }

      // F12: Dev tools
      if (e.key === 'F12') {
        e.preventDefault();
        toggleDevTools();
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}
