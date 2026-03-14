import React, { useState, useEffect } from 'react';

interface AgentStatus {
  id: string;
  role: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  tasksCompleted: number;
  currentTask: string | null;
  uptime: number;
  lastActivity: Date | null;
}

interface AgentStatusPanelProps {
  isMinimized?: boolean;
}

const AgentStatusPanel: React.FC<AgentStatusPanelProps> = ({ isMinimized = false }) => {
  const [agents, setAgents] = useState<AgentStatus[]>([
    {
      id: 'researcher',
      role: 'Expert Researcher',
      status: 'offline',
      tasksCompleted: 0,
      currentTask: null,
      uptime: 0,
      lastActivity: null
    },
    {
      id: 'coder',
      role: 'Senior Software Engineer',
      status: 'offline',
      tasksCompleted: 0,
      currentTask: null,
      uptime: 0,
      lastActivity: null
    },
    {
      id: 'planner',
      role: 'Project Planner',
      status: 'offline',
      tasksCompleted: 0,
      currentTask: null,
      uptime: 0,
      lastActivity: null
    }
  ]);

  const [isExpanded, setIsExpanded] = useState(!isMinimized);

  useEffect(() => {
    // Fetch real agent status from BIELIK_THE_whitie
    const fetchAgentStatus = async () => {
      try {
        // TODO: Replace with actual API call to BIELIK_THE_whitie
        // const response = await fetch('http://localhost:3000/api/business-orchestrator/aggregate-status');
        // const data = await response.json();
        // setAgents(data.statuses);
      } catch (error) {
        console.error('Failed to fetch agent status:', error);
      }
    };

    // Initial fetch
    fetchAgentStatus();

    // Poll every 5 seconds
    const interval = setInterval(fetchAgentStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'idle': return '#f59e0b';
      case 'error': return '#ef4444';
      case 'offline': return '#64748b';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '⚡';
      case 'idle': return '💤';
      case 'error': return '⚠️';
      case 'offline': return '🔴';
      default: return '🔴';
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

  const formatUptime = (seconds: number) => {
    if (seconds === 0) return '0s';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'active').length;
  const offlineAgents = agents.filter(a => a.status === 'offline').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.tasksCompleted, 0);

  if (isMinimized) {
    return (
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          backgroundColor: '#1e293b',
          border: '2px solid #334155',
          borderRadius: '16px',
          padding: '16px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{
              color: 'white',
              fontSize: '16px',
              margin: '0 0 8px 0',
              fontWeight: '600'
            }}>
              🤖 Agent System Status
            </h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
              <span style={{ color: offlineAgents === totalAgents ? '#ef4444' : '#10b981' }}>
                {activeAgents}/{totalAgents} Active
              </span>
              <span style={{ color: offlineAgents === totalAgents ? '#ef4444' : '#64748b' }}>
                {totalTasks} Tasks
              </span>
            </div>
          </div>
          <div style={{
            fontSize: '24px',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}>
            ▼
          </div>
        </div>

        {isExpanded && (
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #334155'
          }}>
            {agents.map(agent => (
              <div
                key={agent.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid #33415530'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>{getAgentIcon(agent.id)}</span>
                  <div>
                    <div style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>
                      {agent.role}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '11px' }}>
                      {agent.tasksCompleted > 0 ? `${agent.tasksCompleted} tasks` : 'No tasks'}
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: agent.status === 'offline' ? '#ef4444' : getStatusColor(agent.status)
                }}>
                  {getStatusIcon(agent.status)}
                  {agent.status === 'offline' && (
                    <span style={{ color: '#ef4444' }}>OFFLINE</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#1e293b',
      border: '2px solid #334155',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{
            color: 'white',
            fontSize: '20px',
            margin: 0,
            fontWeight: '700'
          }}>
            🤖 Agent System Status
          </h2>
          <p style={{
            color: '#94a3b8',
            fontSize: '13px',
            margin: '4px 0 0 0'
          }}>
            Real-time monitoring of BIELIK agents
          </p>
        </div>
        <a
          href="/agents"
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-block',
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
          Manage Agents →
        </a>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          backgroundColor: '#0f172a',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid #334155'
        }}>
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Total Agents</div>
          <div style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>{totalAgents}</div>
        </div>
        <div style={{
          backgroundColor: activeAgents > 0 ? '#10b98120' : '#ef444420',
          borderRadius: '12px',
          padding: '16px',
          border: `1px solid ${activeAgents > 0 ? '#10b981' : '#ef4444'}`
        }}>
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Active</div>
          <div style={{
            color: activeAgents > 0 ? '#10b981' : '#ef4444',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            {activeAgents === 0 ? '0' : activeAgents}
          </div>
        </div>
        <div style={{
          backgroundColor: offlineAgents === totalAgents ? '#ef444420' : '#0f172a',
          borderRadius: '12px',
          padding: '16px',
          border: `1px solid ${offlineAgents === totalAgents ? '#ef4444' : '#334155'}`
        }}>
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Offline</div>
          <div style={{
            color: offlineAgents === totalAgents ? '#ef4444' : 'white',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            {offlineAgents}
          </div>
        </div>
        <div style={{
          backgroundColor: totalTasks > 0 ? '#0f172a' : '#ef444420',
          borderRadius: '12px',
          padding: '16px',
          border: `1px solid ${totalTasks > 0 ? '#334155' : '#ef4444'}`
        }}>
          <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Tasks Done</div>
          <div style={{
            color: totalTasks > 0 ? 'white' : '#ef4444',
            fontSize: '24px',
            fontWeight: '700'
          }}>
            {totalTasks === 0 ? '0' : totalTasks}
          </div>
        </div>
      </div>

      {/* Agent List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {agents.map(agent => (
          <div
            key={agent.id}
            style={{
              backgroundColor: '#0f172a',
              border: `2px solid ${agent.status === 'offline' ? '#ef4444' : '#334155'}`,
              borderRadius: '16px',
              padding: '16px',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                <div style={{
                  fontSize: '32px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: agent.status === 'offline' ? '#33415560' : 'linear-gradient(135deg, #667eea, #764ba2)',
                  borderRadius: '12px'
                }}>
                  {getAgentIcon(agent.id)}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    color: 'white',
                    fontSize: '16px',
                    margin: '0 0 4px 0',
                    fontWeight: '600'
                  }}>
                    {agent.role}
                  </h3>
                  <p style={{
                    color: agent.currentTask ? '#94a3b8' : '#ef4444',
                    fontSize: '13px',
                    margin: '0 0 8px 0'
                  }}>
                    {agent.currentTask || 'No active task'}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                    <span style={{ color: '#64748b' }}>
                      Uptime: <span style={{ color: agent.uptime > 0 ? 'white' : '#ef4444' }}>
                        {agent.uptime === 0 ? '0s' : formatUptime(agent.uptime)}
                      </span>
                    </span>
                    <span style={{ color: '#64748b' }}>
                      Tasks: <span style={{ color: agent.tasksCompleted > 0 ? 'white' : '#ef4444' }}>
                        {agent.tasksCompleted === 0 ? '0' : agent.tasksCompleted}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: agent.status === 'offline' ? '#ef444420' : `${getStatusColor(agent.status)}20`,
                border: `1px solid ${agent.status === 'offline' ? '#ef4444' : getStatusColor(agent.status)}`,
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>{getStatusIcon(agent.status)}</span>
                <span style={{
                  color: agent.status === 'offline' ? '#ef4444' : getStatusColor(agent.status),
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  {agent.status === 'offline' ? 'OFFLINE' : agent.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warning if all offline */}
      {offlineAgents === totalAgents && (
        <div style={{
          marginTop: '16px',
          backgroundColor: '#ef444420',
          border: '2px solid #ef4444',
          borderRadius: '12px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>⚠️</span>
          <div>
            <div style={{ color: '#ef4444', fontWeight: '600', fontSize: '14px' }}>
              All agents are offline
            </div>
            <div style={{ color: '#f87171', fontSize: '12px', marginTop: '4px' }}>
              Go to <a href="/agents" style={{ color: '#ef4444', textDecoration: 'underline' }}>Agents Manager</a> to start the agent system
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentStatusPanel;
