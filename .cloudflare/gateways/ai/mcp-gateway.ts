/**
 * MCP Gateway - Model Context Protocol integration
 * Tool execution, resource management, prompts
 */

interface Env {
	MCP_API_BASE: string;
	CACHE: KVNamespace;
	DB: D1Database;
}

interface MCPTool {
	name: string;
	description: string;
	inputSchema: any;
}

interface MCPToolCall {
	tool: string;
	arguments: Record<string, any>;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			if (url.pathname === '/mcp/tools') {
				return handleListTools(env, corsHeaders);
			}

			if (url.pathname === '/mcp/tools/execute') {
				return handleExecuteTool(request, env, ctx, corsHeaders);
			}

			if (url.pathname === '/mcp/resources') {
				return handleListResources(env, corsHeaders);
			}

			if (url.pathname === '/mcp/prompts') {
				return handleListPrompts(env, corsHeaders);
			}

			return jsonResponse({
				success: false,
				error: 'Nieznany endpoint MCP'
			}, 404, corsHeaders);

		} catch (error) {
			return jsonResponse({
				success: false,
				error: error instanceof Error ? error.message : 'Błąd serwera'
			}, 500, corsHeaders);
		}
	}
};

async function handleListTools(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	// Cache tools list
	const cached = await env.CACHE.get('mcp:tools', 'json');
	if (cached) {
		return jsonResponse({
			success: true,
			data: cached,
			cached: true
		}, 200, corsHeaders);
	}

	// Fetch from MCP server
	const response = await fetch(`${env.MCP_API_BASE}/mcp/tools`, {
		headers: {
			'Accept': 'application/json'
		}
	});

	if (!response.ok) {
		return jsonResponse({
			success: false,
			error: 'Błąd pobierania narzędzi MCP'
		}, response.status, corsHeaders);
	}

	const tools = await response.json();

	// Cache for 5 minutes
	await env.CACHE.put('mcp:tools', JSON.stringify(tools), {
		expirationTtl: 300
	});

	return jsonResponse({
		success: true,
		data: tools
	}, 200, corsHeaders);
}

async function handleExecuteTool(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
	corsHeaders: Record<string, string>
): Promise<Response> {
	const body = await request.json() as MCPToolCall;

	if (!body.tool || !body.arguments) {
		return jsonResponse({
			success: false,
			error: 'Brak wymaganych pól: tool, arguments'
		}, 400, corsHeaders);
	}

	// Log execution
	ctx.waitUntil(
		env.DB.prepare(
			'INSERT INTO mcp_executions (tool_name, arguments, created_at) VALUES (?, ?, ?)'
		).bind(
			body.tool,
			JSON.stringify(body.arguments),
			new Date().toISOString()
		).run()
	);

	// Execute tool via MCP server
	const response = await fetch(`${env.MCP_API_BASE}/mcp/tools/execute`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(body)
	});

	if (!response.ok) {
		const error = await response.text();
		return jsonResponse({
			success: false,
			error: `Błąd wykonania narzędzia: ${error}`
		}, response.status, corsHeaders);
	}

	const result = await response.json();

	return jsonResponse({
		success: true,
		data: result
	}, 200, corsHeaders);
}

async function handleListResources(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const cached = await env.CACHE.get('mcp:resources', 'json');
	if (cached) {
		return jsonResponse({
			success: true,
			data: cached,
			cached: true
		}, 200, corsHeaders);
	}

	const response = await fetch(`${env.MCP_API_BASE}/mcp/resources`);

	if (!response.ok) {
		return jsonResponse({
			success: false,
			error: 'Błąd pobierania zasobów MCP'
		}, response.status, corsHeaders);
	}

	const resources = await response.json();

	await env.CACHE.put('mcp:resources', JSON.stringify(resources), {
		expirationTtl: 300
	});

	return jsonResponse({
		success: true,
		data: resources
	}, 200, corsHeaders);
}

async function handleListPrompts(env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const cached = await env.CACHE.get('mcp:prompts', 'json');
	if (cached) {
		return jsonResponse({
			success: true,
			data: cached,
			cached: true
		}, 200, corsHeaders);
	}

	const response = await fetch(`${env.MCP_API_BASE}/mcp/prompts`);

	if (!response.ok) {
		return jsonResponse({
			success: false,
			error: 'Błąd pobierania promptów MCP'
		}, response.status, corsHeaders);
	}

	const prompts = await response.json();

	await env.CACHE.put('mcp:prompts', JSON.stringify(prompts), {
		expirationTtl: 300
	});

	return jsonResponse({
		success: true,
		data: prompts
	}, 200, corsHeaders);
}

function jsonResponse(data: any, status = 200, additionalHeaders: Record<string, string> = {}): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...additionalHeaders
		}
	});
}
