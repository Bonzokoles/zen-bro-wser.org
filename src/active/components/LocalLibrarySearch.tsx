import React, { useState, useEffect } from 'react';

interface Material {
    title: string;
    description: string;
    url: string;
    category: string;
    tags: string[];
    quality_score: number;
    relevance: number;
    collected_by: string;
    collected_at: string;
    file_path: string;
    source: string;
    keywords?: string[];
    language?: string;
}

interface SearchResponse {
    results: Material[];
    results_count: number;
}

interface LocalLibrarySearchProps {
    query?: string;
}

export default function LocalLibrarySearch({ query = '' }: LocalLibrarySearchProps) {
    const [results, setResults] = useState<Material[]>([]);
    const [loading, setLoading] = useState(false);
    const [serverOnline, setServerOnline] = useState<boolean | null>(null);
    const [searchQuery, setSearchQuery] = useState(query);
    const [totalResults, setTotalResults] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [minQuality, setMinQuality] = useState(0);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    useEffect(() => {
        // Check if JIMBO server is running (port 6040 = main Library API)
        const checkServer = async () => {
            try {
                const response = await fetch('http://localhost:6040/stats');
                setServerOnline(response.ok);
            } catch (error) {
                console.error('❌ JIMBO Library API not reachable:', error);
                setServerOnline(false);
            }
        };

        checkServer();
    }, []);

    useEffect(() => {
        if (serverOnline && query) {
            performSearch(query);
        }
    }, [serverOnline, query]);

    const performSearch = async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            let url = `http://localhost:6040/search?q=${encodeURIComponent(q)}`;
            if (selectedCategory !== 'all') {
                url += `&category=${encodeURIComponent(selectedCategory)}`;
            }
            if (minQuality > 0) {
                url += `&min_quality=${minQuality}`;
            }

            const response = await fetch(url);
            const data: SearchResponse = await response.json();
            setResults(data.results || []);
            setTotalResults(data.results_count || 0);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    }; if (serverOnline === false) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    padding: '2rem',
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        maxWidth: '600px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '2px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '16px',
                        padding: '2rem',
                    }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
                    <h2
                        style={{
                            color: '#ef4444',
                            fontSize: '1.8rem',
                            fontWeight: '700',
                            marginBottom: '1rem',
                        }}
                    >
                        JIMBO Library Server Offline
                    </h2>
                    <p
                        style={{
                            color: '#94a3b8',
                            fontSize: '1.1rem',
                            marginBottom: '1.5rem',
                            lineHeight: '1.6',
                        }}
                    >
                        Nie można połączyć się z głównym API bibliotek JIMBO na porcie 6040.
                    </p>
                    <div
                        style={{
                            background: 'rgba(15, 23, 42, 0.8)',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            textAlign: 'left',
                        }}
                    >
                        <p
                            style={{
                                color: '#60a5fa',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                            }}
                        >
                            💡 Aby uruchomić serwer:
                        </p>
                        <code
                            style={{
                                display: 'block',
                                color: '#10b981',
                                fontSize: '0.9rem',
                                fontFamily: 'monospace',
                                whiteSpace: 'pre',
                            }}
                        >
                            {`cd U:\\JIMBO_INC_CONTROL_CENTER\\backend
python library_server.py`}
                        </code>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6, #1e40af)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 24px',
                            color: 'white',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.transform = 'scale(1.05)')
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = 'scale(1)')
                        }
                    >
                        🔄 Sprawdź ponownie
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                background: '#0f172a',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                    borderBottom: '2px solid rgba(16, 185, 129, 0.3)',
                    padding: '12px 20px',
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>📚</span>
                    <div>
                        <h3
                            style={{
                                color: '#10b981',
                                fontSize: '1.2rem',
                                fontWeight: '700',
                                margin: 0,
                            }}
                        >
                            JIMBO Library System
                        </h3>
                        <p
                            style={{
                                color: '#64748b',
                                fontSize: '0.85rem',
                                margin: 0,
                            }}
                        >
                            localhost:6040 {query && `• Searching: "${query}"`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIframeLoaded(false)}
                    style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        color: '#60a5fa',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                    }}
                >
                    🔄 Reload
                </button>
            </div>

            {/* Loading Overlay */}
            {!iframeLoaded && (
                <div
                    style={{
                        position: 'absolute',
                        top: '60px',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(15, 23, 42, 0.95)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 99,
                    }}
                >
                    <div style={{ textAlign: 'center' }}>
                        <div
                            style={{
                                width: '48px',
                                height: '48px',
                                border: '4px solid rgba(16, 185, 129, 0.2)',
                                borderTopColor: '#10b981',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 1rem',
                            }}
                        />
                        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
                            Loading JIMBO Libraries...
                        </p>
                    </div>
                </div>
            )}

            {/* Iframe */}
            <iframe
                src={`http://localhost:6040${query ? `/search?q=${encodeURIComponent(query)}` : ''}`}
                title="JIMBO Library System"
                onLoad={() => setIframeLoaded(true)}
                style={{
                    position: 'absolute',
                    top: '60px',
                    left: 0,
                    width: '100%',
                    height: 'calc(100% - 60px)',
                    border: 'none',
                    background: 'white',
                }}
            />

            <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </div>
    );
}
