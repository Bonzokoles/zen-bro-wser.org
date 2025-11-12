import { useState, useEffect } from 'react';
import io from 'socket.io-client';

interface TreeNode {
    type: 'folder' | 'file';
    name: string;
    path?: string;
    children?: TreeNode[];
}

interface CatalogBrowserProps {
    apiUrl?: string;
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
                color: '#0066cc',
            }}
            onClick={() => node.path && onFileSelect(node.path)}
        >
            📄 {node.name}
        </div>
    );
}

export default function CatalogBrowser({ apiUrl = 'http://localhost:3333' }: CatalogBrowserProps) {
    const [tree, setTree] = useState<TreeNode[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [fileContent, setFileContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [lastUpdate, setLastUpdate] = useState<string>('');

    // STEP_06: WebSocket connection
    useEffect(() => {
        const socket = io(apiUrl);

        socket.on('connect', () => {
            console.log('✅ Connected to WebSocket');
        });

        socket.on('fileChanged', (data: { type: string; path: string; timestamp: number }) => {
            console.log('🔔 File changed:', data);
            setLastUpdate(`${data.type}: ${data.path}`);

            // Auto-refresh tree on any file change
            fetchTree();

            // If currently viewing the changed file, reload its content
            if (selectedFile === data.path && data.type !== 'unlink') {
                fetchFileContent(data.path);
            }
        });

        socket.on('disconnect', () => {
            console.log('❌ Disconnected from WebSocket');
        });

        return () => {
            socket.disconnect();
        };
    }, [apiUrl, selectedFile]);

    useEffect(() => {
        fetchTree();
    }, []);

    useEffect(() => {
        if (selectedFile) {
            fetchFileContent(selectedFile);
        }
    }, [selectedFile]);

    const fetchTree = async () => {
        try {
            const response = await fetch(`${apiUrl}/api/catalogTree`);
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
            const response = await fetch(`${apiUrl}/api/fileContent?path=${encodeURIComponent(path)}`);
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
            const response = await fetch(`${apiUrl}/api/saveMetadata`, {
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
                setError(''); // Clear error
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

    return (
        <div style={{ display: 'flex', height: '90vh', gap: '10px' }}>
            {/* Left panel - Tree */}
            <div
                style={{
                    width: '40%',
                    overflowY: 'auto',
                    padding: '10px',
                    borderRight: '2px solid #ccc',
                    backgroundColor: '#f5f5f5',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>📚 Katalog LIBRARIES</h3>
                    {lastUpdate && (
                        <span style={{ fontSize: '12px', color: '#28a745', fontWeight: 'bold' }}>
                            🔄 {lastUpdate}
                        </span>
                    )}
                </div>
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
            </div>

            {/* Right panel - Editor */}
            <div style={{ width: '60%', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                {selectedFile ? (
                    <>
                        <h3>📝 Edytujesz: {selectedFile}</h3>
                        <textarea
                            value={fileContent}
                            onChange={(e) => setFileContent(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '10px',
                                fontSize: '14px',
                                fontFamily: 'monospace',
                                border: '1px solid #ccc',
                                borderRadius: '4px',
                                resize: 'none',
                            }}
                            disabled={isLoading}
                        />
                        <button
                            onClick={saveContent}
                            disabled={isLoading}
                            style={{
                                marginTop: '10px',
                                padding: '10px 20px',
                                fontSize: '16px',
                                backgroundColor: isLoading ? '#ccc' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {isLoading ? '⏳ Zapisywanie...' : '💾 Zapisz'}
                        </button>
                        {error && (
                            <div style={{ marginTop: '10px', color: '#dc3545', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '4px' }}>
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
    );
}
