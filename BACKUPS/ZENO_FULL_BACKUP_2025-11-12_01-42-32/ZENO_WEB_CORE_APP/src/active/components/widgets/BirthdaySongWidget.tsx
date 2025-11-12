import React, { useState } from 'react';

interface BirthdaySongWidgetProps {
    onClose: () => void;
}

export default function BirthdaySongWidget({ onClose }: BirthdaySongWidgetProps) {
    const [birthDate, setBirthDate] = useState('');
    const [showIframe, setShowIframe] = useState(false);
    const [iframeUrl, setIframeUrl] = useState('https://playback.fm/birthday-song');

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBirthDate(e.target.value);
    };

    const handleFindSong = () => {
        if (birthDate) {
            // Konstruuj URL z datą (playback.fm może akceptować query params)
            const url = `https://playback.fm/birthday-song?date=${birthDate}`;
            setIframeUrl(url);
            setShowIframe(true);
        } else {
            // Bez daty - otwórz główną stronę
            setIframeUrl('https://playback.fm/birthday-song');
            setShowIframe(true);
        }
    };

    const handleReset = () => {
        setShowIframe(false);
        setBirthDate('');
        setIframeUrl('https://playback.fm/birthday-song');
    };

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '1000px',
                height: '85vh',
                backgroundColor: '#0a0a0a',
                border: '2px solid #ec4899',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10000,
                boxShadow: '0 0 40px rgba(236, 72, 153, 0.3)'
            }}
        >
            {/* Header */}
            <div
                style={{
                    padding: '16px',
                    backgroundColor: '#1a1a1a',
                    borderBottom: '2px solid #ec4899',
                    borderRadius: '10px 10px 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexWrap: 'wrap'
                }}
            >
                <h2 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🎵 Piosenka z Twoich Urodzin
                </h2>

                {/* Date Input */}
                {!showIframe && (
                    <>
                        <input
                            type="date"
                            value={birthDate}
                            onChange={handleDateChange}
                            max={getTodayDate()}
                            style={{
                                padding: '10px 16px',
                                backgroundColor: '#0a0a0a',
                                color: '#ec4899',
                                border: '2px solid #ec4899',
                                borderRadius: '8px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                minWidth: '180px'
                            }}
                        />

                        {/* Find Song Button */}
                        <button
                            onClick={handleFindSong}
                            title="Znajdź piosenkę z wybranej daty"
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#ec4899',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#db2777';
                                e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#ec4899';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}
                        >
                            🔍 <span style={{ fontSize: '14px' }}>Znajdź Piosenkę</span>
                        </button>
                    </>
                )}

                {/* Reset Button */}
                {showIframe && (
                    <button
                        onClick={handleReset}
                        title="Wybierz inną datę"
                        style={{
                            padding: '10px 16px',
                            backgroundColor: '#0a0a0a',
                            color: '#ec4899',
                            border: '2px solid #ec4899',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            minWidth: '90px'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#831843';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#0a0a0a';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>🔄</span>
                        <span style={{ fontSize: '11px' }}>Zmień datę</span>
                    </button>
                )}

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

            {/* Content */}
            <div
                style={{
                    flex: 1,
                    padding: showIframe ? '0' : '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {!showIframe ? (
                    <div style={{ textAlign: 'center', maxWidth: '600px' }}>
                        <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎂</div>

                        <h3 style={{ color: '#ec4899', fontSize: '24px', marginBottom: '16px', fontWeight: 'bold' }}>
                            Odkryj Piosenkę z Dnia Twoich Urodzin!
                        </h3>

                        <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                            Wybierz swoją datę urodzin, aby dowiedzieć się, jaka piosenka była numerem 1
                            na listach przebojów w dniu, w którym się urodziłeś/aś. 🎵
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                                marginTop: '32px'
                            }}
                        >
                            {/* Quick Action Buttons */}
                            <button
                                onClick={() => {
                                    setBirthDate(getTodayDate());
                                }}
                                title="Wybierz dzisiejszą datę"
                                style={{
                                    padding: '16px',
                                    backgroundColor: '#1a1a1a',
                                    color: '#ec4899',
                                    border: '2px solid #ec4899',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#831843';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(236, 72, 153, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <span style={{ fontSize: '32px' }}>📅</span>
                                <span>Dzisiaj</span>
                                <span style={{ fontSize: '11px', opacity: 0.7 }}>Wybierz bieżącą datę</span>
                            </button>

                            <button
                                onClick={() => {
                                    setIframeUrl('https://playback.fm/birthday-song');
                                    setShowIframe(true);
                                }}
                                title="Otwórz stronę bez wyboru daty"
                                style={{
                                    padding: '16px',
                                    backgroundColor: '#1a1a1a',
                                    color: '#ec4899',
                                    border: '2px solid #ec4899',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#831843';
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(236, 72, 153, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#1a1a1a';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <span style={{ fontSize: '32px' }}>🎵</span>
                                <span>Przeglądaj</span>
                                <span style={{ fontSize: '11px', opacity: 0.7 }}>Otwórz playback.fm</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <iframe
                        src={iframeUrl}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            borderRadius: '0 0 10px 10px'
                        }}
                        title="Birthday Song Player"
                        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                    />
                )}
            </div>

            {/* Footer */}
            <div
                style={{
                    padding: '12px 16px',
                    backgroundColor: '#1a1a1a',
                    borderTop: '2px solid #ec4899',
                    borderRadius: '0 0 10px 10px',
                    fontSize: '11px',
                    color: '#6b7280',
                    textAlign: 'center'
                }}
            >
                Powered by playback.fm • Odkryj muzykę z przeszłości 🎶
            </div>
        </div>
    );
}
