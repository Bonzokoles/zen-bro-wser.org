import React, { useState, useEffect, useRef } from 'react';
import type { Message } from '../services/orchestrator/aiAssistantService';

interface OrchestratorStats {
  totalQueued: number;
  totalProcessed: number;
  totalFailed: number;
  currentlyProcessing: number;
  isRunning: boolean;
  startedAt?: string;
}

interface ProcessedPage {
  id: string;
  url: string;
  category: string;
  confidence: number;
  reasoning: string;
  savedAt: string;
}

export const OrchestratorDashboard: React.FC = () => {
  const [stats, setStats] = useState<OrchestratorStats>({
    totalQueued: 0,
    totalProcessed: 0,
    totalFailed: 0,
    currentlyProcessing: 0,
    isRunning: false
  });

  const [processed, setProcessed] = useState<ProcessedPage[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [testUrl, setTestUrl] = useState('https://example.com');
  const [testContent, setTestContent] = useState('');

  // AI Assistant state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/orchestrator/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchProcessed = async () => {
    try {
      const res = await fetch('/api/orchestrator/processed');
      if (res.ok) {
        const data = await res.json();
        setProcessed(data);
      }
    } catch (err) {
      console.error('Failed to fetch processed:', err);
    }
  };

  const handleSetApiKey = async () => {
    try {
      const res = await fetch('/api/orchestrator/set-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey })
      });

      if (res.ok) {
        setIsApiKeySet(true);
        alert('✅ API Key set successfully!');
      } else {
        alert('❌ Failed to set API key');
      }
    } catch (err) {
      alert('❌ Error: ' + err);
    }
  };

  const handleStartStop = async () => {
    try {
      const endpoint = stats.isRunning ? '/api/orchestrator/stop' : '/api/orchestrator/start';
      const res = await fetch(endpoint, { method: 'POST' });

      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to start/stop:', err);
    }
  };

  const handleAddToQueue = async () => {
    if (!testUrl || !testContent) {
      alert('Please enter URL and content');
      return;
    }

    try {
      const res = await fetch('/api/orchestrator/add-to-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `test-${Date.now()}`,
          url: testUrl,
          content: testContent,
          metadata: { title: testUrl }
        })
      });

      if (res.ok) {
        alert('✅ Added to queue!');
        setTestContent('');
        fetchStats();
      }
    } catch (err) {
      alert('❌ Error: ' + err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isApiKeySet) return;

    const userMessage: Message = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsAssistantLoading(true);

    try {
      const res = await fetch('/api/orchestrator/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      } else {
        alert('❌ Chat failed');
      }
    } catch (err) {
      alert('❌ Error: ' + err);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#FFFFFF', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', borderBottom: '4px solid #000000', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#000000', margin: 0 }}>
          🎭 Orchestrator Dashboard
        </h1>
        <p style={{ fontSize: '1rem', color: '#666666', margin: '0.5rem 0 0 0' }}>
          AI-powered content classification and library management
        </p>
      </div>

      {/* API Key Setup */}
      {!isApiKeySet && (
        <div style={{
          background: '#FFFF00',
          border: '3px solid #000000',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#000000' }}>⚠️ OpenAI API Key Required</h3>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            style={{
              width: 'calc(100% - 120px)',
              padding: '0.75rem',
              border: '3px solid #000000',
              marginRight: '1rem',
              fontSize: '1rem'
            }}
          />
          <button
            onClick={handleSetApiKey}
            style={{
              background: '#000000',
              color: '#FFFFFF',
              border: '3px solid #000000',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Set API Key
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#F0F0F0', border: '3px solid #000000', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#000000' }}>{stats.totalQueued}</div>
          <div style={{ color: '#666666' }}>Queued</div>
        </div>
        <div style={{ background: '#F0F0F0', border: '3px solid #000000', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#00FF00' }}>{stats.totalProcessed}</div>
          <div style={{ color: '#666666' }}>Processed</div>
        </div>
        <div style={{ background: '#F0F0F0', border: '3px solid #000000', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#FF0000' }}>{stats.totalFailed}</div>
          <div style={{ color: '#666666' }}>Failed</div>
        </div>
        <div style={{ background: '#F0F0F0', border: '3px solid #000000', padding: '1.5rem' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0000FF' }}>{stats.currentlyProcessing}</div>
          <div style={{ color: '#666666' }}>Processing</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={handleStartStop}
          style={{
            background: stats.isRunning ? '#FF0000' : '#00FF00',
            color: '#000000',
            border: '3px solid #000000',
            padding: '1rem 2rem',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          {stats.isRunning ? '⏸️ Stop' : '▶️ Start'}
        </button>
        <button
          onClick={fetchProcessed}
          style={{
            background: '#0000FF',
            color: '#FFFFFF',
            border: '3px solid #000000',
            padding: '1rem 2rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📊 Load Results
        </button>
        <button
          onClick={() => setShowAssistant(!showAssistant)}
          style={{
            background: showAssistant ? '#FF0000' : '#FFFF00',
            color: '#000000',
            border: '3px solid #000000',
            padding: '1rem 2rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showAssistant ? '❌ Hide' : '🤖 AI Assistant'}
        </button>
      </div>

      {/* AI Assistant Chat */}
      {showAssistant && isApiKeySet && (
        <div style={{
          marginBottom: '2rem',
          border: '4px solid #000000',
          background: '#F0F0F0'
        }}>
          <div style={{
            background: '#000000',
            color: '#FFFFFF',
            padding: '1rem',
            fontWeight: 'bold'
          }}>
            🤖 ZENO AI Assistant
          </div>
          <div style={{
            height: '400px',
            overflowY: 'auto',
            padding: '1rem',
            background: '#FFFFFF'
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: msg.role === 'user' ? '#FFFF00' : '#F0F0F0',
                  border: '2px solid #000000'
                }}
              >
                <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong>
                <div style={{ marginTop: '0.5rem' }}>{msg.content}</div>
              </div>
            ))}
            {isAssistantLoading && (
              <div style={{ textAlign: 'center', color: '#666666' }}>Loading...</div>
            )}
            <div ref={chatEndRef} />
          </div>
          <div style={{ padding: '1rem', background: '#F0F0F0', borderTop: '3px solid #000000' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about ZENO features..."
              style={{
                width: 'calc(100% - 100px)',
                padding: '0.75rem',
                border: '3px solid #000000',
                marginRight: '1rem'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isAssistantLoading}
              style={{
                background: '#000000',
                color: '#FFFFFF',
                border: '3px solid #000000',
                padding: '0.75rem 1.5rem',
                cursor: inputMessage.trim() && !isAssistantLoading ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                opacity: inputMessage.trim() && !isAssistantLoading ? 1 : 0.5
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Test Section */}
      <div style={{
        marginBottom: '2rem',
        border: '3px solid #000000',
        padding: '1.5rem',
        background: '#F0F0F0'
      }}>
        <h3 style={{ margin: '0 0 1rem 0', color: '#000000' }}>➕ Add Test Page</h3>
        <input
          type="text"
          value={testUrl}
          onChange={(e) => setTestUrl(e.target.value)}
          placeholder="URL"
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '3px solid #000000',
            marginBottom: '1rem'
          }}
        />
        <textarea
          value={testContent}
          onChange={(e) => setTestContent(e.target.value)}
          placeholder="Content to classify..."
          rows={4}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '3px solid #000000',
            marginBottom: '1rem',
            fontFamily: 'monospace'
          }}
        />
        <button
          onClick={handleAddToQueue}
          style={{
            background: '#000000',
            color: '#FFFFFF',
            border: '3px solid #000000',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ➕ Add to Queue
        </button>
      </div>

      {/* Processed Results */}
      <div>
        <h3 style={{ marginBottom: '1rem', color: '#000000' }}>📊 Processed Pages</h3>
        {processed.length === 0 ? (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#666666',
            border: '3px solid #000000',
            background: '#F0F0F0'
          }}>
            No processed pages yet. Add pages to the queue to start.
          </div>
        ) : (
          <div style={{ border: '3px solid #000000' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#000000', color: '#FFFFFF' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', borderRight: '2px solid #FFFFFF' }}>URL</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderRight: '2px solid #FFFFFF' }}>Category</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderRight: '2px solid #FFFFFF' }}>Confidence</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {processed.map((p, idx) => (
                  <tr
                    key={p.id}
                    style={{
                      background: idx % 2 === 0 ? '#FFFFFF' : '#F0F0F0',
                      borderBottom: '2px solid #000000'
                    }}
                  >
                    <td style={{ padding: '0.75rem', borderRight: '2px solid #000000' }}>
                      <a href={p.url} target="_blank" rel="noreferrer" style={{ color: '#0000FF' }}>
                        {p.url}
                      </a>
                    </td>
                    <td style={{ padding: '0.75rem', borderRight: '2px solid #000000' }}>
                      <span style={{
                        background: '#FFFF00',
                        color: '#000000',
                        padding: '0.25rem 0.75rem',
                        border: '2px solid #000000',
                        fontWeight: 'bold'
                      }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', borderRight: '2px solid #000000' }}>
                      {(p.confidence * 100).toFixed(0)}%
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(p.savedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
