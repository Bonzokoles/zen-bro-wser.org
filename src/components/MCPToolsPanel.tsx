import React, { useState, useEffect } from 'react';
import { mcpService } from '../services/mcpService';
import type { MCPTool } from '../services/mcpService';

interface MCPToolsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const MCPToolsPanel: React.FC<MCPToolsPanelProps> = ({ isOpen, onClose }) => {
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTools();
      setIsConnected(mcpService.isConnected());
    }
  }, [isOpen]);

  const loadTools = () => {
    const mcpTools = mcpService.getTools();
    setTools(mcpTools);
  };

  const handleToggleTool = (toolId: string) => {
    const newState = mcpService.toggleTool(toolId);
    loadTools();
    console.log(`Tool ${toolId} ${newState ? 'enabled' : 'disabled'}`);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'browser': return '#667eea';
      case 'search': return '#10b981';
      case 'analysis': return '#f59e0b';
      case 'utility': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'browser': return '🌐';
      case 'search': return '🔍';
      case 'analysis': return '📊';
      case 'utility': return '🔧';
      default: return '⚙️';
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
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{
              color: 'white',
              fontSize: '24px',
              margin: 0,
              fontWeight: '700'
            }}>🔧 MCP Tools Manager</h2>
            <p style={{
              color: '#94a3b8',
              fontSize: '14px',
              margin: '8px 0 0 0'
            }}>
              Enable or disable Model Context Protocol tools
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#334155',
              border: 'none',
              color: '#94a3b8',
              fontSize: '24px',
              cursor: 'pointer',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#475569';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#334155';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            ✕
          </button>
        </div>

        {/* Connection Status */}
        <div style={{
          backgroundColor: isConnected ? '#10b98120' : '#ef444420',
          border: `2px solid ${isConnected ? '#10b981' : '#ef4444'}`,
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#10b981' : '#ef4444',
            boxShadow: `0 0 10px ${isConnected ? '#10b981' : '#ef4444'}`
          }} />
          <div>
            <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
              {isConnected ? 'MCP Service Connected' : 'MCP Service Disconnected'}
            </div>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>
              {isConnected 
                ? `Provider: ${mcpService.getCurrentProvider() || 'Unknown'}`
                : 'Configure settings to connect'
              }
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          {tools.map(tool => (
            <div
              key={tool.id}
              style={{
                backgroundColor: tool.enabled ? `${getCategoryColor(tool.category)}20` : '#0f172a',
                border: `2px solid ${tool.enabled ? getCategoryColor(tool.category) : '#334155'}`,
                borderRadius: '16px',
                padding: '20px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => handleToggleTool(tool.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${getCategoryColor(tool.category)}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Tool Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  fontSize: '32px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: tool.enabled 
                    ? `linear-gradient(135deg, ${getCategoryColor(tool.category)}, ${getCategoryColor(tool.category)}cc)`
                    : '#334155',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}>
                  {getCategoryIcon(tool.category)}
                </div>
                
                {/* Toggle Switch */}
                <div style={{
                  width: '48px',
                  height: '24px',
                  backgroundColor: tool.enabled ? getCategoryColor(tool.category) : '#475569',
                  borderRadius: '12px',
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  boxShadow: tool.enabled ? `0 0 10px ${getCategoryColor(tool.category)}60` : 'none'
                }}>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '3px',
                    left: tool.enabled ? '27px' : '3px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
              </div>

              {/* Tool Info */}
              <div>
                <h3 style={{
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 8px 0'
                }}>
                  {tool.name}
                </h3>
                <p style={{
                  color: '#94a3b8',
                  fontSize: '13px',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {tool.description}
                </p>
                
                {/* Category Badge */}
                <div style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  padding: '4px 12px',
                  backgroundColor: tool.enabled ? `${getCategoryColor(tool.category)}30` : '#33415530',
                  border: `1px solid ${tool.enabled ? getCategoryColor(tool.category) : '#334155'}`,
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: tool.enabled ? getCategoryColor(tool.category) : '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {tool.category}
                </div>
              </div>

              {/* Status Indicator */}
              <div style={{
                marginTop: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: tool.enabled ? '#10b981' : '#ef4444'
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: tool.enabled ? '#10b981' : '#ef4444'
                }} />
                {tool.enabled ? 'ENABLED' : 'DISABLED'}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ color: '#64748b', fontSize: '13px' }}>
            {tools.filter(t => t.enabled).length} of {tools.length} tools enabled
          </div>
          <button
            onClick={() => {
              // Enable all tools
              tools.forEach(tool => {
                if (!tool.enabled) {
                  mcpService.toggleTool(tool.id);
                }
              });
              loadTools();
            }}
            style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 6px 20px #667eea60';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Enable All Tools
          </button>
        </div>
      </div>
    </div>
  );
};

export default MCPToolsPanel;
