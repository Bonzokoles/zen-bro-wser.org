import React, { useState, useEffect } from 'react';
import { mcpService } from '../services/mcpService';
import type { MCPServiceConfig, MCPTool } from '../services/mcpService';
import { getProviderKey, getEnvDefaults } from '../utils/apiKeys';

interface ProviderSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured: () => void;
}

const ProviderSettings: React.FC<ProviderSettingsProps> = ({ 
  isOpen, 
  onClose, 
  onConfigured 
}) => {
  const [provider, setProvider] = useState<'gemini' | 'openrouter' | 'claude'>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [tavilyApiKey, setTavilyApiKey] = useState('');
  const [braveApiKey, setBraveApiKey] = useState('');
  const [searchEngine, setSearchEngine] = useState<'tavily' | 'brave' | 'both'>('tavily');
  const [model, setModel] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [tools, setTools] = useState<MCPTool[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTools(mcpService.getTools());
      setConnectionStatus(mcpService.isConnected() ? 'Connected' : null);
      
      const savedTavilyKey = localStorage.getItem('tavily_api_key');
      if (savedTavilyKey) {
        setTavilyApiKey(savedTavilyKey);
      }

      const savedBraveKey = localStorage.getItem('brave_api_key');
      if (savedBraveKey) {
        setBraveApiKey(savedBraveKey);
      }

      const savedSearchEngine = localStorage.getItem('search_engine') as 'tavily' | 'brave' | 'both';
      if (savedSearchEngine) {
        setSearchEngine(savedSearchEngine);
      }

      // Load saved settings from localStorage
      const savedConfig = localStorage.getItem('mcp_config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          setProvider(config.provider || 'gemini');
          setApiKey(config.apiKey || '');
          setModel(config.model || '');
        } catch (error) {
          console.error('Failed to load saved config:', error);
        }
      } else {
        // Auto-load from .env if no saved config
        const envDefaults = getEnvDefaults();
        if (envDefaults.gemini) {
          setProvider('gemini');
          setApiKey(envDefaults.gemini);
          setConnectionStatus('✅ API key loaded from .env');
        } else if (envDefaults.openrouter) {
          setProvider('openrouter');
          setApiKey(envDefaults.openrouter);
          setConnectionStatus('✅ API key loaded from .env');
        } else if (envDefaults.claude) {
          setProvider('claude');
          setApiKey(envDefaults.claude);
          setConnectionStatus('✅ API key loaded from .env');
        }
      }
    }
  }, [isOpen]);

  const handleConnect = async () => {
    if (!apiKey.trim()) {
      setConnectionStatus('API key is required');
      return;
    }

    setIsConnecting(true);
    setConnectionStatus('Connecting...');

    try {
      const config: MCPServiceConfig = {
        provider,
        apiKey: apiKey.trim(),
        model: model.trim() || undefined,
        tavilyApiKey: tavilyApiKey.trim() || undefined
      };

      const success = await mcpService.initialize(config);
      
      if (success) {
        // Save Tavily API key
        if (tavilyApiKey.trim()) {
          localStorage.setItem('tavily_api_key', tavilyApiKey.trim());
        }
        
        // Save Brave API key
        if (braveApiKey.trim()) {
          localStorage.setItem('brave_api_key', braveApiKey.trim());
        }

        // Save search engine preference
        localStorage.setItem('search_engine', searchEngine);
        
        // Save configuration to localStorage
        localStorage.setItem('mcp_config', JSON.stringify(config));
        setConnectionStatus('✅ Connected successfully!');
        setTools(mcpService.getTools());
        onConfigured();
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setConnectionStatus('❌ Connection failed');
      }
    } catch (error) {
      setConnectionStatus(`❌ Error: ${(error as Error).message ?? String(error)}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    mcpService.disconnect();
    localStorage.removeItem('mcp_config');
    setConnectionStatus('Disconnected');
    setTools([]);
  };

  const handleToggleTool = (toolId: string) => {
    const newState = mcpService.toggleTool(toolId);
    setTools(mcpService.getTools());
  };

  const getModelPlaceholder = () => {
    switch (provider) {
      case 'gemini':
        return 'gemini-1.5-pro';
      case 'openrouter':
        return 'openai/gpt-4o-mini';
      case 'claude':
        return 'claude-3-sonnet-20240229';
      default:
        return '';
    }
  };

  const getApiKeyPlaceholder = () => {
    switch (provider) {
      case 'gemini':
        return 'Enter your Google AI Studio API key...';
      case 'openrouter':
        return 'Enter your OpenRouter API key...';
      case 'claude':
        return 'Enter your Anthropic API key...';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        width: '500px',
        maxHeight: '80vh',
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        border: '1px solid #334155',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
                🔧 MCP Settings
              </h2>
              <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '4px' }}>
                Configure AI Provider & Tools
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ 
          padding: '24px',
          maxHeight: 'calc(80vh - 80px)',
          overflowY: 'auto'
        }}>
          {/* Provider Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#f1f5f9',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => {
                const newProvider = e.target.value as any;
                setProvider(newProvider);
                // Auto-load API key for new provider from .env
                const envKey = getProviderKey(newProvider);
                if (envKey && !apiKey) {
                  setApiKey(envKey);
                  setConnectionStatus('✅ API key loaded from .env');
                }
              }}
              disabled={isConnecting}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #334155',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: 'white',
                fontSize: '14px'
              }}
            >
              <option value="gemini">🤖 Google Gemini</option>
              <option value="openrouter">🌐 OpenRouter</option>
              <option value="claude">🎭 Claude (Anthropic)</option>
            </select>
          </div>

          {/* API Key */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#f1f5f9',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={getApiKeyPlaceholder()}
              disabled={isConnecting}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #334155',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: 'white',
                fontSize: '14px'
              }}
            />
            {provider === 'gemini' && (
              <div style={{ 
                fontSize: '12px', 
                color: '#94a3b8', 
                marginTop: '4px' 
              }}>
                Get your API key from{' '}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank"
                  style={{ color: '#60a5fa' }}
                >
                  Google AI Studio
                </a>
              </div>
            )}
            {provider === 'openrouter' && (
              <div style={{ 
                fontSize: '12px', 
                color: '#94a3b8', 
                marginTop: '4px' 
              }}>
                Get your API key from{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank"
                  style={{ color: '#60a5fa' }}
                >
                  OpenRouter Dashboard
                </a>
                <br />
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  Access multiple AI models: GPT-4, Claude, Gemini, Llama & more
                </span>
              </div>
            )}
          </div>


          {/* Search Engine Selection */}
          <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #334155', borderRadius: '8px', backgroundColor: '#0b1220' }}>
            <label style={{
              display: 'block',
              color: '#f1f5f9',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              🔍 Search Engine
            </label>
            <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderRadius: '6px', backgroundColor: searchEngine === 'tavily' ? '#1e3a8a' : '#1e293b' }}>
                <input
                  type="radio"
                  name="searchEngine"
                  value="tavily"
                  checked={searchEngine === 'tavily'}
                  onChange={(e) => setSearchEngine(e.target.value as 'tavily')}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 500 }}>Tavily (AI-optimized search)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderRadius: '6px', backgroundColor: searchEngine === 'brave' ? '#1e3a8a' : '#1e293b' }}>
                <input
                  type="radio"
                  name="searchEngine"
                  value="brave"
                  checked={searchEngine === 'brave'}
                  onChange={(e) => setSearchEngine(e.target.value as 'brave')}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 500 }}>Brave (Privacy-focused)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderRadius: '6px', backgroundColor: searchEngine === 'both' ? '#1e3a8a' : '#1e293b' }}>
                <input
                  type="radio"
                  name="searchEngine"
                  value="both"
                  checked={searchEngine === 'both'}
                  onChange={(e) => setSearchEngine(e.target.value as 'both')}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: 500 }}>Both (Tavily first, Brave fallback)</span>
              </label>
            </div>

            {/* Tavily API Key */}
            {(searchEngine === 'tavily' || searchEngine === 'both') && (
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  color: '#f1f5f9',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '6px'
                }}>
                  Tavily API Key
                </label>
                <input
                  type="password"
                  value={tavilyApiKey}
                  onChange={(e) => setTavilyApiKey(e.target.value)}
                  placeholder="Enter Tavily API key..."
                  disabled={isConnecting}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Get key from <a href="https://tavily.com" target="_blank" style={{ color: '#60a5fa' }}>tavily.com</a>
                </div>
              </div>
            )}

            {/* Brave API Key */}
            {(searchEngine === 'brave' || searchEngine === 'both') && (
              <div>
                <label style={{
                  display: 'block',
                  color: '#f1f5f9',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '6px'
                }}>
                  Brave API Key
                </label>
                <input
                  type="password"
                  value={braveApiKey}
                  onChange={(e) => setBraveApiKey(e.target.value)}
                  placeholder="Enter Brave Search API key..."
                  disabled={isConnecting}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Get key from <a href="https://brave.com/search/api/" target="_blank" style={{ color: '#60a5fa' }}>Brave Search API</a>
                </div>
              </div>
            )}
          </div>

          {/* Model */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#f1f5f9',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Model (Optional)
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={getModelPlaceholder()}
              disabled={isConnecting}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #334155',
                borderRadius: '8px',
                backgroundColor: '#0f172a',
                color: 'white',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Connection Status */}
          {connectionStatus && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: connectionStatus.includes('✅') ? '#065f46' : 
                             connectionStatus.includes('❌') ? '#7f1d1d' : '#374151',
              color: 'white',
              fontSize: '14px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {connectionStatus}
            </div>
          )}

          {/* Connection Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '24px' 
          }}>
            <button
              onClick={handleConnect}
              disabled={isConnecting || !apiKey.trim()}
              style={{
                flex: 1,
                padding: '12px',
                background: isConnecting || !apiKey.trim() 
                  ? '#374151' 
                  : 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isConnecting || !apiKey.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
            
            {mcpService.isConnected() && (
              <button
                onClick={handleDisconnect}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Disconnect
              </button>
            )}
          </div>

          {/* Tools Configuration */}
          {tools.length > 0 && (
            <div>
              <h3 style={{
                color: '#f1f5f9',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
                borderBottom: '1px solid #334155',
                paddingBottom: '8px'
              }}>
                MCP Tools
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {tools.map(tool => (
                  <div
                    key={tool.id}
                    style={{
                      padding: '12px',
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: `1px solid ${tool.enabled ? '#10b981' : '#334155'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ 
                        color: 'white', 
                        fontSize: '14px', 
                        fontWeight: '500',
                        marginBottom: '2px'
                      }}>
                        {tool.name}
                      </div>
                      <div style={{ 
                        color: '#94a3b8', 
                        fontSize: '12px' 
                      }}>
                        {tool.description}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleTool(tool.id)}
                      style={{
                        background: tool.enabled 
                          ? 'linear-gradient(135deg, #10b981, #059669)' 
                          : '#374151',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '6px 12px',
                        color: 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                        minWidth: '60px'
                      }}
                    >
                      {tool.enabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderSettings;