/**
 * AI Assistant Panel - Float over browser
 */

import React, { useState } from 'react';

interface AIPanelProps {
  onClose: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);

  const electronAPI = (typeof window !== 'undefined') ? (window as any).electronAPI : undefined;

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setLoading(true);
    try {
      const result = await electronAPI.ai.execute({
        prompt: input,
        maxTokens: 2048,
        temperature: 0.7,
      });

      if (result.success) {
        setResponse(result.data.content);
      } else {
        setResponse(`Error: ${result.error}`);
      }
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadProviders = async () => {
    try {
      const status = await electronAPI.ai.getProviders();
      setProviders(status);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  return (
    <div className="ai-panel floating-panel">
      <div className="panel-header">
        <h2>🤖 AI Assistant</h2>
        <button className="btn-close" onClick={onClose}>
          ×
        </button>
      </div>

      <div className="panel-content">
        {/* Provider Status */}
        <div className="providers-list">
          <h3>Active Providers:</h3>
          {providers.length === 0 ? (
            <button onClick={loadProviders} className="btn-small">
              Load Providers
            </button>
          ) : (
            <ul>
              {providers.map((p) => (
                <li key={p.name} className={p.enabled ? 'active' : 'disabled'}>
                  {p.displayName} (#{p.priority})
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Input */}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI assistant..."
          disabled={loading}
          className="ai-input"
        />

        {/* Response */}
        {response && (
          <div className="ai-response">
            <h4>Response:</h4>
            <p>{response}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !input.trim()}
          className="btn-primary"
        >
          {loading ? 'Processing...' : 'Send'}
        </button>
      </div>
    </div>
  );
};