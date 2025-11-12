import { useState, type FormEvent } from 'react';

interface MetadataEditorProps {
    apiUrl?: string;
}

export default function MetadataEditor({ apiUrl = '' }: MetadataEditorProps) {
    const [filePath, setFilePath] = useState('');
    const [content, setContent] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const saveFile = async (e: FormEvent) => {
        e.preventDefault();

        if (!filePath || !content) {
            setMessage('⚠️ Proszę podać ścieżkę i zawartość');
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch(`${apiUrl}/api/cayd/saveMetadata`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    relativePath: filePath,
                    content: content,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ Plik zapisany: ${data.path}`);
                setFilePath('');
                setContent('');
            } else {
                setMessage(`❌ Błąd: ${data.error}`);
            }
        } catch (error) {
            setMessage(`❌ Błąd zapisu: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ margin: '20px', maxWidth: '600px' }}>
            <h2>📝 Edytor metadanych</h2>
            <form onSubmit={saveFile}>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="filePath" style={{ display: 'block', marginBottom: '5px' }}>
                        Ścieżka pliku (np. AI_MODELS/agent1.md):
                    </label>
                    <input
                        id="filePath"
                        type="text"
                        placeholder="AI_MODELS/agent1.md"
                        value={filePath}
                        onChange={(e) => setFilePath(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            backgroundColor: '#000',
                            color: '#fff',
                            border: '1px solid #444',
                            borderRadius: '4px',
                        }}
                    />
                </div>

                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="content" style={{ display: 'block', marginBottom: '5px' }}>
                        Zawartość:
                    </label>
                    <textarea
                        id="content"
                        rows={15}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            backgroundColor: '#000',
                            color: '#fff',
                            border: '1px solid #444',
                            borderRadius: '4px',
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: isLoading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isLoading ? '⏳ Zapisywanie...' : '💾 Zapisz plik'}
                </button>
            </form>

            {message && (
                <div
                    style={{
                        marginTop: '15px',
                        padding: '10px',
                        backgroundColor: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
                        color: message.startsWith('✅') ? '#155724' : '#721c24',
                        borderRadius: '4px',
                    }}
                >
                    {message}
                </div>
            )}
        </div>
    );
}
