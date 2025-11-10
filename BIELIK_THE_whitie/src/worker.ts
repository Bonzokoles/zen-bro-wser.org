/**
 * Cloudflare Worker Entry Point for BIELIK Agent System
 * 
 * Provides REST API endpoints for agent orchestration:
 * - POST /execute - Execute a task with an agent
 * - GET /status - Get system status
 * - GET /agents - List available agents
 * - POST /api/business-orchestrator/route-task - Route and orchestrate tasks
 * - GET /api/business-orchestrator/aggregate-status - Get all agents status
 * - POST /api/business-orchestrator/decision - Make AI-driven decisions
 * - GET /api/business-orchestrator/audit - Get audit logs
 */

import { AgentManager } from './core/AgentManager';
import { Task } from './tasks/Task';

// Environment interface for Cloudflare Workers
interface Env {
  // KV namespace for agent state
  AGENT_STATE?: KVNamespace;
  
  // D1 database for logs and state
  DB?: D1Database;
  
  // Environment variables
  ENVIRONMENT?: string;
  API_VERSION?: string;
  ALLOWED_ORIGINS?: string;
  
  // API Keys (set via wrangler secret)
  OPENAI_API_KEY?: string;
  GOOGLE_GEMINI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  TAVILY_API_KEY?: string;
}

// CORS headers helper
function corsHeaders(origin?: string, allowedOrigins = '*'): HeadersInit {
  const headers: HeadersInit = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
  
  if (allowedOrigins === '*') {
    headers['Access-Control-Allow-Origin'] = '*';
  } else if (origin) {
    const allowed = allowedOrigins.split(',').map(o => o.trim());
    if (allowed.includes(origin)) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  }
  
  return headers;
}

// JSON response helper
function jsonResponse(data: any, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });
}

// Error response helper
function errorResponse(message: string, status = 500, headers: HeadersInit = {}): Response {
  return jsonResponse({ error: message }, status, headers);
}

// Global agent manager instance (cached across requests)
let agentManager: AgentManager | null = null;

// Initialize agent manager (lazy initialization)
async function getAgentManager(): Promise<AgentManager> {
  if (!agentManager) {
    agentManager = new AgentManager();
    await agentManager.loadConfig();
  }
  return agentManager;
}

// Main Worker handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowedOrigins = env.ALLOWED_ORIGINS || '*';
    const headers = corsHeaders(origin || undefined, allowedOrigins);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    try {
      // Route to appropriate handler
      const path = url.pathname;
      
      // Health check endpoint
      if (path === '/' || path === '/status' || path === '/health') {
        return jsonResponse({
          status: 'ok',
          service: 'BIELIK Agent System',
          environment: env.ENVIRONMENT || 'production',
          version: env.API_VERSION || 'v1',
          timestamp: new Date().toISOString(),
        }, 200, headers);
      }
      
      // List available agents
      if (path === '/agents' && request.method === 'GET') {
        const manager = await getAgentManager();
        const agents = manager.listAgents();
        return jsonResponse({
          success: true,
          agents,
          count: agents.length,
        }, 200, headers);
      }
      
      // Execute a task
      if (path === '/execute' && request.method === 'POST') {
        const manager = await getAgentManager();
        const body = await request.json() as {
          taskId?: string;
          description: string;
          agentId: string;
        };
        
        if (!body.description || !body.agentId) {
          return errorResponse('Missing required fields: description, agentId', 400, headers);
        }
        
        const taskId = body.taskId || `task-${Date.now()}`;
        const task = new Task(taskId, body.description, body.agentId);
        
        const result = await manager.executeTask(task);
        
        return jsonResponse({
          success: true,
          taskId: task.id,
          status: task.status,
          result,
        }, 200, headers);
      }
      
      // Business Orchestrator Endpoints
      
      // POST /api/business-orchestrator/route-task
      if (path === '/api/business-orchestrator/route-task' && request.method === 'POST') {
        const manager = await getAgentManager();
        const body = await request.json() as {
          command: string;
          context?: any;
          data?: any;
        };
        
        if (!body.command) {
          return errorResponse('Missing required field: command', 400, headers);
        }
        
        // For now, route to first available agent
        // TODO: Implement Bielik LLM-based routing logic
        const agents = manager.listAgents();
        if (agents.length === 0) {
          return errorResponse('No agents available', 503, headers);
        }
        
        const taskId = `route-${Date.now()}`;
        const task = new Task(taskId, body.command, agents[0].id);
        
        try {
          const result = await manager.executeTask(task);
          
          return jsonResponse({
            success: true,
            taskId: task.id,
            plan: {
              agents: [agents[0].id],
              tasks: { [agents[0].id]: body.command },
            },
            agentResponses: [{
              agent: agents[0].id,
              result,
            }],
          }, 200, headers);
        } catch (error: any) {
          return errorResponse(`Task execution failed: ${error.message}`, 500, headers);
        }
      }
      
      // GET /api/business-orchestrator/aggregate-status
      if (path === '/api/business-orchestrator/aggregate-status' && request.method === 'GET') {
        const manager = await getAgentManager();
        const agents = manager.listAgents();
        
        const statuses = agents.map(agent => ({
          agent: agent.id,
          status: 'ready',
          role: agent.role,
          capabilities: agent.capabilities,
          modelId: agent.modelId,
        }));
        
        return jsonResponse({
          success: true,
          statuses,
          timestamp: new Date().toISOString(),
        }, 200, headers);
      }
      
      // POST /api/business-orchestrator/decision
      if (path === '/api/business-orchestrator/decision' && request.method === 'POST') {
        const body = await request.json() as {
          inputs: any;
          context?: any;
        };
        
        if (!body.inputs) {
          return errorResponse('Missing required field: inputs', 400, headers);
        }
        
        // TODO: Implement Bielik LLM-based decision making
        // For now, return a simple decision
        return jsonResponse({
          success: true,
          decision: 'proceed',
          explanation: 'Decision logic not yet implemented. Using default policy.',
          timestamp: new Date().toISOString(),
        }, 200, headers);
      }
      
      // GET /api/business-orchestrator/audit
      if (path === '/api/business-orchestrator/audit' && request.method === 'GET') {
        // TODO: Implement audit log retrieval from D1 database
        // For now, return empty logs
        return jsonResponse({
          success: true,
          logs: [],
          message: 'Audit logging not yet implemented',
          timestamp: new Date().toISOString(),
        }, 200, headers);
      }
      
      // 404 for unknown routes
      return errorResponse('Not found', 404, headers);
      
    } catch (error: any) {
      console.error('Worker error:', error);
      return errorResponse(
        `Internal server error: ${error.message}`,
        500,
        headers
      );
    }
  },
};
