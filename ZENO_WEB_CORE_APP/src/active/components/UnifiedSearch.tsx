import React, { useState } from 'react';

interface UnifiedSearchProps {
    onSearch?: (results: any) => void;
}

interface SearchStats {
    cayd_count: number;
    tavily_count: number;
    total_count: number;
    response_time_ms: number;
}

interface DeduplicationStats {
    total_items: number;
    unique_items: number;
    duplicates_found: number;
    deduplication_rate: number;
    duplicate_groups?: any[];
}

interface UnifiedSearchResults {
    query: string;
    sources_used: string[];
    cayd_results?: any;
    tavily_results?: any;
    ai_analysis?: any;
    deduplication?: DeduplicationStats;
    stats: SearchStats;
}

export default function UnifiedSearch({ onSearch }: UnifiedSearchProps) {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<UnifiedSearchResults | null>(null);
    const [selectedSources, setSelectedSources] = useState({
        cayd: true,
        tavily: true,
        ai: false
    });
    const [showDuplicates, setShowDuplicates] = useState(false);
    const [highlightedGroup, setHighlightedGroup] = useState<number | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) return;

        setIsLoading(true);

        try {
            const sources = Object.entries(selectedSources)
                .filter(([_, enabled]) => enabled)
                .map(([source, _]) => source)
                .join(',');

            const response = await fetch(
                `/api/unified-search?query=${encodeURIComponent(query)}&sources=${sources}&limit=50`
            );

            if (!response.ok) {
                throw new Error(`Search failed: ${response.statusText}`);
            }

            const data = await response.json();
            setResults(data);

            if (onSearch) {
                onSearch(data);
            }

            // Fire custom event for Browser.tsx to handle
            window.dispatchEvent(new CustomEvent('unified-search-complete', {
                detail: data
            }));

        } catch (error) {
            console.error('Unified search error:', error);
            alert(`Search error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSource = (source: 'cayd' | 'tavily' | 'ai') => {
        setSelectedSources(prev => ({
            ...prev,
            [source]: !prev[source]
        }));
    };

    return (
        <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
            padding: '14px',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            marginBottom: '14px'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '10px' }}>
                <h2 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0',
                    letterSpacing: '0.5px'
                }}>
                    CAYD_UNI_field_sea_ARCH
                </h2>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter search query..."
                        disabled={isLoading}
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            fontSize: '13px',
                            background: 'rgba(15, 23, 42, 0.9)',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            borderRadius: '6px',
                            color: '#e2e8f0',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        style={{
                            padding: '8px 18px',
                            background: isLoading ? '#475569' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isLoading ? '🔄 Searching...' : '🚀 Search All'}
                    </button>
                </div>

                {/* Source Toggles */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    padding: '8px',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '6px'
                }}>
                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: selectedSources.cayd ? '#3b82f6' : '#64748b'
                    }}>
                        <input
                            type="checkbox"
                            checked={selectedSources.cayd}
                            onChange={() => toggleSource('cayd')}
                            disabled={isLoading}
                            style={{ cursor: 'pointer' }}
                        />
                        📚 CAYD Library
                    </label>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: selectedSources.tavily ? '#3b82f6' : '#64748b'
                    }}>
                        <input
                            type="checkbox"
                            checked={selectedSources.tavily}
                            onChange={() => toggleSource('tavily')}
                            disabled={isLoading}
                            style={{ cursor: 'pointer' }}
                        />
                        🌐 Web Search (Tavily)
                    </label>

                    <label style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: selectedSources.ai ? '#3b82f6' : '#64748b'
                    }}>
                        <input
                            type="checkbox"
                            checked={selectedSources.ai}
                            onChange={() => toggleSource('ai')}
                            disabled={isLoading}
                            style={{ cursor: 'pointer' }}
                        />
                        🔬 AI Enrichment (Gemini)
                    </label>
                </div>
            </form>

            {/* Results Display */}
            {results && (
                <div style={{
                    background: 'rgba(15, 23, 42, 0.7)',
                    padding: '12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                    {/* Stats Bar */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                        padding: '8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '4px',
                        fontSize: '11px',
                        flexWrap: 'wrap',
                        gap: '8px'
                    }}>
                        <div>
                            <strong style={{ color: '#3b82f6' }}>Query:</strong>{' '}
                            <span style={{ color: '#e2e8f0' }}>{results.query}</span>
                        </div>
                        <div>
                            <strong style={{ color: '#8b5cf6' }}>Total:</strong>{' '}
                            <span style={{ color: '#e2e8f0' }}>{results.stats.total_count} results</span>
                        </div>
                        <div>
                            <strong style={{ color: '#10b981' }}>Time:</strong>{' '}
                            <span style={{ color: '#e2e8f0' }}>{results.stats.response_time_ms}ms</span>
                        </div>

                        {/* Deduplication Stats */}
                        {results.deduplication && (
                            <div>
                                <strong style={{ color: '#f59e0b' }}>Unique:</strong>{' '}
                                <span style={{ color: '#e2e8f0' }}>
                                    {results.deduplication.unique_items}/{results.deduplication.total_items}
                                    {' '}({(results.deduplication.deduplication_rate * 100).toFixed(0)}% removed)
                                </span>
                            </div>
                        )}

                        {/* Deduplication Toggle */}
                        {results.deduplication?.duplicate_groups && results.deduplication.duplicate_groups.length > 0 && (
                            <button
                                onClick={() => setShowDuplicates(!showDuplicates)}
                                style={{
                                    padding: '3px 10px',
                                    background: showDuplicates ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
                                    border: '1px solid #f59e0b',
                                    borderRadius: '3px',
                                    color: '#fff',
                                    fontSize: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {showDuplicates ? '✓' : ''} Show Duplicates ({results.deduplication.duplicate_groups.length})
                            </button>
                        )}

                        {/* Save Button */}
                        {results.ai_analysis?.high_quality_items?.length > 0 && (
                            <button
                                onClick={async () => {
                                    try {
                                        const response = await fetch('/api/save-enriched', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                items: results.ai_analysis.enriched_items,
                                                query: results.query,
                                                min_quality_score: 7
                                            })
                                        });

                                        if (response.ok) {
                                            const data = await response.json();
                                            alert(`✅ Saved ${data.saved_count} items to library!\n\nAgents used: ${data.agents_used.join(', ')}`);
                                        } else {
                                            alert('❌ Failed to save items');
                                        }
                                    } catch (error) {
                                        console.error('Save error:', error);
                                        alert('❌ Error saving items');
                                    }
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '4px 12px',
                                    fontSize: '10px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                💾 Save Best
                            </button>
                        )}
                    </div>

                    {/* Results Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '10px'
                    }}>
                        {/* CAYD Results */}
                        {results.cayd_results && (
                            <div style={{
                                padding: '10px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                borderRadius: '6px',
                                border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                                <h3 style={{
                                    fontSize: '13px',
                                    color: '#3b82f6',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    📚 CAYD Library
                                    <span style={{
                                        fontSize: '10px',
                                        background: 'rgba(59, 130, 246, 0.2)',
                                        padding: '2px 6px',
                                        borderRadius: '3px'
                                    }}>
                                        {results.stats.cayd_count}
                                    </span>
                                </h3>
                                <div style={{
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    fontSize: '11px',
                                    color: '#cbd5e1'
                                }}>
                                    {results.cayd_results.error ? (
                                        <p style={{ color: '#f87171' }}>❌ {results.cayd_results.error}</p>
                                    ) : results.cayd_results.results?.length > 0 ? (
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {results.cayd_results.results.slice(0, 10).map((item: any, i: number) => (
                                                <li key={i} style={{
                                                    marginBottom: '8px',
                                                    padding: '8px',
                                                    background: 'rgba(15, 23, 42, 0.5)',
                                                    borderRadius: '4px'
                                                }}>
                                                    <div style={{ fontWeight: '600', color: '#e2e8f0' }}>
                                                        {item.name}
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                                        {item.path}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ color: '#64748b' }}>No results found</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tavily Results */}
                        {results.tavily_results && (
                            <div style={{
                                padding: '10px',
                                background: 'rgba(139, 92, 246, 0.1)',
                                borderRadius: '6px',
                                border: '1px solid rgba(139, 92, 246, 0.3)'
                            }}>
                                <h3 style={{
                                    fontSize: '13px',
                                    color: '#8b5cf6',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    🌐 Web Results
                                    <span style={{
                                        fontSize: '10px',
                                        background: 'rgba(139, 92, 246, 0.2)',
                                        padding: '2px 6px',
                                        borderRadius: '3px'
                                    }}>
                                        {results.stats.tavily_count}
                                    </span>
                                </h3>
                                <div style={{
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    fontSize: '11px',
                                    color: '#cbd5e1'
                                }}>
                                    {results.tavily_results.error ? (
                                        <p style={{ color: '#f87171' }}>❌ {results.tavily_results.error}</p>
                                    ) : results.tavily_results.results?.length > 0 ? (
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            {results.tavily_results.results.map((item: any, i: number) => (
                                                <li key={i} style={{
                                                    marginBottom: '8px',
                                                    padding: '8px',
                                                    background: 'rgba(15, 23, 42, 0.5)',
                                                    borderRadius: '4px'
                                                }}>
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            color: '#8b5cf6',
                                                            textDecoration: 'none',
                                                            fontWeight: '600'
                                                        }}
                                                    >
                                                        {item.title}
                                                    </a>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#94a3b8',
                                                        marginTop: '4px',
                                                        lineHeight: '1.4'
                                                    }}>
                                                        {item.content?.substring(0, 150)}...
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p style={{ color: '#64748b' }}>No results found</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* AI Enrichment Results */}
                        {results.ai_analysis && (
                            <div style={{
                                padding: '10px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '6px',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                gridColumn: selectedSources.cayd && selectedSources.tavily ? 'span 2' : 'span 1'
                            }}>
                                <h3 style={{
                                    fontSize: '13px',
                                    color: '#10b981',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}>
                                    🔬 AI Enrichment
                                    {results.ai_analysis.stats && (
                                        <span style={{
                                            fontSize: '10px',
                                            background: 'rgba(16, 185, 129, 0.2)',
                                            padding: '2px 6px',
                                            borderRadius: '3px'
                                        }}>
                                            {results.ai_analysis.stats.high_quality_count} high-quality
                                        </span>
                                    )}
                                </h3>
                                <div style={{
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    fontSize: '11px',
                                    color: '#cbd5e1'
                                }}>
                                    {results.ai_analysis.error ? (
                                        <p style={{ color: '#f87171' }}>❌ {results.ai_analysis.error}</p>
                                    ) : results.ai_analysis.stats ? (
                                        <div>
                                            {/* Stats Summary */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(2, 1fr)',
                                                gap: '12px',
                                                marginBottom: '16px',
                                                padding: '12px',
                                                background: 'rgba(15, 23, 42, 0.5)',
                                                borderRadius: '6px'
                                            }}>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        Avg Quality Score
                                                    </div>
                                                    <div style={{ fontSize: '20px', fontWeight: '600', color: '#10b981' }}>
                                                        {results.ai_analysis.stats.avg_quality_score}/10
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                                        Avg Relevance
                                                    </div>
                                                    <div style={{ fontSize: '20px', fontWeight: '600', color: '#3b82f6' }}>
                                                        {results.ai_analysis.stats.avg_relevance_score}/10
                                                    </div>
                                                </div>
                                            </div>

                                            {/* High Quality Items */}
                                            {results.ai_analysis.high_quality_items?.length > 0 && (
                                                <div>
                                                    <h4 style={{
                                                        fontSize: '14px',
                                                        color: '#10b981',
                                                        marginBottom: '12px'
                                                    }}>
                                                        🌟 High Quality Results (Score ≥ 7)
                                                    </h4>
                                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                                        {results.ai_analysis.high_quality_items.map((item: any, i: number) => (
                                                            <li key={i} style={{
                                                                marginBottom: '12px',
                                                                padding: '12px',
                                                                background: 'rgba(15, 23, 42, 0.5)',
                                                                borderRadius: '6px',
                                                                borderLeft: `3px solid ${item.enrichment.quality_score >= 9 ? '#10b981' :
                                                                    item.enrichment.quality_score >= 8 ? '#3b82f6' :
                                                                        '#f59e0b'
                                                                    }`
                                                            }}>
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    marginBottom: '8px'
                                                                }}>
                                                                    <div style={{ fontWeight: '600', color: '#e2e8f0' }}>
                                                                        {item.original.title || item.original.name}
                                                                    </div>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        gap: '8px',
                                                                        fontSize: '11px'
                                                                    }}>
                                                                        <span style={{
                                                                            background: 'rgba(16, 185, 129, 0.2)',
                                                                            padding: '2px 6px',
                                                                            borderRadius: '3px',
                                                                            color: '#10b981'
                                                                        }}>
                                                                            Q: {item.enrichment.quality_score}
                                                                        </span>
                                                                        <span style={{
                                                                            background: 'rgba(59, 130, 246, 0.2)',
                                                                            padding: '2px 6px',
                                                                            borderRadius: '3px',
                                                                            color: '#3b82f6'
                                                                        }}>
                                                                            R: {item.enrichment.relevance_score}
                                                                        </span>
                                                                    </div>
                                                                </div>

                                                                <div style={{
                                                                    fontSize: '12px',
                                                                    color: '#94a3b8',
                                                                    marginBottom: '8px',
                                                                    fontStyle: 'italic'
                                                                }}>
                                                                    {item.enrichment.summary}
                                                                </div>

                                                                <div style={{
                                                                    display: 'flex',
                                                                    gap: '6px',
                                                                    flexWrap: 'wrap',
                                                                    marginBottom: '8px'
                                                                }}>
                                                                    {item.enrichment.tags.map((tag: string, j: number) => (
                                                                        <span key={j} style={{
                                                                            fontSize: '10px',
                                                                            background: 'rgba(59, 130, 246, 0.2)',
                                                                            color: '#60a5fa',
                                                                            padding: '2px 8px',
                                                                            borderRadius: '12px'
                                                                        }}>
                                                                            #{tag}
                                                                        </span>
                                                                    ))}
                                                                </div>

                                                                <div style={{
                                                                    fontSize: '11px',
                                                                    color: '#64748b',
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between'
                                                                }}>
                                                                    <span>📁 {item.enrichment.category}</span>
                                                                    <span>🤖 {item.enrichment.recommended_agent}</span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={{ color: '#64748b' }}>
                                            {results.ai_analysis.message || 'No enrichment available'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Duplicate Detection Panel */}
                        {showDuplicates && results.deduplication?.duplicate_groups && results.deduplication.duplicate_groups.length > 0 && (
                            <div style={{
                                marginTop: '12px',
                                padding: '10px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                border: '1px solid rgba(245, 158, 11, 0.3)',
                                borderRadius: '6px'
                            }}>
                                <h3 style={{
                                    margin: '0 0 8px 0',
                                    color: '#f59e0b',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                }}>
                                    🔍 Duplicate Groups ({results.deduplication.duplicate_groups.length})
                                </h3>

                                {results.deduplication.duplicate_groups.map((group: any, groupIndex: number) => (
                                    <div
                                        key={groupIndex}
                                        style={{
                                            marginBottom: '10px',
                                            padding: '10px',
                                            background: highlightedGroup === groupIndex
                                                ? 'rgba(245, 158, 11, 0.2)'
                                                : 'rgba(30, 41, 59, 0.5)',
                                            border: highlightedGroup === groupIndex
                                                ? '2px solid #f59e0b'
                                                : '1px solid rgba(71, 85, 105, 0.5)',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => setHighlightedGroup(highlightedGroup === groupIndex ? null : groupIndex)}
                                    >
                                        {/* Representative Item */}
                                        <div style={{
                                            marginBottom: '8px',
                                            paddingBottom: '12px',
                                            borderBottom: '1px solid rgba(71, 85, 105, 0.5)'
                                        }}>
                                            <div style={{
                                                fontSize: '11px',
                                                color: '#f59e0b',
                                                marginBottom: '6px',
                                                fontWeight: '600'
                                            }}>
                                                ⭐ BEST MATCH (from {group.representative.source?.toUpperCase()})
                                            </div>
                                            <div style={{
                                                fontSize: '14px',
                                                fontWeight: '500',
                                                color: '#e2e8f0',
                                                marginBottom: '4px'
                                            }}>
                                                {group.representative.title || group.representative.original_title}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                color: '#94a3b8',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {group.representative.content || group.representative.original_content || group.representative.excerpt || 'No content'}
                                            </div>
                                            {group.representative.enrichment && (
                                                <div style={{
                                                    marginTop: '6px',
                                                    display: 'flex',
                                                    gap: '8px',
                                                    fontSize: '11px'
                                                }}>
                                                    <span style={{
                                                        background: 'rgba(16, 185, 129, 0.2)',
                                                        padding: '2px 6px',
                                                        borderRadius: '3px',
                                                        color: '#10b981'
                                                    }}>
                                                        Quality: {group.representative.enrichment.quality_score}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Duplicate Items */}
                                        <div style={{
                                            fontSize: '11px',
                                            color: '#64748b',
                                            marginBottom: '8px'
                                        }}>
                                            Found {group.duplicates.length} similar item(s):
                                        </div>

                                        {group.duplicates.map((dup: any, dupIndex: number) => (
                                            <div
                                                key={dupIndex}
                                                style={{
                                                    padding: '8px',
                                                    marginBottom: '6px',
                                                    background: 'rgba(71, 85, 105, 0.3)',
                                                    border: '1px solid rgba(71, 85, 105, 0.5)',
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'start',
                                                    marginBottom: '4px'
                                                }}>
                                                    <div style={{
                                                        fontSize: '12px',
                                                        color: '#cbd5e1',
                                                        flex: 1
                                                    }}>
                                                        {dup.title || dup.original_title}
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        gap: '6px',
                                                        alignItems: 'center',
                                                        marginLeft: '8px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: '10px',
                                                            background: 'rgba(245, 158, 11, 0.2)',
                                                            padding: '2px 6px',
                                                            borderRadius: '3px',
                                                            color: '#fbbf24'
                                                        }}>
                                                            {((group.similarity_scores?.[dupIndex] || 0) * 100).toFixed(0)}% similar
                                                        </span>
                                                        <span style={{
                                                            fontSize: '10px',
                                                            background: dup.source === 'cayd'
                                                                ? 'rgba(59, 130, 246, 0.2)'
                                                                : 'rgba(139, 92, 246, 0.2)',
                                                            padding: '2px 6px',
                                                            borderRadius: '3px',
                                                            color: dup.source === 'cayd' ? '#60a5fa' : '#a78bfa'
                                                        }}>
                                                            {dup.source?.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{
                                                    fontSize: '11px',
                                                    color: '#64748b',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {dup.content || dup.original_content || dup.excerpt || 'No content'}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}

                                <div style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    background: 'rgba(30, 41, 59, 0.5)',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    color: '#94a3b8'
                                }}>
                                    💡 <strong>Tip:</strong> Click on a group to highlight it. Duplicates are automatically removed from results.
                                    The best match is selected based on enrichment quality, then source preference (Tavily &gt; CAYD).
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
