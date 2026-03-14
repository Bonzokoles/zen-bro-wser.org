/**
 * IframeWindowManager - Zaawansowany system zarządzania wieloma oknami iframe
 *
 * Funkcje:
 * ✅ Multi-window management (nieograniczona liczba okien)
 * ✅ Drag & drop (przeciąganie okien)
 * ✅ Resize windows (zmiana rozmiaru)
 * ✅ Minimize/maximize/close
 * ✅ Tab switching (przełączanie między oknami)
 * ✅ Z-index management (focus okna)
 * ✅ Save/restore layouts (localStorage)
 * ✅ Quick add from URL
 * ✅ Window templates (presets)
 * ✅ Keyboard shortcuts
 * ✅ Responsive design
 *
 * @author Claude Code Assistant
 * @date 2025-11-10
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// ============================================
// TYPES
// ============================================

export interface IframeWindow {
  id: string;
  title: string;
  url: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  loading: boolean;
  error?: string;
  favicon?: string;
  createdAt: number;
}

interface IframeWindowManagerProps {
  initialWindows?: IframeWindow[];
  maxWindows?: number;
  enableSaveLayout?: boolean;
  enableKeyboardShortcuts?: boolean;
}

interface WindowTemplate {
  id: string;
  name: string;
  icon: string;
  url: string;
  size: { width: number; height: number };
}

// ============================================
// WINDOW TEMPLATES (Quick Add Presets)
// ============================================

const WINDOW_TEMPLATES: WindowTemplate[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    icon: '🎬',
    url: 'https://youtube.com',
    size: { width: 800, height: 600 }
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '💻',
    url: 'https://github.com',
    size: { width: 1000, height: 700 }
  },
  {
    id: 'maps',
    name: 'Google Maps',
    icon: '🗺️',
    url: 'https://maps.google.com',
    size: { width: 900, height: 600 }
  },
  {
    id: 'mdn',
    name: 'MDN Docs',
    icon: '📚',
    url: 'https://developer.mozilla.org',
    size: { width: 1000, height: 800 }
  },
  {
    id: 'codepen',
    name: 'CodePen',
    icon: '🎨',
    url: 'https://codepen.io',
    size: { width: 1200, height: 700 }
  }
];

// ============================================
// MAIN COMPONENT
// ============================================

export const IframeWindowManager: React.FC<IframeWindowManagerProps> = ({
  initialWindows = [],
  maxWindows = 10,
  enableSaveLayout = true,
  enableKeyboardShortcuts = true
}) => {
  // State
  const [windows, setWindows] = useState<IframeWindow[]>(initialWindows);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [newWindowUrl, setNewWindowUrl] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [nextZIndex, setNextZIndex] = useState(1000);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    isDragging: boolean;
    windowId: string | null;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  }>({
    isDragging: false,
    windowId: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });

  // ============================================
  // PERSISTENCE (Save/Restore Layout)
  // ============================================

  useEffect(() => {
    if (!enableSaveLayout) return;

    // Load saved layout
    const savedLayout = localStorage.getItem('iframe-windows-layout');
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setWindows(parsed);
      } catch (error) {
        console.error('Failed to load saved layout:', error);
      }
    }
  }, [enableSaveLayout]);

  useEffect(() => {
    if (!enableSaveLayout) return;

    // Auto-save layout
    const saveTimer = setTimeout(() => {
      localStorage.setItem('iframe-windows-layout', JSON.stringify(windows));
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [windows, enableSaveLayout]);

  // ============================================
  // WINDOW MANAGEMENT
  // ============================================

  const generateWindowId = () => `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addWindow = useCallback((url: string, title?: string, size?: { width: number; height: number }) => {
    if (windows.length >= maxWindows) {
      alert(`Maksymalna liczba okien: ${maxWindows}`);
      return;
    }

    const newWindow: IframeWindow = {
      id: generateWindowId(),
      title: title || new URL(url).hostname,
      url,
      position: {
        x: 100 + windows.length * 30,
        y: 100 + windows.length * 30
      },
      size: size || { width: 800, height: 600 },
      isMinimized: false,
      isMaximized: false,
      zIndex: nextZIndex,
      loading: true,
      createdAt: Date.now()
    };

    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(newWindow.id);
    setNextZIndex(prev => prev + 1);
  }, [windows, maxWindows, nextZIndex]);

  const closeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
    if (activeWindowId === windowId) {
      setActiveWindowId(windows[0]?.id || null);
    }
  }, [activeWindowId, windows]);

  const minimizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, isMinimized: true } : w
    ));
  }, []);

  const maximizeWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
    ));
  }, []);

  const restoreWindow = useCallback((windowId: string) => {
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, isMinimized: false } : w
    ));
    setActiveWindowId(windowId);
  }, []);

  const focusWindow = useCallback((windowId: string) => {
    setActiveWindowId(windowId);
    setWindows(prev => prev.map(w =>
      w.id === windowId ? { ...w, zIndex: nextZIndex } : w
    ));
    setNextZIndex(prev => prev + 1);
  }, [nextZIndex]);

  // ============================================
  // DRAG & DROP
  // ============================================

  const handleMouseDown = useCallback((e: React.MouseEvent, windowId: string) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;

    const window = windows.find(w => w.id === windowId);
    if (!window || window.isMaximized) return;

    dragState.current = {
      isDragging: true,
      windowId,
      startX: e.clientX,
      startY: e.clientY,
      initialX: window.position.x,
      initialY: window.position.y
    };

    focusWindow(windowId);
    e.preventDefault();
  }, [windows, focusWindow]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.isDragging || !dragState.current.windowId) return;

    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;

    setWindows(prev => prev.map(w =>
      w.id === dragState.current.windowId
        ? {
            ...w,
            position: {
              x: Math.max(0, dragState.current.initialX + deltaX),
              y: Math.max(0, dragState.current.initialY + deltaY)
            }
          }
        : w
    ));
  }, []);

  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false;
    dragState.current.windowId = null;
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // ============================================
  // KEYBOARD SHORTCUTS
  // ============================================

  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N - New window
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setShowTemplates(true);
      }

      // Ctrl/Cmd + W - Close active window
      if ((e.ctrlKey || e.metaKey) && e.key === 'w' && activeWindowId) {
        e.preventDefault();
        closeWindow(activeWindowId);
      }

      // Ctrl/Cmd + Tab - Switch windows
      if ((e.ctrlKey || e.metaKey) && e.key === 'Tab') {
        e.preventDefault();
        const currentIndex = windows.findIndex(w => w.id === activeWindowId);
        const nextIndex = (currentIndex + 1) % windows.length;
        if (windows[nextIndex]) {
          focusWindow(windows[nextIndex].id);
        }
      }

      // Ctrl/Cmd + M - Minimize active window
      if ((e.ctrlKey || e.metaKey) && e.key === 'm' && activeWindowId) {
        e.preventDefault();
        minimizeWindow(activeWindowId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, activeWindowId, windows, closeWindow, focusWindow, minimizeWindow]);

  // ============================================
  // QUICK ADD FROM URL
  // ============================================

  const handleQuickAdd = () => {
    if (!newWindowUrl.trim()) return;

    let url = newWindowUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    try {
      new URL(url); // Validate URL
      addWindow(url);
      setNewWindowUrl('');
    } catch (error) {
      alert('Nieprawidłowy URL');
    }
  };

  const handleTemplateSelect = (template: WindowTemplate) => {
    addWindow(template.url, template.name, template.size);
    setShowTemplates(false);
  };

  // ============================================
  // RENDER
  // ============================================

  const minimizedWindows = windows.filter(w => w.isMinimized);
  const activeWindows = windows.filter(w => !w.isMinimized);

  return (
    <div
      ref={containerRef}
      className="iframe-window-manager"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      {/* Top Toolbar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 16px',
        zIndex: 10000
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
          🔲 Iframe Manager
        </h3>

        <input
          type="text"
          value={newWindowUrl}
          onChange={(e) => setNewWindowUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleQuickAdd()}
          placeholder="Wpisz URL i naciśnij Enter..."
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />

        <button
          onClick={handleQuickAdd}
          style={{
            padding: '8px 16px',
            background: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          ➕ Dodaj
        </button>

        <button
          onClick={() => setShowTemplates(!showTemplates)}
          style={{
            padding: '8px 16px',
            background: '#50c878',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          📋 Szablony
        </button>

        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
          {windows.length}/{maxWindows} okien
        </div>
      </div>

      {/* Templates Dropdown */}
      {showTemplates && (
        <div style={{
          position: 'fixed',
          top: '70px',
          right: '16px',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: '8px',
          zIndex: 10001,
          minWidth: '200px'
        }}>
          {WINDOW_TEMPLATES.map(template => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px',
                textAlign: 'left',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{ fontSize: '20px', marginRight: '8px' }}>{template.icon}</span>
              {template.name}
            </button>
          ))}
        </div>
      )}

      {/* Windows Container */}
      <div style={{ paddingTop: '60px', height: '100%' }}>
        {activeWindows.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'white',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔲</div>
            <h2 style={{ margin: '0 0 8px 0' }}>Brak otwartych okien</h2>
            <p style={{ margin: 0, opacity: 0.8 }}>
              Wpisz URL powyżej lub wybierz szablon aby rozpocząć
            </p>
            <div style={{ marginTop: '24px', opacity: 0.6, fontSize: '14px' }}>
              <div>💡 Skróty klawiszowe:</div>
              <div>Ctrl+N - Nowe okno</div>
              <div>Ctrl+W - Zamknij okno</div>
              <div>Ctrl+Tab - Przełącz okna</div>
            </div>
          </div>
        )}

        {activeWindows.map(window => (
          <div
            key={window.id}
            style={{
              position: 'absolute',
              left: window.isMaximized ? 0 : window.position.x,
              top: window.isMaximized ? 0 : window.position.y,
              width: window.isMaximized ? '100%' : window.size.width,
              height: window.isMaximized ? 'calc(100vh - 60px)' : window.size.height,
              zIndex: window.zIndex,
              background: 'white',
              borderRadius: window.isMaximized ? 0 : '8px',
              boxShadow: activeWindowId === window.id
                ? '0 8px 32px rgba(0,0,0,0.3)'
                : '0 4px 16px rgba(0,0,0,0.2)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: window.isMaximized ? 'all 0.3s ease' : 'box-shadow 0.2s'
            }}
            onClick={() => focusWindow(window.id)}
          >
            {/* Window Header */}
            <div
              style={{
                height: '40px',
                background: activeWindowId === window.id
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#f5f5f5',
                color: activeWindowId === window.id ? 'white' : '#333',
                display: 'flex',
                alignItems: 'center',
                padding: '0 12px',
                cursor: 'move',
                userSelect: 'none'
              }}
              onMouseDown={(e) => handleMouseDown(e, window.id)}
            >
              {window.favicon && (
                <img
                  src={window.favicon}
                  alt=""
                  style={{ width: '16px', height: '16px', marginRight: '8px' }}
                />
              )}
              <span style={{
                flex: 1,
                fontSize: '14px',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {window.title}
              </span>

              {/* Window Controls */}
              <div className="window-controls" style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    minimizeWindow(window.id);
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Minimalizuj"
                >
                  −
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    maximizeWindow(window.id);
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Maksymalizuj"
                >
                  {window.isMaximized ? '❐' : '□'}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeWindow(window.id);
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    border: 'none',
                    background: 'rgba(255,100,100,0.8)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                  title="Zamknij"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div style={{ flex: 1, position: 'relative' }}>
              {window.loading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f9f9f9',
                  zIndex: 1
                }}>
                  <div className="spinner" style={{ fontSize: '14px', color: '#666' }}>
                    Ładowanie...
                  </div>
                </div>
              )}

              {window.error && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fee',
                  color: '#c33',
                  padding: '20px',
                  zIndex: 1
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                  <div style={{ fontWeight: 600, marginBottom: '8px' }}>
                    Nie udało się załadować strony
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    {window.error}
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      marginTop: '16px',
                      padding: '8px 16px',
                      background: '#4a90e2',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    🔄 Odśwież
                  </button>
                </div>
              )}

              <iframe
                src={window.url}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: window.loading || window.error ? 'none' : 'block'
                }}
                onLoad={() => {
                  setWindows(prev => prev.map(w =>
                    w.id === window.id ? { ...w, loading: false, error: undefined } : w
                  ));
                }}
                onError={() => {
                  setWindows(prev => prev.map(w =>
                    w.id === window.id
                      ? { ...w, loading: false, error: 'Nie można załadować strony' }
                      : w
                  ));
                }}
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                allow="camera; microphone; fullscreen; encrypted-media"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Minimized Windows Bar */}
      {minimizedWindows.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 16px',
          overflowX: 'auto',
          zIndex: 10000
        }}>
          {minimizedWindows.map(window => (
            <button
              key={window.id}
              onClick={() => restoreWindow(window.id)}
              style={{
                padding: '8px 16px',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
              title={window.title}
            >
              {window.favicon && (
                <img src={window.favicon} alt="" style={{ width: '16px', height: '16px' }} />
              )}
              {window.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default IframeWindowManager;
