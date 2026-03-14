/**
 * API Endpoint: POST /api/agents/execute
 * Execute a task using BIELIK agent system
 */

import type { APIRoute } from 'astro';

export interface AgentTaskRequest {
    agentId: string; // 'researcher' | 'coder' | 'planner'
    task: {
        description: string;
        priority?: 'low' | 'medium' | 'high';
        context?: Record<string, any>;
    };
}

export interface AgentTaskResponse {
    success: boolean;
    taskId: string;
    agentId: string;
    status: 'queued' | 'running' | 'completed' | 'error';
    result?: string;
    error?: string;
    timestamp: string;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const body: AgentTaskRequest = await request.json();

        // Validate request
        if (!body.agentId || !body.task?.description) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Missing required fields: agentId and task.description',
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // Validate agentId
        const validAgents = ['researcher', 'coder', 'planner'];
        if (!validAgents.includes(body.agentId)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: `Invalid agentId. Must be one of: ${validAgents.join(', ')}`,
                }),
                {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                }
            );
        }

        // TODO: Replace with actual BIELIK API call when deployed
        // const bielikApiUrl = import.meta.env.VITE_BIELIK_API_URL || 'https://zeno-bielik-agents.stolarnia-ams.workers.dev';
        // const response = await fetch(`${bielikApiUrl}/execute`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(body),
        // });
        // const data = await response.json();

        // Mock response for now
        const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const mockResponse: AgentTaskResponse = {
            success: true,
            taskId,
            agentId: body.agentId,
            status: 'queued',
            timestamp: new Date().toISOString(),
            result: 'Task queued. BIELIK agent system not yet deployed to Cloudflare Workers.',
        };

        return new Response(JSON.stringify(mockResponse), {
            status: 202, // Accepted
            headers: {
                'Content-Type': 'application/json',
                'Location': `/api/agents/tasks/${taskId}`,
            },
        });
    } catch (error) {
        const err = error as Error;
        return new Response(
            JSON.stringify({
                success: false,
                error: err.message,
                timestamp: new Date().toISOString(),
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
};
