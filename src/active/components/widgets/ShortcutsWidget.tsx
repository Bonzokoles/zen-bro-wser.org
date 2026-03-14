/**
 * ShortcutsWidget - Edytowalne skróty + tajny link z kodem PIN
 * 
 * FEATURES:
 * - Dodawanie/usuwanie/edycja linków
 * - Zapis w localStorage
 * - Tajny link "PErso_na.cc" z 4-cyfrowym kodem PIN
 * - PIN wpisywany na klawiaturze (niewidoczny)
 */

import React, { useState, useEffect, useRef } from 'react';
import WidgetContainer, { WIDGET_SKINS } from './WidgetContainer';
import type { WidgetSkin } from './WidgetContainer';

interface Shortcut {
    icon: string;
    label: string;
    url: string;
}

interface ShortcutsWidgetProps {
    onClose: () => void;
    initialSkin?: WidgetSkin;
    initialPosition?: { x: number; y: number };
}

const DEFAULT_SHORTCUTS: Shortcut[] = [
    { icon: '🔍', label: 'ZENO Search', url: 'about:search' },
    { icon: '🐙', label: 'GitHub', url: 'https://github.com' },
    { icon: '📺', label: 'YouTube', url: 'https://youtube.com' },
    { icon: '🎨', label: 'ChatGPT', url: 'https://chat.openai.com' }
];

const SECRET_LINK = {
    icon: '🔐',
    label: 'PErso_na.cc',
    url: 'https://persona.cc' // Zmień na swój sekretny link
};

const ShortcutsWidget: React.FC<ShortcutsWidgetProps> = ({
    onClose,
    initialSkin = 'modern',
    initialPosition = { x: 50, y: 250 }
}) => {
    const [skin, setSkin] = useState<WidgetSkin>(initialSkin);
    const theme = WIDGET_SKINS[skin];

    // Shortcuts management
    const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
        const saved = localStorage.getItem('widget-shortcuts');
        return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
    });

    // Edit mode
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newShortcut, setNewShortcut] = useState<Shortcut>({ icon: '�', label: '', url: '' });

    // Secret PIN system
    const [secretPin, setSecretPin] = useState<string>(() => {
        return localStorage.getItem('widget-shortcuts-pin') || '6498'; // Domyślny PIN
    });
    const [pinInput, setPinInput] = useState<string>('');
    const [showSecretLink, setShowSecretLink] = useState(false);
    const pinTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Save shortcuts to localStorage
    useEffect(() => {
        localStorage.setItem('widget-shortcuts', JSON.stringify(shortcuts));
    }, [shortcuts]);

    // Keyboard PIN listener
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            // Only digits
            if (!/^\d$/.test(e.key)) {
                setPinInput('');
                return;
            }

            // Clear previous timer
            if (pinTimerRef.current) {
                clearTimeout(pinTimerRef.current);
            }

            // Add digit to input
            const newPin = (pinInput + e.key).slice(-4); // Keep last 4 digits
            setPinInput(newPin);

            // Check if matches
            if (newPin === secretPin) {
                setShowSecretLink(true);
                setPinInput('');

                // Auto-hide after 30 seconds
                setTimeout(() => setShowSecretLink(false), 30000);
            }

            // Reset after 2 seconds of inactivity
            pinTimerRef.current = setTimeout(() => {
                setPinInput('');
            }, 2000);
        };

        window.addEventListener('keypress', handleKeyPress);
        return () => {
            window.removeEventListener('keypress', handleKeyPress);
            if (pinTimerRef.current) clearTimeout(pinTimerRef.current);
        };
    }, [pinInput, secretPin]);

    const addShortcut = () => {
        if (!newShortcut.label || !newShortcut.url) return;
        setShortcuts([...shortcuts, newShortcut]);
        setNewShortcut({ icon: '�', label: '', url: '' });
    };

    const deleteShortcut = (index: number) => {
        setShortcuts(shortcuts.filter((_, i) => i !== index));
    };

    const updateShortcut = (index: number, updated: Shortcut) => {
        setShortcuts(shortcuts.map((s, i) => i === index ? updated : s));
        setEditingIndex(null);
    };

    const resetToDefaults = () => {
        if (confirm('Przywrócić domyślne skróty?')) {
            setShortcuts(DEFAULT_SHORTCUTS);
        }
    };

    const changePIN = () => {
        const newPin = prompt('Wpisz nowy 4-cyfrowy PIN:', secretPin);
        if (newPin && /^\d{4}$/.test(newPin)) {
            setSecretPin(newPin);
            localStorage.setItem('widget-shortcuts-pin', newPin);
            alert('PIN zmieniony! Nowy PIN: ' + newPin);
        } else if (newPin) {
            alert('PIN musi mieć dokładnie 4 cyfry!');
        }
    };

    return (
        <WidgetContainer
            id="shortcuts"
            title={isEditMode ? "✏️ Edycja Skrótów" : "🔗 Skróty"}
            skin={skin}
            initialPosition={initialPosition}
            onClose={onClose}
            onSkinChange={setSkin}
            width={280}
            height={isEditMode ? 480 : (shortcuts.length * 45 + (showSecretLink ? 45 : 0) + 100)}
        >
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflowY: 'auto' }}>

                {/* Edit Mode Toggle */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsEditMode(!isEditMode);
                        setEditingIndex(null);
                    }}
                    style={{
                        background: isEditMode ? theme.accent : 'rgba(0, 0, 0, 0.1)',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '0px',
                        padding: '6px',
                        color: isEditMode ? 'rgba(0, 0, 0, 0.9)' : theme.text,
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold'
                    }}
                >
                    {isEditMode ? '✓ Zakończ Edycję' : '✏️ Edytuj'}
                </button>

                {/* Shortcuts List */}
                {shortcuts.map((shortcut, index) => (
                    <div key={index} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {editingIndex === index ? (
                            // Edit form
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.2)', padding: '8px', border: `1px solid ${theme.accent}` }}>
                                <input
                                    type="text"
                                    value={shortcut.icon}
                                    onChange={(e) => updateShortcut(index, { ...shortcut, icon: e.target.value })}
                                    placeholder="Emoji"
                                    maxLength={2}
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        border: `1px solid ${theme.border}`,
                                        color: theme.text,
                                        padding: '4px',
                                        fontSize: '12px'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={shortcut.label}
                                    onChange={(e) => updateShortcut(index, { ...shortcut, label: e.target.value })}
                                    placeholder="Nazwa"
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        border: `1px solid ${theme.border}`,
                                        color: theme.text,
                                        padding: '4px',
                                        fontSize: '12px'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={shortcut.url}
                                    onChange={(e) => updateShortcut(index, { ...shortcut, url: e.target.value })}
                                    placeholder="URL"
                                    style={{
                                        background: 'rgba(0,0,0,0.3)',
                                        border: `1px solid ${theme.border}`,
                                        color: theme.text,
                                        padding: '4px',
                                        fontSize: '12px'
                                    }}
                                />
                            </div>
                        ) : (
                            // Normal button
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isEditMode) {
                                        window.open(shortcut.url, '_blank');
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    background: 'rgba(0, 0, 0, 0.1)',
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: '0px',
                                    padding: '8px 12px',
                                    color: theme.text,
                                    cursor: isEditMode ? 'default' : 'pointer',
                                    fontSize: '13px',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    opacity: isEditMode ? 0.6 : 1
                                }}
                            >
                                <span>{shortcut.icon}</span>
                                <span>{shortcut.label}</span>
                            </button>
                        )}

                        {/* Edit Mode Controls */}
                        {isEditMode && (
                            <div style={{ display: 'flex', gap: '2px' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingIndex(editingIndex === index ? null : index);
                                    }}
                                    style={{
                                        background: editingIndex === index ? theme.accent : 'rgba(0,0,0,0.2)',
                                        border: `1px solid ${theme.border}`,
                                        color: theme.text,
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        fontSize: '11px'
                                    }}
                                    title="Edytuj"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteShortcut(index);
                                    }}
                                    style={{
                                        background: 'rgba(255,0,0,0.2)',
                                        border: `1px solid rgba(255,0,0,0.5)`,
                                        color: 'rgba(255,100,100,0.9)',
                                        cursor: 'pointer',
                                        padding: '4px 8px',
                                        fontSize: '11px'
                                    }}
                                    title="Usuń"
                                >
                                    ✕
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {/* Secret Link - only visible after correct PIN */}
                {showSecretLink && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(SECRET_LINK.url, '_blank');
                        }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(138,43,226,0.2), rgba(255,20,147,0.2))',
                            border: `2px solid ${theme.accent}`,
                            borderRadius: '0px',
                            padding: '8px 12px',
                            color: theme.accent,
                            cursor: 'pointer',
                            fontSize: '13px',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 'bold',
                            animation: 'pulse 2s infinite'
                        }}
                    >
                        <span>{SECRET_LINK.icon}</span>
                        <span>{SECRET_LINK.label}</span>
                    </button>
                )}

                {/* Add New Shortcut Form */}
                {isEditMode && (
                    <div style={{
                        marginTop: '8px',
                        padding: '8px',
                        background: 'rgba(0,0,0,0.2)',
                        border: `1px solid ${theme.accent}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                    }}>
                        <div style={{ fontSize: '11px', color: theme.accent, fontWeight: 'bold', marginBottom: '4px' }}>
                            ➕ Dodaj Nowy:
                        </div>
                        <input
                            type="text"
                            value={newShortcut.icon}
                            onChange={(e) => setNewShortcut({ ...newShortcut, icon: e.target.value })}
                            placeholder="Emoji (np. 🔥)"
                            maxLength={2}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: `1px solid ${theme.border}`,
                                color: theme.text,
                                padding: '6px',
                                fontSize: '12px'
                            }}
                        />
                        <input
                            type="text"
                            value={newShortcut.label}
                            onChange={(e) => setNewShortcut({ ...newShortcut, label: e.target.value })}
                            placeholder="Nazwa (np. Twitter)"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: `1px solid ${theme.border}`,
                                color: theme.text,
                                padding: '6px',
                                fontSize: '12px'
                            }}
                        />
                        <input
                            type="text"
                            value={newShortcut.url}
                            onChange={(e) => setNewShortcut({ ...newShortcut, url: e.target.value })}
                            placeholder="URL (https://...)"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                background: 'rgba(0,0,0,0.3)',
                                border: `1px solid ${theme.border}`,
                                color: theme.text,
                                padding: '6px',
                                fontSize: '12px'
                            }}
                        />
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addShortcut();
                            }}
                            style={{
                                background: theme.accent,
                                border: 'none',
                                color: 'rgba(0,0,0,0.9)',
                                padding: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}
                        >
                            ✓ Dodaj
                        </button>
                    </div>
                )}

                {/* Settings */}
                {isEditMode && (
                    <div style={{ marginTop: '8px', display: 'flex', gap: '4px', flexDirection: 'column' }}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                changePIN();
                            }}
                            style={{
                                background: 'rgba(0,0,0,0.2)',
                                border: `1px solid ${theme.border}`,
                                color: theme.text,
                                padding: '6px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            🔐 Zmień PIN ({secretPin})
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                resetToDefaults();
                            }}
                            style={{
                                background: 'rgba(0,0,0,0.2)',
                                border: `1px solid ${theme.border}`,
                                color: theme.text,
                                padding: '6px',
                                cursor: 'pointer',
                                fontSize: '11px'
                            }}
                        >
                            🔄 Przywróć Domyślne
                        </button>
                    </div>
                )}

                {/* PIN Hint */}
                {!isEditMode && (
                    <div style={{
                        marginTop: '4px',
                        fontSize: '9px',
                        color: theme.border,
                        textAlign: 'center',
                        fontStyle: 'italic'
                    }}>
                        Wpisz kod PIN na klawiaturze...
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </WidgetContainer>
    );
};

export default ShortcutsWidget;
