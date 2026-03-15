import React, { useState, useEffect } from 'react';

interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openrouter' | 'claude' | 'ollama' | 'custom';
  apiKey: string;
  endpoint?: string;
  model: string;
  status: 'active' | 'inactive' | 'error';
  isDefault: boolean;
  createdAt: Date;
}

interface AIModelManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onModelAdded?: (model: AIModel) => void;
}

const AIModelManager: React.FC<AIModelManagerProps> = ({ isOpen, onClose, onModelAdded }) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isAddingModel, setIsAddingModel] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);

  // New model form state
  const [newModel, setNewModel] = useState({
    provider: 'gemini' as 'gemini' | 'openrouter' | 'claude' | 'ollama' | 'custom',
    name: '',
    apiKey: '',
    model: '',
    endpoint: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadModels();
    }
  }, [isOpen]);

  const loadModels = () => {
    // Load from localStorage
    const saved = localStorage.getItem('ai_models');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setModels(parsed.map((m: any) => ({
          ...m,
          createdAt: new Date(m.createdAt)
        })));
      } catch (error) {
        console.error('Failed to load models:', error);
      }
    }
  };

  const saveModels = (updatedModels: AIModel[]) => {
    localStorage.setItem('ai_models', JSON.stringify(updatedModels));
    setModels(updatedModels);
  };

  const addModel = () => {
    // For Ollama, API key is set to 'local' and endpoint is required
    if (newModel.provider === 'ollama') {
      if (!newModel.name || !newModel.model || !newModel.endpoint) {
        alert('Please fill in all required fields (name, model, and server URL)');
        return;
      }
    } else {
      if (!newModel.name || !newModel.apiKey || !newModel.model) {
        alert('Please fill in all required fields');
        return;
      }
    }

    const model: AIModel = {
      id: `model_${Date.now()}`,
      name: newModel.name,
      provider: newModel.provider,
      apiKey: newModel.apiKey,
      model: newModel.model,
      endpoint: newModel.endpoint || undefined,
      status: 'inactive',
      isDefault: models.length === 0,
      createdAt: new Date()
    };

    const updatedModels = [...models, model];
    saveModels(updatedModels);
    
    if (onModelAdded) {
      onModelAdded(model);
    }

    // Reset form
    setNewModel({
      provider: 'gemini',
      name: '',
      apiKey: '',
      model: '',
      endpoint: ''
    });
    setIsAddingModel(false);
  };

  const deleteModel = (modelId: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      const updatedModels = models.filter(m => m.id !== modelId);
      saveModels(updatedModels);
    }
  };

  const setDefaultModel = (modelId: string) => {
    const updatedModels = models.map(m => ({
      ...m,
      isDefault: m.id === modelId
    }));
    saveModels(updatedModels);
  };

  const testModel = async (model: AIModel) => {
    try {
      // TODO: Implement actual model testing
      const updatedModels = models.map(m =>
        m.id === model.id ? { ...m, status: 'active' as const } : m
      );
      saveModels(updatedModels);
      alert(`Model "${model.name}" tested successfully!`);
    } catch (error) {
      const updatedModels = models.map(m =>
        m.id === model.id ? { ...m, status: 'error' as const } : m
      );
      saveModels(updatedModels);
      alert(`Failed to test model: ${(error as Error).message ?? String(error)}`);
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'gemini': return '#4285f4';
      case 'openrouter': return '#10b981';
      case 'claude': return '#f59e0b';
      case 'ollama': return '#000000';
      case 'custom': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'gemini': return '🔷';
      case 'openrouter': return '🔀';
      case 'claude': return '🤖';
      case 'ollama': return '🦙';
      case 'custom': return '⚙️';
      default: return '🤖';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'inactive': return '#64748b';
      case 'error': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getDefaultModels = (provider: string) => {
    switch (provider) {
      case 'gemini':
        return ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
      case 'openrouter':
        return ['openai/gpt-4-turbo', 'anthropic/claude-3-opus', 'meta-llama/llama-3-70b'];
      case 'claude':
        return ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'];
      case 'ollama':
        return ['llama3.2:1b', 'llama3.2:3b', 'llama3.1:8b', 'mistral:7b', 'phi3:mini', 'gemma2:2b', 'codellama:7b'];
      case 'custom':
        return [];
      default:
        return [];
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
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          padding: '32px',
          borderRadius: '24px 24px 0 0'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{
                color: 'white',
                fontSize: '28px',
                margin: '0 0 8px 0',
                fontWeight: '700'
              }}>
                🤖 AI Model Manager
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.9)',
                fontSize: '14px',
                margin: 0
              }}>
                Add and configure AI providers for ZENO Browser
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                borderRadius: '12px',
                width: '48px',
                height: '48px',
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

        <div style={{ padding: '32px' }}>
          {/* Add New Model Button */}
          {!isAddingModel && (
            <button
              onClick={() => setIsAddingModel(true)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: 'white',
                padding: '16px',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                marginBottom: '24px',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px #10b98140'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 24px #10b98160';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px #10b98140';
              }}
            >
              ➕ Add New AI Model
            </button>
          )}

          {/* Add Model Form */}
          {isAddingModel && (
            <div style={{
              backgroundColor: '#0f172a',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px',
              border: '2px solid #334155'
            }}>
              <h3 style={{ color: 'white', fontSize: '20px', marginTop: 0, marginBottom: '20px', fontWeight: '700' }}>
                Add New AI Model
              </h3>

              {/* Provider Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                  Provider *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                  {['gemini', 'openrouter', 'claude', 'ollama', 'custom'].map(provider => (
                    <button
                      key={provider}
                      onClick={() => setNewModel({ ...newModel, provider: provider as any, model: '' })}
                      style={{
                        backgroundColor: newModel.provider === provider ? getProviderColor(provider) : '#1e293b',
                        border: `2px solid ${newModel.provider === provider ? getProviderColor(provider) : '#334155'}`,
                        color: 'white',
                        padding: '16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>
                        {getProviderIcon(provider)}
                      </div>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Model Name */}
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Model Name *
                  </label>
                  <input
                    type="text"
                    value={newModel.name}
                    onChange={(e) => setNewModel({ ...newModel, name: e.target.value })}
                    placeholder="e.g., My Gemini Pro"
                    style={{
                      width: '100%',
                      backgroundColor: '#1e293b',
                      border: '2px solid #334155',
                      borderRadius: '12px',
                      padding: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = getProviderColor(newModel.provider)}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                  />
                </div>

                {/* Model ID/Version */}
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Model ID *
                  </label>
                  <select
                    value={newModel.model}
                    onChange={(e) => setNewModel({ ...newModel, model: e.target.value })}
                    style={{
                      width: '100%',
                      backgroundColor: '#1e293b',
                      border: '2px solid #334155',
                      borderRadius: '12px',
                      padding: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                    onFocus={(e) => e.target.style.borderColor = getProviderColor(newModel.provider)}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                  >
                    <option value="">Select model...</option>
                    {getDefaultModels(newModel.provider).map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                    {newModel.provider === 'custom' && (
                      <option value="custom">Custom Model</option>
                    )}
                  </select>
                </div>
              </div>

              {/* API Key (not for Ollama) */}
              {newModel.provider !== 'ollama' && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    API Key *
                  </label>
                  <input
                    type="password"
                    value={newModel.apiKey}
                    onChange={(e) => setNewModel({ ...newModel, apiKey: e.target.value })}
                    placeholder="Enter API key..."
                    style={{
                      width: '100%',
                      backgroundColor: '#1e293b',
                      border: '2px solid #334155',
                      borderRadius: '12px',
                      padding: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'monospace'
                    }}
                    onFocus={(e) => e.target.style.borderColor = getProviderColor(newModel.provider)}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                  />
                </div>
              )}

              {/* Ollama Endpoint */}
              {newModel.provider === 'ollama' && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Ollama Server URL *
                  </label>
                  <input
                    type="text"
                    value={newModel.endpoint || 'http://localhost:11434'}
                    onChange={(e) => setNewModel({ ...newModel, endpoint: e.target.value, apiKey: 'local' })}
                    placeholder="http://localhost:11434"
                    style={{
                      width: '100%',
                      backgroundColor: '#1e293b',
                      border: '2px solid #334155',
                      borderRadius: '12px',
                      padding: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'monospace'
                    }}
                    onFocus={(e) => e.target.style.borderColor = getProviderColor(newModel.provider)}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                  />
                  <p style={{ color: '#64748b', fontSize: '12px', marginTop: '6px' }}>
                    💡 Make sure Ollama is running with CORS enabled: <code style={{ color: '#10b981' }}>OLLAMA_ORIGINS=* ollama serve</code>
                  </p>
                </div>
              )}

              {/* Custom Endpoint (for custom provider) */}
              {newModel.provider === 'custom' && (
                <div style={{ marginTop: '16px' }}>
                  <label style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '8px' }}>
                    Custom Endpoint
                  </label>
                  <input
                    type="text"
                    value={newModel.endpoint}
                    onChange={(e) => setNewModel({ ...newModel, endpoint: e.target.value })}
                    placeholder="https://api.example.com/v1"
                    style={{
                      width: '100%',
                      backgroundColor: '#1e293b',
                      border: '2px solid #334155',
                      borderRadius: '12px',
                      padding: '12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      fontFamily: 'monospace'
                    }}
                    onFocus={(e) => e.target.style.borderColor = getProviderColor(newModel.provider)}
                    onBlur={(e) => e.target.style.borderColor = '#334155'}
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={addModel}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: 'white',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 8px 24px #10b98160';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  ✓ Add Model
                </button>
                <button
                  onClick={() => {
                    setIsAddingModel(false);
                    setNewModel({
                      provider: 'gemini',
                      name: '',
                      apiKey: '',
                      model: '',
                      endpoint: ''
                    });
                  }}
                  style={{
                    flex: 1,
                    background: '#334155',
                    border: 'none',
                    color: 'white',
                    padding: '14px',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#475569';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#334155';
                  }}
                >
                  ✕ Cancel
                </button>
              </div>
            </div>
          )}

          {/* Models List */}
          <div>
            <h3 style={{ color: 'white', fontSize: '18px', marginTop: 0, marginBottom: '16px', fontWeight: '700' }}>
              Configured Models ({models.length})
            </h3>

            {models.length === 0 ? (
              <div style={{
                backgroundColor: '#0f172a',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                border: '2px dashed #334155'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                <div style={{ color: '#64748b', fontSize: '16px' }}>
                  No models configured yet. Add your first AI model to get started.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {models.map(model => (
                  <div
                    key={model.id}
                    style={{
                      backgroundColor: '#0f172a',
                      border: `2px solid ${model.isDefault ? getProviderColor(model.provider) : '#334155'}`,
                      borderRadius: '16px',
                      padding: '20px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                        {/* Provider Icon */}
                        <div style={{
                          width: '56px',
                          height: '56px',
                          background: `linear-gradient(135deg, ${getProviderColor(model.provider)}, ${getProviderColor(model.provider)}cc)`,
                          borderRadius: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '32px',
                          flexShrink: 0
                        }}>
                          {getProviderIcon(model.provider)}
                        </div>

                        {/* Model Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <h4 style={{ color: 'white', fontSize: '18px', margin: 0, fontWeight: '700' }}>
                              {model.name}
                            </h4>
                            {model.isDefault && (
                              <span style={{
                                backgroundColor: getProviderColor(model.provider) + '30',
                                border: `1px solid ${getProviderColor(model.provider)}`,
                                color: getProviderColor(model.provider),
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                textTransform: 'uppercase'
                              }}>
                                ★ DEFAULT
                              </span>
                            )}
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>
                            {model.provider.charAt(0).toUpperCase() + model.provider.slice(1)} • {model.model}
                          </div>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 12px',
                              backgroundColor: getStatusColor(model.status) + '20',
                              border: `1px solid ${getStatusColor(model.status)}`,
                              borderRadius: '6px',
                              color: getStatusColor(model.status),
                              fontWeight: '600'
                            }}>
                              <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(model.status)
                              }} />
                              {model.status.toUpperCase()}
                            </div>
                            <div style={{ color: '#64748b', padding: '6px 0' }}>
                              Added: {model.createdAt.toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {!model.isDefault && (
                          <button
                            onClick={() => setDefaultModel(model.id)}
                            style={{
                              background: '#334155',
                              border: 'none',
                              color: 'white',
                              padding: '8px 16px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = getProviderColor(model.provider);
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#334155';
                            }}
                          >
                            ★ Set Default
                          </button>
                        )}
                        <button
                          onClick={() => testModel(model)}
                          style={{
                            background: '#334155',
                            border: 'none',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#10b981';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#334155';
                          }}
                        >
                          🔄 Test
                        </button>
                        <button
                          onClick={() => setSelectedModel(model)}
                          style={{
                            background: '#334155',
                            border: 'none',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#475569';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#334155';
                          }}
                        >
                          ℹ️ Details
                        </button>
                        <button
                          onClick={() => deleteModel(model.id)}
                          style={{
                            background: '#334155',
                            border: 'none',
                            color: 'white',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#334155';
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Model Details Modal */}
        {selectedModel && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              borderRadius: '20px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ color: 'white', fontSize: '22px', margin: 0, fontWeight: '700' }}>
                  Model Details
                </h3>
                <button
                  onClick={() => setSelectedModel(null)}
                  style={{
                    background: '#334155',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '20px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Name
                  </div>
                  <div style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                    {selectedModel.name}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Provider
                  </div>
                  <div style={{ color: 'white', fontSize: '16px', fontWeight: '600' }}>
                    {selectedModel.provider.charAt(0).toUpperCase() + selectedModel.provider.slice(1)}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Model ID
                  </div>
                  <div style={{
                    color: 'white',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    backgroundColor: '#0f172a',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    {selectedModel.model}
                  </div>
                </div>

                <div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    API Key
                  </div>
                  <div style={{
                    color: '#64748b',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    backgroundColor: '#0f172a',
                    padding: '12px',
                    borderRadius: '8px'
                  }}>
                    {selectedModel.apiKey.substring(0, 10)}...{selectedModel.apiKey.substring(selectedModel.apiKey.length - 4)}
                  </div>
                </div>

                {selectedModel.endpoint && (
                  <div>
                    <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>
                      Custom Endpoint
                    </div>
                    <div style={{
                      color: 'white',
                      fontSize: '14px',
                      fontFamily: 'monospace',
                      backgroundColor: '#0f172a',
                      padding: '12px',
                      borderRadius: '8px',
                      wordBreak: 'break-all'
                    }}>
                      {selectedModel.endpoint}
                    </div>
                  </div>
                )}

                <div>
                  <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px', textTransform: 'uppercase' }}>
                    Created
                  </div>
                  <div style={{ color: 'white', fontSize: '14px' }}>
                    {selectedModel.createdAt.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIModelManager;
