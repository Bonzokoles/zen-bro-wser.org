import React, { useState } from 'react';

interface WikipediaWidgetProps {
    onClose: () => void;
}

const WikipediaWidget: React.FC<WikipediaWidgetProps> = ({ onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUrl, setCurrentUrl] = useState('https://pl.wikipedia.org/wiki/Strona_g%C5%82%C3%B3wna');
    const [language, setLanguage] = useState<'pl' | 'en' | 'de' | 'es' | 'fr'>('pl');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const encodedQuery = encodeURIComponent(searchQuery);
            setCurrentUrl(`https://${language}.wikipedia.org/wiki/${encodedQuery}`);
        }
    };

    const goToRandomArticle = () => {
        setCurrentUrl(`https://${language}.wikipedia.org/wiki/Special:Random`);
    };

    const goToMainPage = () => {
        const mainPages = {
            pl: 'https://pl.wikipedia.org/wiki/Strona_g%C5%82%C3%B3wna',
            en: 'https://en.wikipedia.org/wiki/Main_Page',
            de: 'https://de.wikipedia.org/wiki/Wikipedia:Hauptseite',
            es: 'https://es.wikipedia.org/wiki/Wikipedia:Portada',
            fr: 'https://fr.wikipedia.org/wiki/Wikip%C3%A9dia:Accueil_principal'
        };
        setCurrentUrl(mainPages[language]);
    };

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '1200px',
            height: '90%',
            backgroundColor: '#1a1a1a',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000,
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #3b82f6',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#0a0a0a',
                flexWrap: 'wrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                        src="/assets/objects/RELOGIOS/35.png"
                        alt="Wiki"
                        style={{ width: '24px', height: '24px' }}
                    />
                    <h3 style={{ margin: 0, color: '#3b82f6', fontSize: '16px' }}>Wikipedia</h3>
                </div>

                {/* Language Selector */}
                <select
                    value={language}
                    onChange={(e) => {
                        setLanguage(e.target.value as any);
                        goToMainPage();
                    }}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#0a0a0a',
                        color: '#3b82f6',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}
                >
                    <option value="pl">🇵🇱 Polski</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="de">🇩🇪 Deutsch</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="fr">🇫🇷 Français</option>
                </select>

                {/* Search Form */}
                <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', gap: '8px', minWidth: '250px' }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Szukaj artykułów..."
                        style={{
                            flex: 1,
                            padding: '10px 16px',
                            backgroundColor: '#1a1a1a',
                            color: '#fff',
                            border: '1px solid #3b82f6',
                            borderRadius: '8px',
                            fontSize: '14px',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        title="Szukaj w Wikipedii"
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                    >
                        🔍 <span style={{ fontSize: '12px' }}>Szukaj</span>
                    </button>
                </form>

                {/* Action Buttons */}
                <button
                    onClick={goToRandomArticle}
                    title="Losowy artykuł - odkryj coś nowego"
                    style={{
                        padding: '10px 16px',
                        backgroundColor: '#0a0a0a',
                        color: '#3b82f6',
                        border: '2px solid #3b82f6',
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
                        e.currentTarget.style.backgroundColor = '#1e3a8a';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0a0a0a';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <span style={{ fontSize: '20px' }}>🎲</span>
                    <span style={{ fontSize: '11px' }}>Losowy</span>
                </button>

                <button
                    onClick={goToMainPage}
                    title="Strona główna Wikipedii"
                    style={{
                        padding: '10px 16px',
                        backgroundColor: '#0a0a0a',
                        color: '#3b82f6',
                        border: '2px solid #3b82f6',
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
                        e.currentTarget.style.backgroundColor = '#1e3a8a';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#0a0a0a';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <span style={{ fontSize: '20px' }}>🏠</span>
                    <span style={{ fontSize: '11px' }}>Główna</span>
                </button>

                <button
                    onClick={onClose}
                    title="Zamknij Wikipedia"
                    style={{
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

            {/* Wikipedia Iframe */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <iframe
                    src={currentUrl}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        backgroundColor: '#fff'
                    }}
                    title="Wikipedia"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
            </div>

            {/* Footer Info */}
            <div style={{
                padding: '8px 16px',
                borderTop: '1px solid #3b82f6',
                backgroundColor: '#0a0a0a',
                fontSize: '11px',
                color: '#666',
                textAlign: 'center'
            }}>
                📚 Wikipedia - wolna encyklopedia | Tłumaczenie automatyczne w ZENO Browser
            </div>
        </div>
    );
};

export default WikipediaWidget;
