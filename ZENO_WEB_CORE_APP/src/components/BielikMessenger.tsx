import React, { useState, useEffect, useRef } from 'react';

interface BielikMessage {
  id: string;
  role: 'user' | 'bielik' | 'system';
  content: string;
  timestamp: Date;
  type: 'text' | 'audio';
}

interface BielikMessengerProps {
  isOpen: boolean;
  onClose: () => void;
}

const BielikMessenger: React.FC<BielikMessengerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<BielikMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) {
      checkConnection();
      addSystemMessage('Bielik Messenger initialized. Ready to assist you.');
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkConnection = async () => {
    try {
      // TODO: Replace with actual health check to BIELIK_THE_whitie
      // const response = await fetch('http://localhost:3000/health');
      // setIsConnected(response.ok);
      setIsConnected(false);
      if (!isConnected) {
        addSystemMessage('⚠️ Bielik backend is offline. Start BIELIK_THE_whitie to enable communication.');
      }
    } catch (error) {
      setIsConnected(false);
      addSystemMessage('⚠️ Cannot connect to Bielik backend.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addSystemMessage = (content: string) => {
    const message: BielikMessage = {
      id: `sys_${Date.now()}`,
      role: 'system',
      content,
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, message]);
  };

  const sendTextMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: BielikMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputText,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      if (!isConnected) {
        addSystemMessage('❌ Cannot send message: Bielik backend is offline');
        setIsProcessing(false);
        return;
      }

      // TODO: Replace with actual API call to BIELIK_THE_whitie
      // const response = await fetch('http://localhost:3000/api/bielik/chat', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ message: inputText })
      // });
      // const data = await response.json();

      // Simulate response for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const bielikMessage: BielikMessage = {
        id: `bielik_${Date.now()}`,
        role: 'bielik',
        content: 'Bielik backend is not running. Please start BIELIK_THE_whitie system to enable real-time communication.',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, bielikMessage]);
    } catch (error) {
      addSystemMessage(`❌ Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await sendAudioMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      addSystemMessage('🎤 Recording started...');
    } catch (error) {
      addSystemMessage('❌ Microphone access denied. Please allow microphone access to use voice input.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      addSystemMessage('🎤 Recording stopped. Processing...');
    }
  };

  const sendAudioMessage = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      if (!isConnected) {
        addSystemMessage('❌ Cannot send audio: Bielik backend is offline');
        setIsProcessing(false);
        return;
      }

      // TODO: Replace with actual API call to BIELIK_THE_whitie
      // const formData = new FormData();
      // formData.append('audio', audioBlob);
      // const response = await fetch('http://localhost:3000/api/bielik/audio', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();

      const userMessage: BielikMessage = {
        id: `audio_${Date.now()}`,
        role: 'user',
        content: '[Audio message - transcription not available]',
        timestamp: new Date(),
        type: 'audio'
      };

      setMessages(prev => [...prev, userMessage]);

      await new Promise(resolve => setTimeout(resolve, 1000));

      const bielikMessage: BielikMessage = {
        id: `bielik_${Date.now()}`,
        role: 'bielik',
        content: 'Voice recognition requires Bielik backend. Please start BIELIK_THE_whitie system.',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, bielikMessage]);
    } catch (error) {
      addSystemMessage(`❌ Error processing audio: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    addSystemMessage('Chat cleared.');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '24px',
        width: '90%',
        maxWidth: '900px',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                fontSize: '32px',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px'
              }}>
                🦁
              </div>
              <div>
                <h2 style={{
                  color: 'white',
                  fontSize: '24px',
                  margin: 0,
                  fontWeight: '700'
                }}>
                  Bielik Messenger
                </h2>
                <p style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '13px',
                  margin: 0
                }}>
                  Text & Voice Communication
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: isConnected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
              border: `1px solid ${isConnected ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'}`,
              borderRadius: '6px',
              padding: '6px 12px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isConnected ? '#10b981' : '#ef4444',
                boxShadow: `0 0 8px ${isConnected ? '#10b981' : '#ef4444'}`
              }} />
              <span style={{
                color: 'white',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase'
              }}>
                {isConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={clearChat}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '10px 16px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              🗑️ Clear
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                borderRadius: '10px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          backgroundColor: '#0f172a'
        }}>
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#64748b',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🦁</div>
              <h3 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>Welcome to Bielik Messenger</h3>
              <p style={{ fontSize: '14px', margin: 0 }}>
                Start a conversation with text or voice
              </p>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '16px'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  display: 'flex',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  gap: '12px',
                  alignItems: 'flex-start'
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: message.role === 'user'
                      ? 'linear-gradient(135deg, #667eea, #764ba2)'
                      : message.role === 'bielik'
                      ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                      : '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    flexShrink: 0
                  }}>
                    {message.role === 'user' ? '👤' : message.role === 'bielik' ? '🦁' : 'ℹ️'}
                  </div>

                  {/* Message Bubble */}
                  <div>
                    <div style={{
                      backgroundColor: message.role === 'user'
                        ? '#667eea'
                        : message.role === 'bielik'
                        ? '#1e293b'
                        : '#334155',
                      border: message.role === 'bielik' ? '1px solid #475569' : 'none',
                      color: 'white',
                      padding: '12px 16px',
                      borderRadius: message.role === 'user'
                        ? '16px 16px 4px 16px'
                        : '16px 16px 16px 4px',
                      wordWrap: 'break-word',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                      {message.type === 'audio' && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '4px',
                          color: '#94a3b8',
                          fontSize: '12px'
                        }}>
                          🎤 Audio Message
                        </div>
                      )}
                      <div style={{
                        fontSize: '14px',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {message.content}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#64748b',
                      marginTop: '4px',
                      textAlign: message.role === 'user' ? 'right' : 'left'
                    }}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {isProcessing && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '16px'
            }}>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  🦁
                </div>
                <div style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  padding: '12px 16px',
                  borderRadius: '16px 16px 16px 4px'
                }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#94a3b8',
                      animation: 'pulse 1.4s ease-in-out infinite'
                    }} />
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#94a3b8',
                      animation: 'pulse 1.4s ease-in-out infinite 0.2s'
                    }} />
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#94a3b8',
                      animation: 'pulse 1.4s ease-in-out infinite 0.4s'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          backgroundColor: '#1e293b',
          borderTop: '1px solid #334155',
          padding: '20px'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
            {/* Voice Recording Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              style={{
                background: isRecording
                  ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                  : 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: 'white',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                fontSize: '24px',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: isRecording ? '0 0 20px #ef444460' : '0 4px 12px rgba(0,0,0,0.2)',
                opacity: isProcessing ? 0.5 : 1,
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (!isProcessing) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              {isRecording ? '⏹️' : '🎤'}
            </button>

            {/* Text Input */}
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
                disabled={isProcessing}
                style={{
                  width: '100%',
                  minHeight: '56px',
                  maxHeight: '120px',
                  backgroundColor: '#0f172a',
                  border: '2px solid #334155',
                  borderRadius: '16px',
                  padding: '16px',
                  color: 'white',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#667eea';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#334155';
                }}
              />
            </div>

            {/* Send Button */}
            <button
              onClick={sendTextMessage}
              disabled={!inputText.trim() || isProcessing}
              style={{
                background: (!inputText.trim() || isProcessing)
                  ? '#33415560'
                  : 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                color: 'white',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                fontSize: '24px',
                cursor: (!inputText.trim() || isProcessing) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: (!inputText.trim() || isProcessing) ? 'none' : '0 4px 12px #667eea60',
                opacity: (!inputText.trim() || isProcessing) ? 0.5 : 1,
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (inputText.trim() && !isProcessing) {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px #667eea80';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = (!inputText.trim() || isProcessing) ? 'none' : '0 4px 12px #667eea60';
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default BielikMessenger;
