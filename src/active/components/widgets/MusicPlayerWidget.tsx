/**
 * MusicPlayerWidget - Webamp with Widget System integration
 */

import React, { useEffect, useRef, useState } from 'react';
import Webamp from 'webamp';
import { WIDGET_SKINS } from './WidgetContainer';
import type { WidgetSkin } from './WidgetContainer';

interface MusicPlayerWidgetProps {
    onClose: () => void;
    initialSkin?: WidgetSkin;
    initialPosition?: { x: number; y: number };
}

// Demo tracks
const DEMO_TRACKS = [
    {
        metaData: {
            artist: 'Jingle Punks',
            title: 'Wallpaper',
        },
        url: 'https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3',
        duration: 5.322286,
    },
];

const MusicPlayerWidget: React.FC<MusicPlayerWidgetProps> = ({
    onClose,
    initialSkin = 'modern',
    initialPosition = { x: 50, y: 450 }
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const webampRef = useRef<Webamp | null>(null);
    const [skin, setSkin] = useState<WidgetSkin>(initialSkin);
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const theme = WIDGET_SKINS[skin];

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button, select')) return;
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    // Initialize Webamp
    useEffect(() => {
        if (!containerRef.current || isMinimized) return;

        const initWebamp = async () => {
            try {
                const webamp = new Webamp({
                    initialTracks: DEMO_TRACKS,
                    enableHotkeys: true,
                    zIndex: 10000,
                });

                if (containerRef.current) {
                    await webamp.renderWhenReady(containerRef.current);
                    webampRef.current = webamp;
                }
            } catch (error) {
                console.error('Failed to initialize Webamp:', error);
            }
        };

        initWebamp();

        return () => {
            if (webampRef.current) {
                webampRef.current.dispose();
                webampRef.current = null;
            }
        };
    }, [isMinimized]);

    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                borderRadius: '0px',
                backdropFilter: 'blur(10px)',
                zIndex: 10000,
                userSelect: 'none'
            }}
        >
            {/* Header */}
            <div
                onMouseDown={handleMouseDown}
                style={{
                    padding: '8px 12px',
                    borderBottom: isMinimized ? 'none' : `1px solid ${theme.border}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: isDragging ? 'grabbing' : 'grab',
                    color: theme.text,
                    minWidth: '200px'
                }}
            >
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: theme.accent }}>
                    🎵 Music Player
                </span>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Skin selector */}
                    {!isMinimized && (
                        <select
                            value={skin}
                            onChange={(e) => setSkin(e.target.value as WidgetSkin)}
                            style={{
                                background: 'rgba(0, 0, 0, 0.1)',
                                border: `1px solid ${theme.border}`,
                                borderRadius: '0px',
                                padding: '2px 4px',
                                fontSize: '10px',
                                color: theme.accent,
                                cursor: 'pointer'
                            }}
                        >
                            <option value="modern">Modern</option>
                            <option value="classic">Classic</option>
                            <option value="minimal">Minimal</option>
                            <option value="retro">Retro</option>
                        </select>
                    )}

                    {/* Minimize button */}
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: theme.accent,
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '0',
                            width: '20px',
                            height: '20px'
                        }}
                    >
                        {isMinimized ? '▢' : '─'}
                    </button>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: theme.accent,
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '0',
                            width: '20px',
                            height: '20px'
                        }}
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Webamp container */}
            {!isMinimized && (
                <div
                    ref={containerRef}
                    style={{
                        padding: '10px',
                        background: theme.bg
                    }}
                />
            )}
        </div>
    );
};

export default MusicPlayerWidget;
