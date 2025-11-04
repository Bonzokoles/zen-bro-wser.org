import React, { useState, useEffect } from 'react';

interface Agent {
  id: string;
  role: string;
  version: string;
  systemPrompt: string;
  modelId: string;
  toolIds: string[];
  capabilities: string[];
  status: 'active' | 'idle' | 'error' | 'offline';
  tasksCompleted: number;
  currentTask: string | null;
  uptime: number;
}

const AgentsManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<'online' | 'offline'>('offline');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    loadAgents();
    checkSystemStatus();

    // Poll for updates every 3 seconds
    const interval = setInterval(() => {
      loadAgents();
      checkSystemStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const loadAgents = async () => {
    try {
      // TODO: Replace with actual API call to BIELIK_THE_whitie
      // const response = await fetch('http://localhost:3000/api/agents');
      // const data = await response.json();
      
      // Mock data for now
      const mockAgents: Agent[] = [
        {
          id: 'researcher',
          role: 'Expert Researcher',
          version: '1.0.0',
          systemPrompt: 'You are an expert researcher...',
          modelId: 'gpt-4o',
          toolIds: ['web_search', 'file_write'],
          capabilities: ['web-scraping', 'data-synthesis', 'reporting'],
          status: 'offline',
          tasksCompleted: 0,
          currentTask: null,
          uptime: 0
        },
        {
          id: 'coder',
          role: 'Senior Software Engineer',
          version: '1.0.0',
          systemPrompt: 'You are a senior software engineer...',
          modelId: 'local-llama3',
          toolIds: ['file_read', 'file_write', 'code_linter'],
          capabilities: ['code-generation', 'debugging', 'code-review'],
          status: 'offline',
          tasksCompleted: 0,
          currentTask: null,
          uptime: 0
        },
        {
          id: 'planner',
          role: 'Project Planner',
          version: '1.0.0',
          systemPrompt: 'You are a project planner...',
          modelId: 'gemini-1.5-pro',
          toolIds: [],
          capabilities: ['task-decomposition', 'step-by-step-planning'],
          status: 'offline',
          tasksCompleted: 0,
          currentTask: null,
          uptime: 0
        }
      ];

      setAgents(mockAgents);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load agents:', error);
      addLog('ERROR: Failed to load agents');
      setIsLoading(false);
    }
  };

  const checkSystemStatus = async () => {
    try {
      // TODO: Replace with actual health check
      // const response = await fetch('http://localhost:3000/health');
      // setSystemStatus(response.ok ? 'online' : 'offline');
      setSystemStatus('offline');
    } catch (error) {
      setSystemStatus('offline');
    }
  };

  const startAgent = async (agentId: string) => {
    try {
      addLog(`Starting agent: ${agentId}...`);
      // TODO: API call to start agent
      // await fetch(`http://localhost:3000/api/agents/${agentId}/start`, { method: 'POST' });
      addLog(`ERROR: Agent system not running. Start BIELIK_THE_whitie first.`);
    } catch (error) {
      addLog(`ERROR: Failed to start agent ${agentId}`);
    }
  };

  const stopAgent = async (agentId: string) => {
    try {
      addLog(`Stopping agent: ${agentId}...`);
      // TODO: API call to stop agent
      // await fetch(`http://localhost:3000/api/agents/${agentId}/stop`, { method: 'POST' });
      addLog(`Agent ${agentId} stopped`);
    } catch (error) {
      addLog(`ERROR: Failed to stop agent ${agentId}`);
    }
  };

  const startAllAgents = async () => {
    addLog('Starting all agents...');
    for (const agent of agents) {
      await startAgent(agent.id);
    }
  };

  const stopAllAgents = async () => {
    addLog('Stopping all agents...');
    for (const agent of agents) {
      if (agent.status !== 'offline') {
        await stopAgent(agent.id);
      }
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 99)]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'idle': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'offline': return '#64748b';
      default: return '#64748b';
    }
  };

  const getAgentIcon = (id: string) => {
    switch (id) {
      case 'researcher': return '🔍';
      case 'coder': return '💻';
      case 'planner': return '📋';
      default: return '🤖';
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
          <div style={{ fontSize: '20px' }}>Loading agents...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h1 style={{
                color: 'white',
                fontSize: '32px',
                margin: '0 0 8px 0',
                fontWeight: '700'
              }}>
                🤖 BIELIK Agents Manager
              </h1>
              <p style={{
                color: '#94a3b8',
                fontSize: '16px',
                margin: 0
              }}>
                Manage and monitor your AI agent system
              </p>
            </div>
            <a
              href="/"
              style={{
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 24px #667eea60';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              ← Back to Browser
            </a>
          </div>

          {/* System Status Banner */}
          <div style={{
            backgroundColor: systemStatus === 'online' ? '#10b98120' : '#ef444420',
            border: `2px solid ${systemStatus === 'online' ? '#10b981' : '#ef4444'}`,
            borderRadius: '16px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: systemStatus === 'online' ? '#10b981' : '#ef4444',
                boxShadow: `0 0 16px ${systemStatus === 'online' ? '#10b981' : '#ef4444'}`
              }} />
              <div>
                <div style={{
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: '700',
                  marginBottom: '4px'
                }}>
                  Agent System: {systemStatus === 'online' ? 'ONLINE' : 'OFFLINE'}
                </div>
                <div style={{ color: '#94a3b8', fontSize: '14px' }}>
                  {systemStatus === 'online' 
                    ? 'All systems operational'
                    : 'Start BIELIK_THE_whitie backend to enable agents'
                  }
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={startAllAgents}
                disabled={systemStatus === 'offline'}
                style={{
                  background: systemStatus === 'offline' ? '#33415560' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: systemStatus === 'offline' ? 'not-allowed' : 'pointer',
                  opacity: systemStatus === 'offline' ? 0.5 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                ▶ Start All
              </button>
              <button
                onClick={stopAllAgents}
                disabled={systemStatus === 'offline'}
                style={{
                  background: systemStatus === 'offline' ? '#33415560' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: systemStatus === 'offline' ? 'not-allowed' : 'pointer',
                  opacity: systemStatus === 'offline' ? 0.5 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                ■ Stop All
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedAgent ? '1fr 400px' : '1fr', gap: '24px' }}>
          {/* Agents Grid */}
          <div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '20px'
            }}>
              {agents.map(agent => (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  style={{
                    backgroundColor: '#1e293b',
                    border: `2px solid ${agent.status === 'offline' ? '#ef4444' : '#334155'}`,
                    borderRadius: '20px',
                    padding: '24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Agent Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{
                        fontSize: '40px',
                        width: '60px',
                        height: '60px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: agent.status === 'offline' ? '#33415560' : 'linear-gradient(135deg, #667eea, #764ba2)',
                        borderRadius: '16px'
                      }}>
                        {getAgentIcon(agent.id)}
                      </div>
                      <div>
                        <h3 style={{
                          color: 'white',
                          fontSize: '18px',
                          margin: '0 0 4px 0',
                          fontWeight: '700'
                        }}>
                          {agent.role}
                        </h3>
                        <div style={{ color: '#64748b', fontSize: '12px' }}>
                          v{agent.version} • {agent.modelId}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 12px',
                      backgroundColor: agent.status === 'offline' ? '#ef444420' : `${getStatusColor(agent.status)}20`,
                      border: `1px solid ${agent.status === 'offline' ? '#ef4444' : getStatusColor(agent.status)}`,
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: agent.status === 'offline' ? '#ef4444' : getStatusColor(agent.status),
                      textTransform: 'uppercase'
                    }}>
                      {agent.status === 'offline' ? 'OFFLINE' : agent.status}
                    </div>
                  </div>

                  {/* Current Task */}
                  <div style={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    padding: '12px',
                    marginBottom: '16px',
                    minHeight: '50px'
                  }}>
                    <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Current Task
                    </div>
                    <div style={{ color: agent.currentTask ? 'white' : '#ef4444', fontSize: '13px' }}>
                      {agent.currentTask || 'No active task'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>Tasks Completed</div>
                      <div style={{
                        color: agent.tasksCompleted > 0 ? 'white' : '#ef4444',
                        fontSize: '20px',
                        fontWeight: '700'
                      }}>
                        {agent.tasksCompleted === 0 ? '0' : agent.tasksCompleted}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '4px' }}>Uptime</div>
                      <div style={{
                        color: agent.uptime > 0 ? 'white' : '#ef4444',
                        fontSize: '20px',
                        fontWeight: '700'
                      }}>
                        {agent.uptime === 0 ? '0s' : `${agent.uptime}s`}
                      </div>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ color: '#64748b', fontSize: '11px', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Capabilities
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {agent.capabilities.map(cap => (
                        <span
                          key={cap}
                          style={{
                            backgroundColor: '#334155',
                            color: '#94a3b8',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {agent.status === 'offline' ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startAgent(agent.id);
                        }}
                        disabled={systemStatus === 'offline'}
                        style={{
                          flex: 1,
                          background: systemStatus === 'offline' ? '#33415560' : 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          color: 'white',
                          padding: '10px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: systemStatus === 'offline' ? 'not-allowed' : 'pointer',
                          opacity: systemStatus === 'offline' ? 0.5 : 1
                        }}
                      >
                        ▶ Start
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          stopAgent(agent.id);
                        }}
                        style={{
                          flex: 1,
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          border: 'none',
                          color: 'white',
                          padding: '10px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ■ Stop
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAgent(agent);
                      }}
                      style={{
                        background: '#334155',
                        border: 'none',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Details Sidebar */}
          {selectedAgent && (
            <div style={{
              backgroundColor: '#1e293b',
              borderRadius: '20px',
              padding: '24px',
              height: 'fit-content',
              position: 'sticky',
              top: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: 'white', fontSize: '18px', margin: 0, fontWeight: '700' }}>
                  Agent Details
                </h3>
                <button
                  onClick={() => setSelectedAgent(null)}
                  style={{
                    background: '#334155',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '20px',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '16px' }}>
                {getAgentIcon(selectedAgent.id)}
              </div>

              <div style={{ color: 'white', fontSize: '20px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>
                {selectedAgent.role}
              </div>

              <div style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', marginBottom: '20px' }}>
                {selectedAgent.id} • v{selectedAgent.version}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>
                  System Prompt
                </div>
                <div style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#94a3b8',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  {selectedAgent.systemPrompt}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Model
                </div>
                <div style={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  padding: '12px',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  {selectedAgent.modelId}
                </div>
              </div>

              <div>
                <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Tools ({selectedAgent.toolIds.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedAgent.toolIds.length > 0 ? (
                    selectedAgent.toolIds.map(tool => (
                      <div
                        key={tool}
                        style={{
                          backgroundColor: '#0f172a',
                          borderRadius: '8px',
                          padding: '10px',
                          color: '#94a3b8',
                          fontSize: '13px',
                          fontFamily: 'monospace'
                        }}
                      >
                        {tool}
                      </div>
                    ))
                  ) : (
                    <div style={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#64748b',
                      fontSize: '13px',
                      textAlign: 'center',
                      fontStyle: 'italic'
                    }}>
                      No tools configured
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Activity Logs */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '20px',
          padding: '24px',
          marginTop: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ color: 'white', fontSize: '18px', margin: 0, fontWeight: '700' }}>
              📋 Activity Logs
            </h3>
            <button
              onClick={() => setLogs([])}
              style={{
                background: '#334155',
                border: 'none',
                color: '#94a3b8',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Clear Logs
            </button>
          </div>
          <div style={{
            backgroundColor: '#0f172a',
            borderRadius: '12px',
            padding: '16px',
            maxHeight: '300px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            {logs.length === 0 ? (
              <div style={{ color: '#64748b', textAlign: 'center', fontStyle: 'italic' }}>
                No activity logs yet
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    color: log.includes('ERROR') ? '#ef4444' : '#94a3b8',
                    marginBottom: '4px',
                    paddingBottom: '4px',
                    borderBottom: i < logs.length - 1 ? '1px solid #334155' : 'none'
                  }}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentsManager;
