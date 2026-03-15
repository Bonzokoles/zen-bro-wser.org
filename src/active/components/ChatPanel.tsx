import React, { useState, useEffect, useRef } from 'react';
import { mcpService } from '../services/mcpService';
import type { ChatMessage } from '../services/mcpService';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl?: string;
  currentTitle?: string;
  webContent?: string | null;
  /** When true, renders inline (fills parent container) instead of as a fixed sidebar */
  embedded?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  currentUrl,
  currentTitle,
  webContent,
  embedded = false
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [commandInput, setCommandInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsConnected(mcpService.isConnected());
    if (mcpService.isConnected()) {
      setMessages(mcpService.getChatHistory());
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !isConnected) return;

    setIsLoading(true);
    const userMessage = inputMessage.trim();
    setInputMessage('');

    try {
      const webContext = currentUrl && currentTitle ? {
        url: currentUrl,
        title: currentTitle,
        content: webContent
      } : undefined;

      const response = await mcpService.sendMessage(userMessage, webContext);
      setMessages(mcpService.getChatHistory());
    } catch (error) {
      console.error('Failed to send message:', error);
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzePage = async () => {
    if (!currentUrl || !isConnected || isLoading) return;

    setIsLoading(true);
    try {
      const content = webContent ?? 'No content available';
      const analysis = await mcpService.analyzeCurrentPage(currentUrl, content);
      setMessages(mcpService.getChatHistory());
    } catch (error) {
      console.error('Failed to analyze page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  };

  if (!isOpen && !embedded) return null;

  const containerStyle: React.CSSProperties = embedded
    ? {
        position: 'relative',
        height: '100%',
        backgroundColor: '#1e293b',
        display: 'flex',
        flexDirection: 'column',
      }
    : {
        position: 'fixed',
        top: 0,
        right: 0,
        width: '400px',
        height: '100vh',
        backgroundColor: '#1e293b',
        borderLeft: '2px solid #94a3b8',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000,
        boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
      };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #334155',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              🤖 AI Chat
            </h3>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
              {isConnected ? '✅ Connected' : '❌ Disconnected'}
            </div>
            <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px' }}>
              💡 Open Settings (⌘,) to configure providers
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Current Page Info */}
      {currentUrl && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #334155',
          fontSize: '12px',
          color: '#94a3b8'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Current Page:</div>
          <div style={{ wordBreak: 'break-all' }}>{currentTitle || currentUrl}</div>
          <button
            onClick={handleAnalyzePage}
            disabled={isLoading || !isConnected}
            style={{
              marginTop: '8px',
              padding: '4px 8px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '11px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1
            }}
          >
            {isLoading ? 'Analyzing...' : '🔍 Analyze Page'}
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {!isConnected && (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            color: '#94a3b8',
            backgroundColor: '#374151',
            borderRadius: '8px',
            border: '1px solid #4b5563'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔧</div>
            <div>Please configure Gemini API key in MCP Settings</div>
          </div>
        )}

        {messages.map((message, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
            gap: '8px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: message.role === 'user' ? '#3b82f6' : '#10b981',
              color: 'white',
              fontSize: '14px',
              flexShrink: 0
            }}>
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div style={{
              maxWidth: '80%',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: message.role === 'user' ? '#3b82f6' : '#374151',
              color: 'white',
              fontSize: '14px',
              lineHeight: '1.4'
            }}>
              <div dangerouslySetInnerHTML={{
                __html: formatMessage(message.content)
              }} />
              {message.timestamp && (
                <div style={{
                  fontSize: '10px',
                  opacity: 0.6,
                  marginTop: '6px'
                }}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#94a3b8'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🤖
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: '#374151',
              borderRadius: '12px',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="animate-spin" style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #94a3b8',
                  borderTopColor: 'transparent',
                  borderRadius: '50%'
                }} />
                Gemini is thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {isConnected && (
        <div style={{
          padding: '16px',
          borderTop: '1px solid #334155',
          backgroundColor: '#0f172a'
        }}>
          <form onSubmit={handleSendMessage}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask Gemini about this page..."
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 50px 12px 12px',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  backgroundColor: '#1e293b',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  border: 'none',
                  borderRadius: '6px',
                  width: '32px',
                  height: '32px',
                  color: 'white',
                  cursor: isLoading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                  opacity: isLoading || !inputMessage.trim() ? 0.6 : 1,
                  fontSize: '14px'
                }}
              >
                ➤
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;