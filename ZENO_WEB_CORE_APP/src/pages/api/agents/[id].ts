/**
 * API Endpoint: GET /api/agents/[id]
 * Get details of a specific BIELIK agent
 */

import type { APIRoute } from 'astro';

export interface AgentDetails {
    id: string;
    role: string;
    status: 'active' | 'idle' | 'error' | 'offline';
    capabilities: string[];
    modelId: string;
    toolIds: string[];
    systemPrompt: string;
    currentTasks: number;
    completedTasks: number;
    averageTaskDuration: number; // seconds
    lastActivity: string;
    uptime: number; // seconds
}

export const GET: APIRoute = async ({ params }) => {
    const { id } = params;

    if (!id) {
        return new Response(
            JSON.stringify({
                success: false,
                error: 'Agent ID is required',
            }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    // Agent configurations (matching BIELIK_THE_whitie/src/config/agents.config.ts)
    const agentConfigs: Record<string, AgentDetails> = {
        researcher: {
            id: 'researcher',
            role: 'Expert Researcher',
            status: 'offline',
            capabilities: ['web-scraping', 'data-synthesis', 'fact-checking', 'source-validation'],
            modelId: 'gpt-4o', // or gemini-1.5-pro
            toolIds: ['web_search', 'file_read', 'file_write'],
            systemPrompt: 'You are an expert researcher specialized in gathering, analyzing, and synthesizing information from various sources.',
            currentTasks: 0,
            completedTasks: 0,
            averageTaskDuration: 0,
            lastActivity: new Date().toISOString(),
            uptime: 0,
        },
        coder: {
            id: 'coder',
            role: 'Senior Developer',
            status: 'offline',
            capabilities: ['code-generation', 'debugging', 'refactoring', 'testing'],
            modelId: 'gpt-4o',
            toolIds: ['file_read', 'file_write', 'execute_code'],
            systemPrompt: 'You are a senior software developer specialized in writing clean, efficient, and well-documented code.',
            currentTasks: 0,
            completedTasks: 0,
            averageTaskDuration: 0,
            lastActivity: new Date().toISOString(),
            uptime: 0,
        },
        planner: {
            id: 'planner',
            role: 'Strategic Planner',
            status: 'offline',
            capabilities: ['task-breakdown', 'resource-allocation', 'timeline-estimation', 'risk-assessment'],
            modelId: 'gpt-4o',
            toolIds: ['file_read', 'file_write'],
            systemPrompt: 'You are a strategic planner specialized in breaking down complex projects into actionable tasks.',
            currentTasks: 0,
            completedTasks: 0,
            averageTaskDuration: 0,
            lastActivity: new Date().toISOString(),
            uptime: 0,
        },
    };

    const agent = agentConfigs[id];

    if (!agent) {
        return new Response(
            JSON.stringify({
                success: false,
                error: `Agent with ID '${id}' not found. Available agents: ${Object.keys(agentConfigs).join(', ')}`,
            }),
            {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }

    // TODO: Replace with actual BIELIK API call when deployed
    // const bielikApiUrl = import.meta.env.VITE_BIELIK_API_URL || 'https://zeno-bielik-agents.stolarnia-ams.workers.dev';
    // const response = await fetch(`${bielikApiUrl}/agents/${id}`);
    // const data = await response.json();

    return new Response(
        JSON.stringify({
            success: true,
            agent,
            message: 'BIELIK agent system not yet connected. Data shown is from static configuration.',
            timestamp: new Date().toISOString(),
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        }
    );
};
