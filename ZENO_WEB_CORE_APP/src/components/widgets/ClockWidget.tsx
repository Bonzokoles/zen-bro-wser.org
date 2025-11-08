/**
 * ClockWidget - Simple clock widget
 */

import React, { useState, useEffect } from 'react';
import WidgetContainer, { WIDGET_SKINS } from './WidgetContainer';
import type { WidgetSkin } from './WidgetContainer';

interface ClockWidgetProps {
    onClose: () => void;
    initialSkin?: WidgetSkin;
    initialPosition?: { x: number; y: number };
}

const ClockWidget: React.FC<ClockWidgetProps> = ({
    onClose,
    initialSkin = 'modern',
    initialPosition = { x: 50, y: 50 }
}) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [skin, setSkin] = useState<WidgetSkin>(initialSkin);

    const theme = WIDGET_SKINS[skin];

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <WidgetContainer
            id="clock"
            title="🕐 Zegar"
            skin={skin}
            initialPosition={initialPosition}
            onClose={onClose}
            onSkinChange={setSkin}
            width={280}
            height={150}
        >
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.35 }}>
                    {currentTime.toLocaleDateString('pl-PL', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                    })}
                </div>
                <div style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    fontFamily: 'monospace',
                    color: theme.accent
                }}>
                    {currentTime.toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </div>
                <div style={{ fontSize: '24px', opacity: 0.35 }}>
                    {currentTime.getSeconds().toString().padStart(2, '0')}
                </div>
            </div>
        </WidgetContainer>
    );
};

export default ClockWidget;
