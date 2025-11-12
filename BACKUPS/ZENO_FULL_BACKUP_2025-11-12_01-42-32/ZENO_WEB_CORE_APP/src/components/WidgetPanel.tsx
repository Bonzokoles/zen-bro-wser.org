/**
 * WidgetPanel - Rainmeter-style widgets dla przeglądarki
 * Floating customizable widgets z różnymi skins
 */

import React, { useState, useEffect } from 'react';

interface Widget {
    id: string;
    type: 'clock' | 'shortcuts' | 'system' | 'notes';
    position: { x: number; y: number };
    skin: 'modern' | 'classic' | 'minimal' | 'retro';
}

interface WidgetPanelProps {
    onClose: () => void;
}

const WidgetPanel: React.FC<WidgetPanelProps> = ({ onClose }) => {
    const [widgets, setWidgets] = useState<Widget[]>([
        { id: '1', type: 'clock', position: { x: 50, y: 50 }, skin: 'modern' },
        { id: '2', type: 'shortcuts', position: { x: 50, y: 200 }, skin: 'modern' }
    ]);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedSkin, setSelectedSkin] = useState<'modern' | 'classic' | 'minimal' | 'retro'>('modern');
    const [showMenu, setShowMenu] = useState(true);
    const [draggingWidget, setDraggingWidget] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Update clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Skin themes
    const skins = {
        modern: {
            bg: 'rgba(0, 0, 0, 0.1)',
            text: 'rgba(255, 255, 255, 0.35)',
            border: 'rgba(255, 255, 255, 0.15)',
            accent: 'rgba(255, 255, 255, 0.9)'
        },
        classic: {
            bg: 'rgba(0, 0, 0, 0.1)',
            text: 'rgba(0, 255, 0, 0.35)',
            border: 'rgba(0, 255, 0, 0.15)',
            accent: 'rgba(0, 255, 0, 0.9)'
        },
        minimal: {
            bg: 'rgba(0, 0, 0, 0.1)',
            text: 'rgba(255, 255, 255, 0.25)',
            border: 'rgba(255, 255, 255, 0.15)',
            accent: 'rgba(255, 255, 255, 0.9)'
        },
        retro: {
            bg: 'rgba(0, 0, 0, 0.1)',
            text: 'rgba(255, 255, 0, 0.35)',
            border: 'rgba(255, 255, 0, 0.15)',
            accent: 'rgba(255, 255, 0, 0.9)'
        }
    };

    const currentSkin = skins[selectedSkin];

    // Drag handlers
    const handleMouseDown = (widgetId: string, e: React.MouseEvent) => {
        const widget = widgets.find(w => w.id === widgetId);
        if (!widget) return;

        setDraggingWidget(widgetId);
        setDragOffset({
            x: e.clientX - widget.position.x,
            y: e.clientY - widget.position.y
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!draggingWidget) return;

        setWidgets(prev => prev.map(w =>
            w.id === draggingWidget
                ? { ...w, position: { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y } }
                : w
        ));
    };

    const handleMouseUp = () => {
        setDraggingWidget(null);
    };

    useEffect(() => {
        if (draggingWidget) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggingWidget, dragOffset]);

    // Widget renderers
    const renderClockWidget = (widget: Widget) => (
        <div
            key={widget.id}
            onMouseDown={(e) => handleMouseDown(widget.id, e)}
            style={{
                position: 'fixed',
                left: widget.position.x,
                top: widget.position.y,
                background: currentSkin.bg,
                border: `1px solid ${currentSkin.border}`,
                borderRadius: '0px',
                padding: '20px',
                color: currentSkin.text,
                cursor: draggingWidget === widget.id ? 'grabbing' : 'grab',
                userSelect: 'none',
                backdropFilter: 'blur(10px)',
                boxShadow: 'none',
                zIndex: 9999
            }}
        >
            <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.35 }}>
                {currentTime.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: 'monospace', color: currentSkin.accent }}>
                {currentTime.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontSize: '24px', opacity: 0.35 }}>
                {currentTime.getSeconds().toString().padStart(2, '0')}
            </div>
        </div>
    );

    const renderShortcutsWidget = (widget: Widget) => (
        <div
            key={widget.id}
            onMouseDown={(e) => handleMouseDown(widget.id, e)}
            style={{
                position: 'fixed',
                left: widget.position.x,
                top: widget.position.y,
                background: currentSkin.bg,
                border: `1px solid ${currentSkin.border}`,
                borderRadius: '0px',
                padding: '16px',
                color: currentSkin.text,
                cursor: draggingWidget === widget.id ? 'grabbing' : 'grab',
                userSelect: 'none',
                backdropFilter: 'blur(10px)',
                boxShadow: 'none',
                zIndex: 9999,
                minWidth: '200px'
            }}
        >
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: currentSkin.accent, opacity: 0.35 }}>
                🔗 Skróty
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://google.com', '_blank');
                    }}
                    style={{
                        background: 'rgba(0, 0, 0, 0.1)',
                        border: `1px solid ${currentSkin.border}`,
                        borderRadius: '0px',
                        padding: '8px 12px',
                        color: currentSkin.text,
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left'
                    }}
                >
                    🔍 Google
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        window.open('https://github.com', '_blank');
                    }}
                    style={{
                        background: 'rgba(0, 0, 0, 0.1)',
                        border: `1px solid ${currentSkin.border}`,
                        borderRadius: '0px',
                        padding: '8px 12px',
                        color: currentSkin.text,
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left'
                    }}
                >
                    🐙 GitHub
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Otwórz lokalny program (wymaga Electron lub PWA)
                        alert('W pełnej wersji desktopowej otworzysz V:\\twoj-program.exe');
                    }}
                    style={{
                        background: 'rgba(0, 0, 0, 0.1)',
                        border: `1px solid ${currentSkin.border}`,
                        borderRadius: '0px',
                        padding: '8px 12px',
                        color: currentSkin.text,
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left'
                    }}
                >
                    💾 Program lokalny
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Control Menu */}
            {showMenu && (
                <div style={{
                    position: 'fixed',
                    top: 20,
                    right: 20,
                    background: 'rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '0px',
                    padding: '16px',
                    zIndex: 10000,
                    backdropFilter: 'blur(10px)',
                    boxShadow: 'none'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h3 style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0, fontSize: '16px' }}>🎨 Widget Panel</h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0px',
                                padding: '4px 12px',
                                color: 'rgba(255, 255, 255, 0.9)',
                                fontSize: '12px',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ color: 'rgba(255, 255, 255, 0.35)', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                            Skin:
                        </label>
                        <select
                            value={selectedSkin}
                            onChange={(e) => setSelectedSkin(e.target.value as any)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: 'rgba(0, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '0px',
                                color: 'rgba(255, 255, 255, 0.9)',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="modern">🌟 Modern</option>
                            <option value="classic">💚 Classic</option>
                            <option value="minimal">⚪ Minimal</option>
                            <option value="retro">🔥 Retro</option>
                        </select>
                    </div>

                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.35)', marginTop: '8px' }}>
                        💡 Przeciągnij widżety aby zmienić pozycję
                    </div>
                </div>
            )}

            {/* Render widgets */}
            {widgets.map(widget => {
                switch (widget.type) {
                    case 'clock':
                        return renderClockWidget(widget);
                    case 'shortcuts':
                        return renderShortcutsWidget(widget);
                    default:
                        return null;
                }
            })}
        </>
    );
};

export default WidgetPanel;
