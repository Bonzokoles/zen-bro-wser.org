import React, { useState } from 'react';
import { InternetArchivePlayer } from './iframe/InternetArchivePlayer';
import { YouTubePlayer } from './iframe/YouTubePlayer';

interface VideoPlayerPanelProps {
    onClose: () => void;
}

type VideoSource = 'youtube' | 'archive';

export default function VideoPlayerPanel({ onClose }: VideoPlayerPanelProps) {
    const [source, setSource] = useState<VideoSource>('youtube');
    const [videoId, setVideoId] = useState('dQw4w9WgXcQ'); // Default YouTube
    const [archiveId, setArchiveId] = useState('prelinger'); // Default Archive
    const [inputValue, setInputValue] = useState('');

    // Floating window state
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [size, setSize] = useState({ width: 640, height: 480 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isMinimized, setIsMinimized] = useState(false);
    const [savedSize, setSavedSize] = useState({ width: 640, height: 480 }); const colors = {
        bg: '#0f172a',
        primary: '#1e293b',
        accent: '#334155',
        border: '#475569',
        text: '#f1f5f9',
        muted: '#94a3b8'
    };

    // Dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.video-controls')) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
        if (isResizing) {
            setSize({
                width: Math.max(400, e.clientX - position.x),
                height: Math.max(300, e.clientY - position.y)
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setIsResizing(false);
    };

    React.useEffect(() => {
        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, isResizing, dragStart, position]);

    const handleLoadVideo = () => {
        if (!inputValue) return;

        if (source === 'youtube') {
            // Extract YouTube ID from URL or use as-is
            const match = inputValue.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
            setVideoId(match ? match[1] : inputValue);
        } else {
            setArchiveId(inputValue);
        }
        setInputValue('');
    };

    const toggleMinimize = () => {
        if (isMinimized) {
            setSize(savedSize);
            setIsMinimized(false);
        } else {
            setSavedSize(size);
            setSize({ width: 320, height: 60 });
            setIsMinimized(true);
        }
    };

    return (
        <>
            {/* NO BACKDROP - panel działa jako always on top floating window */}

            {/* Floating Panel - ALWAYS ON TOP */}
            <div
                style={{
                    position: 'fixed',
                    left: position.x,
                    top: position.y,
                    width: size.width,
                    height: size.height,
                    backgroundColor: colors.primary,
                    border: `2px solid ${colors.border}`,
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
                    zIndex: 99999, // BARDZO WYSOKI - zawsze na górze
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    cursor: isDragging ? 'move' : 'default'
                }}
            >
                {/* Header */}
                <div
                    onMouseDown={handleMouseDown}
                    style={{
                        padding: '12px 16px',
                        backgroundColor: colors.bg,
                        borderBottom: `1px solid ${colors.border}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'move',
                        userSelect: 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>🎬</span>
                        <span style={{ color: colors.text, fontWeight: '600', fontSize: '14px' }}>
                            Video Player
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {/* Minimize Button */}
                        <button
                            onClick={toggleMinimize}
                            style={{
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            {isMinimized ? '🔼 Rozwiń' : '🔽 Minimalizuj'}
                        </button>
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            style={{
                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ✕ Zamknij
                        </button>
                    </div>
                </div>

                {/* Controls - ukryte gdy zminimalizowane */}
                {!isMinimized && (
                    <div className="video-controls" style={{
                        padding: '12px 16px',
                        backgroundColor: colors.accent,
                        borderBottom: `1px solid ${colors.border}`,
                        display: 'flex',
                        gap: '8px',
                        flexWrap: 'wrap'
                    }}>
                        {/* Source Selector */}
                        <select
                            value={source}
                            onChange={(e) => setSource(e.target.value as VideoSource)}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: colors.bg,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                color: colors.text,
                                fontSize: '13px',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="youtube">📺 YouTube</option>
                            <option value="archive">📼 Internet Archive</option>
                        </select>

                        {/* Video ID Input */}
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={source === 'youtube' ? 'YouTube URL lub ID' : 'Archive identifier'}
                            onKeyPress={(e) => e.key === 'Enter' && handleLoadVideo()}
                            style={{
                                flex: 1,
                                minWidth: '200px',
                                padding: '8px 12px',
                                backgroundColor: colors.bg,
                                border: `1px solid ${colors.border}`,
                                borderRadius: '6px',
                                color: colors.text,
                                fontSize: '13px',
                                outline: 'none'
                            }}
                        />

                        {/* Load Button */}
                        <button
                            onClick={handleLoadVideo}
                            style={{
                                padding: '8px 16px',
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                fontSize: '13px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            ▶ Załaduj
                        </button>
                    </div>
                )}

                {/* Video Container - ukryte gdy zminimalizowane */}
                {!isMinimized && (
                    <div style={{
                        flex: 1,
                        padding: '16px',
                        backgroundColor: colors.bg,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden'
                    }}>
                        {source === 'youtube' ? (
                            <YouTubePlayer
                                videoId={videoId}
                                width={size.width - 32}
                                height={size.height - 150}
                            />
                        ) : (
                            <InternetArchivePlayer
                                identifier={archiveId}
                                width={size.width - 32}
                                height={size.height - 150}
                            />
                        )}
                    </div>
                )}

                {/* Resize Handle */}
                <div
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        setIsResizing(true);
                    }}
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '20px',
                        height: '20px',
                        cursor: 'nwse-resize',
                        background: 'linear-gradient(135deg, transparent 50%, #3b82f6 50%)',
                        borderBottomRightRadius: '12px'
                    }}
                />
            </div>
        </>
    );
}
