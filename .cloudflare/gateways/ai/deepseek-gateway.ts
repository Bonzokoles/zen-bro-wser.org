/**
 * DeepSeek AI Gateway - Integracja z DeepSeek R1 via OpenRouter
 * Chat completion, reasoning, streaming responses
 */

interface Env {
	OPENROUTER_API_KEY: string;
	DEEPSEEK_API_KEY: string;
	CACHE: KVNamespace;
}

interface ChatMessage {
	role: 'system' | 'user' | 'assistant';
	content: string;
}

interface ChatRequest {
	messages: ChatMessage[];
	model?: string;
	temperature?: number;
	max_tokens?: number;
	stream?: boolean;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			if (url.pathname === '/ai/chat') {
				return handleChat(request, env, ctx, corsHeaders);
			}

			if (url.pathname === '/ai/reasoning') {
				return handleReasoning(request, env, ctx, corsHeaders);
			}

			if (url.pathname === '/ai/embeddings') {
				return handleEmbeddings(request, env, corsHeaders);
			}

			return jsonResponse({
				success: false,
				error: 'Nieznany endpoint'
			}, 404, corsHeaders);

		} catch (error) {
			return jsonResponse({
				success: false,
				error: error instanceof Error ? error.message : 'Błąd serwera'
			}, 500, corsHeaders);
		}
	}
};

async function handleChat(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
	corsHeaders: Record<string, string>
): Promise<Response> {
	const body = await request.json() as ChatRequest;

	if (!body.messages || body.messages.length === 0) {
		return jsonResponse({
			success: false,
			error: 'Brak wiadomości'
		}, 400, corsHeaders);
	}

	// Cache key dla identycznych zapytań
	const cacheKey = `ai:chat:${hashMessages(body.messages)}`;
	const cached = await env.CACHE.get(cacheKey, 'json');

	if (cached && !body.stream) {
		return jsonResponse({
			success: true,
			data: cached,
			cached: true
		}, 200, corsHeaders);
	}

	// Wywołanie OpenRouter API
	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
			'Content-Type': 'application/json',
			'HTTP-Referer': request.url,
			'X-Title': 'Zen Browser AI'
		},
		body: JSON.stringify({
			model: body.model || 'deepseek/deepseek-r1',
			messages: body.messages,
			temperature: body.temperature || 0.7,
			max_tokens: body.max_tokens || 2000,
			stream: body.stream || false
		})
	});

	if (!response.ok) {
		const error = await response.text();
		return jsonResponse({
			success: false,
			error: `OpenRouter API error: ${error}`
		}, response.status, corsHeaders);
	}

	// Streaming response
	if (body.stream) {
		return new Response(response.body, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				'Connection': 'keep-alive',
				...corsHeaders
			}
		});
	}

	// Non-streaming
	const data = await response.json();

	// Cache result
	ctx.waitUntil(
		env.CACHE.put(cacheKey, JSON.stringify(data), {
			expirationTtl: 3600 // 1h cache
		})
	);

	return jsonResponse({
		success: true,
		data
	}, 200, corsHeaders);
}

async function handleReasoning(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
	corsHeaders: Record<string, string>
): Promise<Response> {
	const body = await request.json() as { prompt: string; context?: string };

	if (!body.prompt) {
		return jsonResponse({
			success: false,
			error: 'Brak promptu'
		}, 400, corsHeaders);
	}

	// Używamy DeepSeek R1 dla zaawansowanego rozumowania
	const messages: ChatMessage[] = [
		{
			role: 'system',
			content: 'Jesteś asystentem AI używającym zaawansowanego rozumowania krok po kroku. Pokazuj swój proces myślenia.'
		},
		{
			role: 'user',
			content: body.context
				? `Kontekst: ${body.context}\n\nZapytanie: ${body.prompt}`
				: body.prompt
		}
	];

	const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			model: 'deepseek/deepseek-r1',
			messages,
			temperature: 0.3, // Niższa temperatura dla bardziej precyzyjnego rozumowania
			max_tokens: 4000
		})
	});

	if (!response.ok) {
		return jsonResponse({
			success: false,
			error: 'Błąd API DeepSeek'
		}, response.status, corsHeaders);
	}

	const data = await response.json();

	return jsonResponse({
		success: true,
		data: {
			reasoning: data.choices[0].message.content,
			usage: data.usage
		}
	}, 200, corsHeaders);
}

async function handleEmbeddings(
	request: Request,
	env: Env,
	corsHeaders: Record<string, string>
): Promise<Response> {
	const body = await request.json() as { text: string | string[] };

	if (!body.text) {
		return jsonResponse({
			success: false,
			error: 'Brak tekstu do embedowania'
		}, 400, corsHeaders);
	}

	// OpenRouter nie obsługuje embeddings - używamy fallback
	// W produkcji: integracja z OpenAI, Cohere lub local model
	return jsonResponse({
		success: false,
		error: 'Embeddings endpoint - do implementacji z OpenAI/Cohere'
	}, 501, corsHeaders);
}

function hashMessages(messages: ChatMessage[]): string {
	const str = JSON.stringify(messages);
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash;
	}
	return hash.toString(36);
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
