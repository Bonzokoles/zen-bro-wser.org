/**
 * API Endpoint: GET /api/agents/status
 * Returns current status of all BIELIK agents
 */

import type { APIRoute } from 'astro';

export interface AgentStatus {
    id: string;
    status: 'active' | 'idle' | 'error' | 'offline';
    role: string;
    tasks: number;
    lastActivity: string;
    uptime: number; // seconds
}

export const GET: APIRoute = async ({ request }) => {
    try {
        // TODO: Replace with actual BIELIK API call when deployed
        // const bielikApiUrl = import.meta.env.VITE_BIELIK_API_URL || 'https://zeno-bielik-agents.stolarnia-ams.workers.dev';
        // const response = await fetch(`${bielikApiUrl}/status`);
        // const data = await response.json();

        // Mock data for now - will be replaced with real BIELIK connection
        const mockAgents: AgentStatus[] = [
            {
                id: 'researcher',
                status: 'offline', // Changed from 'active' to show real state
                role: 'Expert Researcher',
                tasks: 0, // Changed from fake number
                lastActivity: new Date().toISOString(),
                uptime: 0,
            },
            {
                id: 'coder',
                status: 'offline',
                role: 'Senior Developer',
                tasks: 0,
                lastActivity: new Date().toISOString(),
                uptime: 0,
            },
            {
                id: 'planner',
                status: 'offline',
                role: 'Strategic Planner',
                tasks: 0,
                lastActivity: new Date().toISOString(),
                uptime: 0,
            },
        ];

        return new Response(
            JSON.stringify({
                success: true,
                timestamp: new Date().toISOString(),
                agents: mockAgents,
                systemStatus: 'offline', // BIELIK not deployed yet
                message: 'BIELIK agent system not yet connected. Deploy to Cloudflare Workers to activate.',
            }),
            {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                },
            }
        );
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
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
};
