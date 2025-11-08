/**
 * WidgetContainer - Universal container for all widgets
 * Provides drag, minimize, close, and skin support
 */

import React, { useState, useEffect } from 'react';

export type WidgetSkin = 'modern' | 'classic' | 'minimal' | 'retro';

export interface WidgetTheme {
    bg: string;
    text: string;
    border: string;
    accent: string;
}

export const WIDGET_SKINS: Record<WidgetSkin, WidgetTheme> = {
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

interface WidgetContainerProps {
    id: string;
    title: string;
    skin: WidgetSkin;
    initialPosition: { x: number; y: number };
    onClose: () => void;
    onSkinChange?: (skin: WidgetSkin) => void;
    children: React.ReactNode;
    width?: number;
    height?: number;
}

const WidgetContainer: React.FC<WidgetContainerProps> = ({
    id,
    title,
    skin,
    initialPosition,
    onClose,
    onSkinChange,
    children,
    width = 300,
    height = 200
}) => {
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const theme = WIDGET_SKINS[skin];

    // Drag handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('button, select, input')) return;

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

    // Save position to localStorage
    useEffect(() => {
        localStorage.setItem(`widget-${id}-position`, JSON.stringify(position));
    }, [id, position]);

    return (
        <div
            style={{
                position: 'fixed',
                left: position.x,
                top: position.y,
                width: isMinimized ? 'auto' : width,
                height: isMinimized ? 'auto' : height,
                background: theme.bg,
                border: `1px solid ${theme.border}`,
                borderRadius: '0px',
                backdropFilter: 'blur(10px)',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
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
                    color: theme.text
                }}
            >
                <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{title}</span>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {/* Skin selector */}
                    {onSkinChange && !isMinimized && (
                        <select
                            value={skin}
                            onChange={(e) => onSkinChange(e.target.value as WidgetSkin)}
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
                        title={isMinimized ? 'Rozwiń' : 'Minimalizuj'}
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
                        title="Zamknij"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    color: theme.text
                }}>
                    {children}
                </div>
            )}
        </div>
    );
};

export default WidgetContainer;
