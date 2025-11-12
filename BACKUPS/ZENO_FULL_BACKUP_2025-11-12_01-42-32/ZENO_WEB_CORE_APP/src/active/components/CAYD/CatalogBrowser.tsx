import { useState, useEffect } from 'react';

interface TreeNode {
    type: 'folder' | 'file';
    name: string;
    path?: string;
    children?: TreeNode[];
}

interface CatalogBrowserProps {
    apiUrl?: string;
    searchResults?: SearchResult[];
}

interface SearchResult {
    name: string;
    path: string;
    type: string;
    context: string;
    matchInName: boolean;
}

function TreeNodeComponent({ node, onFileSelect, level = 0 }: { node: TreeNode; onFileSelect: (path: string) => void; level?: number }) {
    const [isOpen, setIsOpen] = useState(false);

    if (node.type === 'folder') {
        return (
            <div style={{ marginLeft: level * 20 }}>
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        padding: '4px 0',
                        userSelect: 'none',
                    }}
                >
                    {isOpen ? '📂' : '📁'} {node.name}
                </div>
                {isOpen && node.children && (
                    <div>
                        {node.children.map((child, idx) => (
                            <TreeNodeComponent
                                key={`${child.name}-${idx}`}
                                node={child}
                                onFileSelect={onFileSelect}
                                level={level + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div
            style={{
                marginLeft: (level + 1) * 20,
                cursor: 'pointer',
                padding: '4px 0',
                color: '#60a5fa',
            }}
            onClick={() => node.path && onFileSelect(node.path)}
        >
            📄 {node.name}
        </div>
    );
}

export default function CatalogBrowser({ apiUrl = '', searchResults }: CatalogBrowserProps) {
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [localSearchResults, setLocalSearchResults] = useState<SearchResult[]>([]);

    useEffect(() => {
        fetchTree();
    }, []);

    useEffect(() => {
        if (selectedFile) {
            fetchFileContent(selectedFile);
        }
    }, [selectedFile]);

    useEffect(() => {
        if (searchResults && searchResults.length > 0) {
            setLocalSearchResults(searchResults);
        }
    }, [searchResults]);

    const fetchTree = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/cayd/catalogTree`);
            const data = await response.json();
            setTree(data);
        } catch (err) {
            setError(`Błąd pobierania drzewa: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
    };

    const fetchFileContent = async (path: string) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${apiUrl}/api/cayd/fileContent?path=${encodeURIComponent(path)}`);
            const data = await response.json();

            if (response.ok) {
                setFileContent(data.content);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError(`Błąd pobierania pliku: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const saveContent = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch(`${apiUrl}/api/cayd/saveMetadata`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    relativePath: selectedFile,
                    content: fileContent,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setError('');
                alert('✅ Zapisano pomyślnie!');
            } else {
                setError(`Błąd zapisu: ${data.error}`);
            }
        } catch (err) {
            setError(`Błąd zapisu: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setLocalSearchResults([]);
            return;
        }

        setIsSearching(true);
        setError('');

        try {
            const response = await fetch(`${apiUrl}/api/cayd/search?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();

            if (response.ok) {
                setLocalSearchResults(data.results || []);
            } else {
                setError(`Błąd wyszukiwania: ${data.error}`);
            }
        } catch (err) {
            setError(`Błąd wyszukiwania: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div style={{ display: 'flex', height: '90vh', gap: '10px', flexDirection: 'column' }}>
            {/* Search Bar */}
            <div style={{ padding: '10px', backgroundColor: '#000', border: '1px solid #fbbf24' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="🔍 Szukaj w bibliotece..."
                        style={{
                            flex: 1,
                            padding: '8px 12px',
                            fontSize: '14px',
                            backgroundColor: '#1a1a1a',
                            border: '1px solid #fbbf24',
                            borderRadius: '0',
                            color: '#fbbf24',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isSearching}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)';
                            e.currentTarget.style.boxShadow = '0 0 10px rgba(251, 191, 36, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                        style={{
                            padding: '8px 16px',
                            fontSize: '14px',
                            backgroundColor: 'transparent',
                            border: '1px solid #fbbf24',
                            borderRadius: '0',
                            color: '#fbbf24',
                            cursor: isSearching ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {isSearching ? '⏳' : '🔍'} Szukaj
                    </button>
                    {localSearchResults.length > 0 && (
                        <button
                            onClick={() => {
                                setLocalSearchResults([]);
                                setSearchQuery('');
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(251, 191, 36, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                            }}
                            style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                backgroundColor: 'transparent',
                                border: '1px solid #fbbf24',
                                borderRadius: '0',
                                color: '#fbbf24',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            ✕ Wyczyść
                        </button>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, gap: '10px' }}>
                {/* Left panel - Tree or Search Results */}
                <div
                    style={{
                        width: '40%',
                        overflowY: 'auto',
                        padding: '10px',
                        border: '1px solid #fbbf24',
                        backgroundColor: '#000',
                        color: '#fff',
                    }}
                >
                    {localSearchResults.length > 0 ? (
                        <>
                            <h3 style={{ color: '#fbbf24' }}>🔍 Wyniki wyszukiwania ({localSearchResults.length})</h3>
                            {localSearchResults.map((result, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedFile(result.path)}
                                    style={{
                                        padding: '8px',
                                        margin: '4px 0',
                                        cursor: 'pointer',
                                        backgroundColor: selectedFile === result.path ? '#fbbf2420' : '#1a1a1a',
                                        border: '1px solid #fbbf2440',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fbbf2430';
                                        e.currentTarget.style.borderColor = '#fbbf24';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedFile !== result.path) {
                                            e.currentTarget.style.backgroundColor = '#1a1a1a';
                                            e.currentTarget.style.borderColor = '#fbbf2440';
                                        }
                                    }}
                                >
                                    <div style={{
                                        color: result.matchInName ? '#fbbf24' : '#60a5fa',
                                        fontWeight: result.matchInName ? 'bold' : 'normal',
                                        marginBottom: '4px'
                                    }}>
                                        {result.matchInName ? '⭐ ' : '📄 '}{result.name}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#888', marginBottom: '2px' }}>
                                        {result.path}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>
                                        ...{result.context}...
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        <>
                            <h3 style={{ color: '#fbbf24' }}>📚 Katalog LIBRARIES</h3>
                            {tree.length > 0 ? (
                                tree.map((node, idx) => (
                                    <TreeNodeComponent
                                        key={`${node.name}-${idx}`}
                                        node={node}
                                        onFileSelect={setSelectedFile}
                                    />
                                ))
                            ) : (
                                <p style={{ color: '#666' }}>Brak plików w bibliotece</p>
                            )}
                        </>
                    )}
                </div>

                {/* Right panel - Editor */}
                <div style={{ width: '60%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                    {selectedFile ? (
                        <>
                            <h3 style={{ color: '#fbbf24' }}>📝 Edytujesz: {selectedFile}</h3>
                            <textarea
                                value={fileContent}
                                onChange={(e) => setFileContent(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    fontSize: '14px',
                                    fontFamily: 'monospace',
                                    backgroundColor: '#000',
                                    color: '#fff',
                                    border: '1px solid #fbbf24',
                                    borderRadius: '0',
                                    resize: 'none',
                                }}
                                disabled={isLoading}
                            />
                            <button
                                onClick={saveContent}
                                disabled={isLoading}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.background = 'rgba(251, 191, 36, 0.3)';
                                        e.currentTarget.style.boxShadow = '0 0 10px rgba(251, 191, 36, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = isLoading ? '#666' : 'transparent';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                style={{
                                    marginTop: '10px',
                                    padding: '10px 20px',
                                    fontSize: '16px',
                                    backgroundColor: isLoading ? '#666' : 'transparent',
                                    color: isLoading ? '#999' : '#fbbf24',
                                    border: '1px solid #fbbf24',
                                    borderRadius: '0',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    fontWeight: 'bold',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {isLoading ? '⏳ Zapisywanie...' : '💾 Zapisz'}
                            </button>
                            {error && (
                                <div style={{ marginTop: '10px', color: '#dc3545', padding: '10px', backgroundColor: '#f8d7da', border: '1px solid #dc3545', borderRadius: '0' }}>
                                    {error}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#999' }}>
                            <p>← Wybierz plik z lewego panelu do edycji</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
