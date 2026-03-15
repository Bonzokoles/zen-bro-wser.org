/*
 * Local Model Chatbot
 * Chatbot interface for communication with local LLM models (HuggingFace, Ollama, etc.)
 * Features: Text chat, model selection, conversation history, markdown support
 */

import React, { useState, useEffect, useRef } from 'react';
import { getProviderKey } from '../utils/apiKeys';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface LocalChatbotProps {
  initialModel?: string;
  onClose?: () => void;
}

export const LocalChatbot: React.FC<LocalChatbotProps> = ({ 
  initialModel = 'mistralai/Mistral-7B-Instruct-v0.2',
  onClose 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Local model chatbot ready. Type your message below.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const localModels = [
    { id: 'mistralai/Mistral-7B-Instruct-v0.2', name: 'Mistral 7B Instruct' },
    { id: 'meta-llama/Llama-2-7b-chat-hf', name: 'Llama 2 7B Chat' },
    { id: 'microsoft/phi-2', name: 'Phi-2' },
    { id: 'google/flan-t5-xxl', name: 'FLAN-T5-XXL' },
    { id: 'bigscience/bloom-7b1', name: 'BLOOM 7B' },
    { id: 'EleutherAI/gpt-neo-2.7B', name: 'GPT-Neo 2.7B' }
  ];

  useEffect(() => {
    // Auto-load HuggingFace API key from .env
    const hfKey = getProviderKey('huggingface') || import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (hfKey) {
      setApiKey(hfKey);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!apiKey) {
      setError('Please provide HuggingFace API key');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${selectedModel}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            inputs: userMessage.content,
            parameters: {
              max_new_tokens: 512,
              temperature: 0.7,
              top_p: 0.9,
              return_full_text: false
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const assistantContent = Array.isArray(data) 
        ? data[0]?.generated_text || 'No response generated'
        : data.generated_text || data[0]?.generated_text || 'No response generated';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      setError(err.message || 'Failed to communicate with model');
      console.error('Local model error:', err);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: `❌ Error: ${err.message || 'Failed to get response'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        id: '1',
        role: 'system',
        content: 'Conversation cleared. Start a new chat.',
        timestamp: new Date()
      }
    ]);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      backgroundColor: '#0f172a',
      borderRadius: '12px',
      border: '1px solid #334155',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #334155',
        backgroundColor: '#1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: 600 }}>
            🤖 Local Model Chat
          </h3>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>
            Powered by HuggingFace Inference API
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            ×
          </button>
        )}
      </div>

      {/* Model Selection & Controls */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid #334155',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        backgroundColor: '#1e293b'
      }}>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #334155',
            borderRadius: '6px',
            backgroundColor: '#0f172a',
            color: 'white',
            fontSize: '13px'
          }}
        >
          {localModels.map(model => (
            <option key={model.id} value={model.id}>{model.name}</option>
          ))}
        </select>
        <button
          onClick={clearConversation}
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            border: '1px solid #334155',
            borderRadius: '6px',
            backgroundColor: '#0f172a',
            color: '#94a3b8',
            fontSize: '13px',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1e293b';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#0f172a';
            e.currentTarget.style.color = '#94a3b8';
          }}
        >
          🗑️ Clear
        </button>
      </div>

      {/* API Key Input (if not set) */}
      {!apiKey && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#991b1b',
          color: 'white',
          fontSize: '13px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <span>⚠️ API Key Required:</span>
          <input
            type="password"
            placeholder="Enter HuggingFace API key"
            onChange={(e) => setApiKey(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 12px',
              border: '1px solid #7f1d1d',
              borderRadius: '4px',
              backgroundColor: '#7f1d1d',
              color: 'white',
              fontSize: '13px'
            }}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#991b1b',
          color: 'white',
          fontSize: '13px',
          borderBottom: '1px solid #7f1d1d'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map(message => (
          <div
            key={message.id}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: message.role === 'user' 
                ? '#3b82f6' 
                : message.role === 'system'
                ? '#334155'
                : '#1e293b',
              color: 'white',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {message.role === 'system' && (
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
                SYSTEM
              </div>
            )}
            {message.content}
            <div style={{
              fontSize: '11px',
              color: '#94a3b8',
              marginTop: '6px',
              textAlign: 'right'
            }}>
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#1e293b',
            color: '#94a3b8',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <div className="dot-flashing"></div>
              <span>Model is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #334155',
        backgroundColor: '#1e293b',
        display: 'flex',
        gap: '12px'
      }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          disabled={isLoading || !apiKey}
          style={{
            flex: 1,
            padding: '12px',
            border: '1px solid #334155',
            borderRadius: '8px',
            backgroundColor: '#0f172a',
            color: 'white',
            fontSize: '14px',
            resize: 'none',
            minHeight: '60px',
            fontFamily: 'inherit'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim() || !apiKey}
          style={{
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: isLoading || !input.trim() || !apiKey ? '#334155' : '#3b82f6',
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isLoading || !input.trim() || !apiKey ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && input.trim() && apiKey) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && input.trim() && apiKey) {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          {isLoading ? '⏳' : '📤'} Send
        </button>
      </div>

      {/* Loading Animation */}
      <style>{`
        @keyframes dot-flashing {
          0%, 80%, 100% { opacity: 0.3; }
          40% { opacity: 1; }
        }
        .dot-flashing {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #94a3b8;
          animation: dot-flashing 1.4s infinite linear;
        }
        .dot-flashing::before,
        .dot-flashing::after {
          content: '';
          display: inline-block;
          position: absolute;
          top: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #94a3b8;
          animation: dot-flashing 1.4s infinite linear;
        }
        .dot-flashing::before {
          left: -15px;
          animation-delay: -0.32s;
        }
        .dot-flashing::after {
          left: 15px;
          animation-delay: 0.32s;
        }
      `}</style>
    </div>
  );
};

export default LocalChatbot;
