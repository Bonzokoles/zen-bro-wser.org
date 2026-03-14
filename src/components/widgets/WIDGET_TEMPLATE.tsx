/**
 * WIDGET DEVELOPMENT GUIDE
 * 
 * Jak dodać nowy widget:
 * 
 * 1. Stwórz nowy plik w src/components/widgets/MojWidgetWidget.tsx
 * 
 * 2. Użyj tego szablonu:
 */

import React, { useState } from 'react';
import WidgetContainer, { WIDGET_SKINS } from './WidgetContainer';
import type { WidgetSkin } from './WidgetContainer';

interface MojWidgetProps {
    onClose: () => void;
    initialSkin?: WidgetSkin;
    initialPosition?: { x: number; y: number };
}

const MojWidget: React.FC<MojWidgetProps> = ({
    onClose,
    initialSkin = 'modern',
    initialPosition = { x: 100, y: 100 }
}) => {
    const [skin, setSkin] = useState<WidgetSkin>(initialSkin);
    const theme = WIDGET_SKINS[skin]; // Użyj theme.bg, theme.text, theme.border, theme.accent

    return (
        <WidgetContainer
            id="moj-widget"           // Unikalne ID
            title="📌 Mój Widget"     // Tytuł w headerze
            skin={skin}
            initialPosition={initialPosition}
            onClose={onClose}
            onSkinChange={setSkin}
            width={300}               // Szerokość
            height={200}              // Wysokość
        >
            {/* Twoja zawartość widgetu */}
            <div style={{ padding: '16px', color: theme.text }}>
                <h3 style={{ color: theme.accent }}>Twoja treść</h3>
                <p>Widget automatycznie ma:</p>
                <ul>
                    <li>Drag & drop (przeciągnij za header)</li>
                    <li>Minimize/Maximize (przycisk ─)</li>
                    <li>Close (przycisk ✕)</li>
                    <li>Skin selector (dropdown)</li>
                    <li>Always on top (z-index 10000)</li>
                    <li>Zapamiętywanie pozycji (localStorage)</li>
                </ul>
            </div>
        </WidgetContainer>
    );
};

export default MojWidget;

/**
 * 3. W Browser.tsx dodaj:
 * 
 * import MojWidget from './widgets/MojWidget';
 * 
 * const [isMojWidgetOpen, setIsMojWidgetOpen] = useState(false);
 * 
 * // W JSX:
 * {isMojWidgetOpen && (
 *     <MojWidget 
 *         onClose={() => setIsMojWidgetOpen(false)}
 *         initialSkin="modern"
 *         initialPosition={{ x: 100, y: 100 }}
 *     />
 * )}
 * 
 * 4. Dostępne skórki:
 * - modern: Biały text/border
 * - classic: Zielony (Matrix style)
 * - minimal: Subtelny biały
 * - retro: Żółty (cyberpunk)
 * 
 * 5. Theme properties:
 * - theme.bg: Tło widgetu
 * - theme.text: Kolor tekstu
 * - theme.border: Kolor obramowania
 * - theme.accent: Kolor akcentu (jasny, dla tytułów)
 */
