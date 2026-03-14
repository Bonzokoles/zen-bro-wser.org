import React, { useState, useEffect } from 'react';

interface OnThisDayWidgetProps {
    onClose: () => void;
}

interface WikiEvent {
    text: string;
    year: number;
    pages?: Array<{
        title: string;
        extract: string;
        thumbnail?: {
            source: string;
        };
    }>;
}

interface OnThisDayData {
    events: WikiEvent[];
    births: WikiEvent[];
    deaths: WikiEvent[];
}

export default function OnThisDayWidget({ onClose }: OnThisDayWidgetProps) {
    const [language, setLanguage] = useState('pl');
    const [data, setData] = useState<OnThisDayData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<'events' | 'births' | 'deaths'>('events');

    const languageOptions = [
        { code: 'en', name: '🇬🇧 EN' },
        { code: 'pl', name: '🇵🇱 PL' },
        { code: 'de', name: '🇩🇪 DE' },
        { code: 'es', name: '🇪🇸 ES' },
        { code: 'fr', name: '🇫🇷 FR' }
    ];

    const categoryLabels = {
        events: { icon: '📅', label: 'Wydarzenia', description: 'Ważne wydarzenia' },
        births: { icon: '🎂', label: 'Urodziny', description: 'Narodziny sławnych' },
        deaths: { icon: '⚰️', label: 'Zgony', description: 'Śmierć znanych osób' }
    };

    useEffect(() => {
        fetchOnThisDay();
    }, [language]);

    const fetchOnThisDay = async () => {
        setLoading(true);
        setError(null);

        try {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');

            const url = `https://${language}.wikipedia.org/api/rest_v1/feed/onthisday/all/${month}/${day}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Nie udało się pobrać danych');

            const result = await response.json();
            setData({
                events: result.events || [],
                births: result.births || [],
                deaths: result.deaths || []
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Błąd połączenia');
        } finally {
            setLoading(false);
        }
    };

    const renderEvent = (event: WikiEvent, index: number) => (
        <div
            key={index}
            style={{
                padding: '12px',
                backgroundColor: '#1a1a1a',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                marginBottom: '8px',
                transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1e3a8a';
                e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a1a1a';
                e.currentTarget.style.transform = 'translateX(0)';
            }}
        >
            <div style={{ fontSize: '14px', color: '#60a5fa', fontWeight: 'bold', marginBottom: '4px' }}>
                {event.year}
            </div>
            <div style={{ fontSize: '13px', color: '#e5e7eb', lineHeight: '1.5' }}>
                {event.text}
            </div>
            {event.pages && event.pages[0] && (
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>
                    📖 {event.pages[0].title}
                </div>
            )}
        </div>
    );

    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '800px',
                height: '85vh',
                backgroundColor: '#0a0a0a',
                border: '2px solid #3b82f6',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10000,
                boxShadow: '0 0 40px rgba(59, 130, 246, 0.3)'
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: '16px',
                    backgroundColor: '#1a1a1a',
                    borderBottom: '2px solid #3b82f6',
                    borderRadius: '10px 10px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}
            >
                <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
                    📅 W tym dniu
                </h2>

                {/* Language Selector */}
                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        backgroundColor: '#0a0a0a',
                        color: '#3b82f6',
                        border: '2px solid #3b82f6',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    {languageOptions.map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                </select>

                {/* Refresh Button */}
                <button
                    onClick={fetchOnThisDay}
                    disabled={loading}
                    title="Odśwież dane"
                    style={{
                        padding: '10px 16px',
                        backgroundColor: '#0a0a0a',
                        color: '#3b82f6',
                        border: '2px solid #3b82f6',
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        minWidth: '80px',
                        opacity: loading ? 0.5 : 1
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) {
                            e.currentTarget.style.backgroundColor = '#1e3a8a';
                            e.currentTarget.style.transform = 'rotate(180deg)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0a0a0a';
                        e.currentTarget.style.transform = 'rotate(0deg)';
                    }}
                >
                    <span style={{ fontSize: '20px' }}>🔄</span>
                    <span style={{ fontSize: '11px' }}>Odśwież</span>
                </button>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    title="Zamknij widget"
                    style={{
                        marginLeft: 'auto',
                        padding: '8px 16px',
                        background: 'none',
                        border: '2px solid #ef4444',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontSize: '28px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        lineHeight: '1'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#7f1d1d';
                        e.currentTarget.style.transform = 'rotate(90deg)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'rotate(0deg)';
                    }}
                >
                    ×
                </button>
            </div>

            {/* Category Tabs */}
            <div
                style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '12px 16px',
                    backgroundColor: '#0a0a0a',
                    borderBottom: '1px solid #1a1a1a'
                }}
            >
                {(Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>).map((category) => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        title={categoryLabels[category].description}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            backgroundColor: selectedCategory === category ? '#3b82f6' : '#1a1a1a',
                            color: selectedCategory === category ? '#fff' : '#3b82f6',
                            border: '2px solid #3b82f6',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        onMouseEnter={(e) => {
                            if (selectedCategory !== category) {
                                e.currentTarget.style.backgroundColor = '#1e3a8a';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (selectedCategory !== category) {
                                e.currentTarget.style.backgroundColor = '#1a1a1a';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>{categoryLabels[category].icon}</span>
                        <span style={{ fontSize: '12px' }}>{categoryLabels[category].label}</span>
                        <span style={{ fontSize: '10px', opacity: 0.7 }}>
                            {categoryLabels[category].description}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div
                style={{
                    flex: 1,
                    padding: '16px',
                    overflowY: 'auto',
                    backgroundColor: '#0a0a0a'
                }}
            >
                {loading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#3b82f6', fontSize: '16px' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⏳</div>
                        Ładowanie danych...
                    </div>
                )}

                {error && (
                    <div
                        style={{
                            padding: '20px',
                            backgroundColor: '#7f1d1d',
                            border: '2px solid #ef4444',
                            borderRadius: '8px',
                            color: '#fca5a5',
                            textAlign: 'center'
                        }}
                    >
                        ❌ {error}
                    </div>
                )}

                {!loading && !error && data && (
                    <>
                        {data[selectedCategory].length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                                Brak danych dla tej kategorii
                            </div>
                        ) : (
                            <div>
                                <div style={{ marginBottom: '12px', color: '#60a5fa', fontSize: '14px', fontWeight: 'bold' }}>
                                    {categoryLabels[selectedCategory].icon} {data[selectedCategory].length} {categoryLabels[selectedCategory].label.toLowerCase()}
                                </div>
                                {data[selectedCategory].slice(0, 20).map((event, index) => renderEvent(event, index))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer */}
            <div
                style={{
                    padding: '12px 16px',
                    backgroundColor: '#1a1a1a',
                    borderTop: '2px solid #3b82f6',
                    borderRadius: '0 0 10px 10px',
                    fontSize: '11px',
                    color: '#6b7280',
                    textAlign: 'center'
                }}
            >
                Dane z Wikipedia • {new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })}
            </div>
        </div>
    );
}
