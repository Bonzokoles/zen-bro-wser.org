import React, { useState, useEffect } from 'react';
import { mcpService } from '../services/mcpService';
import type { MCPServiceConfig, MCPTool } from '../services/mcpService';
import { getProviderKey, setProviderKey, getEnvDefaults } from '../utils/apiKeys';

const OPENROUTER_MODELS: Array<{ id: string; label: string }> = [
  { id: 'openai/gpt-oss-20b:free', label: 'OpenAI GPT-OSS 20B (free)' },
  { id: 'deepseek/deepseek-chat-v3.1:free', label: 'DeepSeek Chat v3.1 (free)' },
  { id: 'qwen/qwen3-coder:free', label: 'Qwen3 Coder (free)' },
  { id: 'moonshotai/kimi-k2:free', label: 'Moonshot Kimi K2 (free)' },
  { id: 'cognitivecomputations/dolphin-mistral-24b-venice-edition:free', label: 'Dolphin Mistral 24B Venice (free)' },
  { id: 'agentica-org/deepcoder-14b-preview:free', label: 'DeepCoder 14B Preview (free)' },
  { id: 'meta-llama/llama-4-maverick:free', label: 'Meta Llama 4 Maverick (free)' },
  { id: 'google/gemma-3-12b-it:free', label: 'Google Gemma 3 12B IT (free)' },
  { id: 'google/gemini-2.0-flash-exp:free', label: 'Google Gemini 2.0 Flash Exp (free)' },
  { id: 'qwen/qwen-2.5-coder-32b-instruct:free', label: 'Qwen 2.5 Coder 32B Instruct (free)' }
];

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
  const envDefaults = getEnvDefaults();
  const [provider, setProvider] = useState<'gemini' | 'openrouter' | 'claude'>('gemini');
  const [apiKey, setApiKey] = useState(() => getProviderKey('gemini'));
  const [tavilyApiKey, setTavilyApiKey] = useState('');
  const [llamaApiKey, setLlamaApiKey] = useState(() => getProviderKey('llama'));
  const [huggingfaceApiKey, setHuggingfaceApiKey] = useState(() => getProviderKey('huggingface'));
  const [additionalStatus, setAdditionalStatus] = useState<string | null>(null);
  const [model, setModel] = useState('');
    const isOpenRouterProvider = provider === 'openrouter';
    const openRouterSelectValue = isOpenRouterProvider && OPENROUTER_MODELS.some(modelOption => modelOption.id === model)
      ? model
      : '';
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

      setLlamaApiKey(getProviderKey('llama'));
      setHuggingfaceApiKey(getProviderKey('huggingface'));
      setApiKey(getProviderKey(provider));

      // Load saved settings from localStorage
      const savedConfig = localStorage.getItem('mcp_config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          const nextProvider = (config.provider || 'gemini') as 'gemini' | 'openrouter' | 'claude';
          setProvider(nextProvider);
          const configuredKey = config.apiKey || '';
          if (configuredKey) {
            setProviderKey(nextProvider, configuredKey);
            setApiKey(configuredKey);
          } else {
            setApiKey(getProviderKey(nextProvider));
          }
          const nextModel = config.model || '';
          if (nextProvider === 'openrouter' && !nextModel) {
            setModel(OPENROUTER_MODELS[0]?.id || '');
          } else if (nextProvider === 'gemini' && !nextModel) {
            setModel('gemini-1.5-pro');
          } else {
            setModel(nextModel);
          }
        } catch (error) {
          console.error('Failed to load saved config:', error);
        }
      }
    } else {
      // When dialog closes reset transient status messages
      setAdditionalStatus(null);
    }
  }, [isOpen]);

  const handleProviderChange = (nextProvider: 'gemini' | 'openrouter' | 'claude') => {
    setProvider(nextProvider);
    setApiKey(getProviderKey(nextProvider));
    if (nextProvider === 'openrouter') {
      setModel(OPENROUTER_MODELS[0]?.id || '');
    } else if (nextProvider === 'gemini') {
      setModel('gemini-1.5-pro');
    } else {
      setModel('');
    }
  };

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
        
        // Save configuration to localStorage
        localStorage.setItem('mcp_config', JSON.stringify(config));
        setProviderKey(provider, config.apiKey.trim());
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
      setConnectionStatus(`❌ Error: ${(error as Error).message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    mcpService.disconnect();
    localStorage.removeItem('mcp_config');
    setConnectionStatus('Disconnected');
    setTools([]);
    setProviderKey(provider, '');
  };

  const handleSaveAdditionalKeys = () => {
    setProviderKey('llama', llamaApiKey.trim());
    setProviderKey('huggingface', huggingfaceApiKey.trim());
    setAdditionalStatus('✅ Additional provider keys saved locally');
    setTimeout(() => setAdditionalStatus(null), 2500);
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
        return 'openai/gpt-oss-20b:free';
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
                onChange={(e) => handleProviderChange(e.target.value as 'gemini' | 'openrouter' | 'claude')}
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
              <option value="claude" disabled>🎭 Claude (Coming Soon)</option>
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


          {/* Tavily API Key */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#f1f5f9',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              Tavily API Key (for Web Search)
            </label>
            <input
              type="password"
              value={tavilyApiKey}
              onChange={(e) => setTavilyApiKey(e.target.value)}
              placeholder="Enter your Tavily API key..."
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

          {/* Additional Provider Keys */}
          <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #1f2937', borderRadius: '8px', backgroundColor: '#0b1220' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 600, margin: 0 }}>Additional Provider Keys</h4>
              <span style={{ color: '#64748b', fontSize: '12px' }}>Optional · stored locally</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px' }}>
              Use these fields to store keys for upcoming providers like Meta Llama or Hugging Face models. Values are pre-filled from
              environment defaults when available.
            </p>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', color: '#f1f5f9', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Llama Provider Key</label>
                <input
                  type="password"
                  value={llamaApiKey}
                  onChange={(e) => setLlamaApiKey(e.target.value)}
                  placeholder={envDefaults.llama ? 'Loaded from environment' : 'Enter Llama provider key...'}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#f1f5f9', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Hugging Face Token</label>
                <input
                  type="password"
                  value={huggingfaceApiKey}
                  onChange={(e) => setHuggingfaceApiKey(e.target.value)}
                  placeholder={envDefaults.huggingface ? 'Loaded from environment' : 'Enter Hugging Face token...'}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSaveAdditionalKeys}
              style={{
                marginTop: '12px',
                padding: '10px 16px',
                borderRadius: '6px',
                border: '1px solid #1e293b',
                background: 'linear-gradient(135deg, #334155, #1e293b)',
                color: '#f8fafc',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Save Additional Keys
            </button>
            {additionalStatus && (
              <div style={{ marginTop: '10px', color: '#38bdf8', fontSize: '12px' }}>{additionalStatus}</div>
            )}
          </div>

          {/* OpenRouter Quick Select */}
          {isOpenRouterProvider && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                color: '#f1f5f9',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Choose a Free OpenRouter Model
              </label>
              <select
                value={openRouterSelectValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setModel('');
                  } else {
                    setModel(value);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  fontSize: '14px',
                  marginBottom: '8px'
                }}
              >
                <option value="">Custom model (enter manually below)</option>
                {OPENROUTER_MODELS.map(modelOption => (
                  <option key={modelOption.id} value={modelOption.id}>
                    {modelOption.label}
                  </option>
                ))}
              </select>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                Selected value will populate the model field below. You can still specify any other model manually.
              </div>
            </div>
          )}

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