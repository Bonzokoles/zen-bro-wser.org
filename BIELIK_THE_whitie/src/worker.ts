/**
 * Cloudflare Workers Entry Point for BIELIK Agent System
 * ES Module format required by Workers
 * 
 * NOTE: This is a minimal implementation for deployment testing.
 * Full agent functionality requires adapting Node.js-specific code.
 */

interface Env {
    OPENAI_API_KEY?: string;
    GOOGLE_GEMINI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    TAVILY_API_KEY?: string;
    ENVIRONMENT?: string;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': env.ENVIRONMENT === 'production'
                ? 'https://zeno-browser.pages.dev'
                : '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        try {
            // Health check endpoint
            if (url.pathname === '/status' || url.pathname === '/') {
                return Response.json({
                    status: 'ok',
                    service: 'BIELIK Agent System',
                    version: '0.1.0',
                    environment: env.ENVIRONMENT,
                    timestamp: new Date().toISOString(),
                    note: 'Minimal implementation - full agent system requires Node.js runtime',
                }, { headers: corsHeaders });
            }

            // List available agents
            if (url.pathname === '/agents' && request.method === 'GET') {
                return Response.json({
                    agents: [
                        { id: 'researcher', name: 'Research Agent', status: 'planned' },
                        { id: 'coder', name: 'Code Agent', status: 'planned' },
                        { id: 'planner', name: 'Planning Agent', status: 'planned' },
                        { id: 'quality-checker', name: 'Quality Checker', status: 'planned' },
                    ],
                    note: 'Agent execution requires full Node.js runtime',
                }, { headers: corsHeaders });
            }

            // Tools endpoint
            if (url.pathname === '/tools' && request.method === 'GET') {
                return Response.json({
                    tools: [
                        'web_search',
                        'file_write',
                        'file_read',
                        'code_executor',
                    ],
                    note: 'Tool execution requires adaptation for Workers runtime',
                }, { headers: corsHeaders });
            }

            // 404 for unknown routes
            return Response.json({
                error: 'Not Found',
                path: url.pathname,
                availableEndpoints: ['/', '/status', '/agents', '/tools'],
            }, {
                status: 404,
                headers: corsHeaders
            });

        } catch (error) {
            console.error('Worker error:', error);
            return Response.json({
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Unknown error',
            }, {
                status: 500,
                headers: corsHeaders
            });
        }
    },
};
