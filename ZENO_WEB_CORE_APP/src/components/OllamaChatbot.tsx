import React, { useState, useRef, useEffect } from 'react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface OllamaChatbotProps {
    onClose: () => void;
}

const OllamaChatbot: React.FC<OllamaChatbotProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [model, setModel] = useState('llama3.2');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch available models
        fetch('http://localhost:11434/api/tags')
            .then(res => res.json())
            .then(data => {
                const models = data.models?.map((m: any) => m.name) || [];
                setAvailableModels(models);
                if (models.length > 0 && !models.includes(model)) {
                    setModel(models[0]);
                }
            })
            .catch(err => {
                console.error('Failed to fetch Ollama models:', err);
                setMessages([{ role: 'assistant', content: '❌ Nie można połączyć z Ollama (localhost:11434).\nSprawdź czy Ollama jest uruchomiona.' }]);
            });
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:11434/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    messages: [...messages, userMessage],
                    stream: false
                })
            });

            if (!response.ok) throw new Error(`Ollama API error: ${response.status}`);

            const data = await response.json();
            const assistantMessage: Message = {
                role: 'assistant',
                content: data.message?.content || 'Brak odpowiedzi'
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Ollama chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `❌ Błąd: ${error instanceof Error ? error.message : 'Nieznany błąd'}`
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            maxWidth: '90vw',
            height: '700px',
            maxHeight: '90vh',
            backgroundColor: '#1a1a1a',
            border: '2px solid #00ff00',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 255, 0, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10000,
            fontFamily: 'monospace'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid #00ff00',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#0a0a0a'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>🤖</span>
                    <h3 style={{ margin: 0, color: '#00ff00' }}>Ollama Chatbot</h3>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#00ff00',
                        fontSize: '24px',
                        cursor: 'pointer',
                        padding: '0 8px'
                    }}
                >
                    ×
                </button>
            </div>

            {/* Model Selector */}
            <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid #333',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
            }}>
                <label style={{ color: '#00ff00', fontSize: '12px' }}>Model:</label>
                <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    disabled={isLoading}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#0a0a0a',
                        color: '#00ff00',
                        border: '1px solid #00ff00',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                    }}
                >
                    {availableModels.length > 0 ? (
                        availableModels.map(m => (
                            <option key={m} value={m}>{m}</option>
                        ))
                    ) : (
                        <option value={model}>{model}</option>
                    )}
                </select>
                <span style={{ color: '#666', fontSize: '11px' }}>
                    {availableModels.length} modeli dostępnych
                </span>
            </div>

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                {messages.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        color: '#666',
                        marginTop: '100px',
                        fontSize: '14px'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                        <p>Rozpocznij rozmowę z Ollama</p>
                        <p style={{ fontSize: '12px' }}>Model: {model}</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            padding: '12px 16px',
                            borderRadius: '12px',
                            backgroundColor: msg.role === 'user' ? '#003300' : '#001a00',
                            border: `1px solid ${msg.role === 'user' ? '#00ff00' : '#006600'}`,
                            color: '#00ff00',
                            fontSize: '13px',
                            lineHeight: '1.5',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}
                    >
                        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>
                            {msg.role === 'user' ? '👤 Ty' : '🤖 Ollama'}
                        </div>
                        {msg.content}
                    </div>
                ))}

                {isLoading && (
                    <div style={{
                        alignSelf: 'flex-start',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        backgroundColor: '#001a00',
                        border: '1px solid #006600',
                        color: '#00ff00',
                        fontSize: '13px'
                    }}>
                        <div style={{ fontSize: '10px', opacity: 0.7, marginBottom: '4px' }}>
                            🤖 Ollama
                        </div>
                        Myślę<span className="dots">...</span>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '16px',
                borderTop: '1px solid #00ff00',
                display: 'flex',
                gap: '8px',
                backgroundColor: '#0a0a0a'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    disabled={isLoading}
                    placeholder="Wpisz wiadomość..."
                    style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#1a1a1a',
                        color: '#00ff00',
                        border: '1px solid #00ff00',
                        borderRadius: '6px',
                        fontSize: '13px',
                        outline: 'none'
                    }}
                />
                <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    style={{
                        padding: '12px 24px',
                        backgroundColor: isLoading || !input.trim() ? '#003300' : '#00ff00',
                        color: isLoading || !input.trim() ? '#006600' : '#000',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        fontFamily: 'monospace'
                    }}
                >
                    {isLoading ? '⏳' : '➤'}
                </button>
            </div>
        </div>
    );
};

export default OllamaChatbot;
