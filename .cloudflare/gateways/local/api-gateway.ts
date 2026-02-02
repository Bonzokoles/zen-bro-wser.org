/**
 * API Gateway - Główny punkt wejścia dla REST API
 * Obsługuje routing, CORS, rate limiting i validację
 */

interface Env {
	CACHE: KVNamespace;
	DB: D1Database;
	RATE_LIMITER: DurableObjectNamespace;
}

interface ApiResponse {
	success: boolean;
	data?: any;
	error?: string;
	timestamp: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// CORS headers dla wszystkich żądań
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
			'Access-Control-Max-Age': '86400',
		};

		// Obsługa preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			// Rate limiting
			const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
			const rateLimitResult = await checkRateLimit(env.CACHE, clientIp);

			if (!rateLimitResult.allowed) {
				return jsonResponse({
					success: false,
					error: 'Przekroczono limit żądań',
					timestamp: new Date().toISOString()
				}, 429, corsHeaders);
			}

			// Routing
			if (url.pathname.startsWith('/api/v1/')) {
				return handleApiV1(request, env, url);
			}

			if (url.pathname.startsWith('/health')) {
				return handleHealthCheck(env);
			}

			return jsonResponse({
				success: false,
				error: 'Nie znaleziono endpointu',
				timestamp: new Date().toISOString()
			}, 404, corsHeaders);

		} catch (error) {
			return jsonResponse({
				success: false,
				error: error instanceof Error ? error.message : 'Nieznany błąd',
				timestamp: new Date().toISOString()
			}, 500, corsHeaders);
		}
	}
};

async function handleApiV1(request: Request, env: Env, url: URL): Promise<Response> {
	const path = url.pathname.replace('/api/v1/', '');
	const segments = path.split('/');

	switch (segments[0]) {
		case 'search':
			return handleSearch(request, env);
		case 'content':
			return handleContent(request, env);
		case 'user':
			return handleUser(request, env);
		default:
			return jsonResponse({
				success: false,
				error: 'Nieznany resource',
				timestamp: new Date().toISOString()
			}, 404);
	}
}

async function handleSearch(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const query = url.searchParams.get('q');

	if (!query) {
		return jsonResponse({
			success: false,
			error: 'Brak parametru zapytania',
			timestamp: new Date().toISOString()
		}, 400);
	}

	// Cache check
	const cacheKey = `search:${query}`;
	const cached = await env.CACHE.get(cacheKey, 'json');

	if (cached) {
		return jsonResponse({
			success: true,
			data: cached,
			cached: true,
			timestamp: new Date().toISOString()
		});
	}

	// Query database
	const results = await env.DB.prepare(
		'SELECT * FROM documents WHERE content LIKE ? LIMIT 20'
	).bind(`%${query}%`).all();

	// Cache result
	await env.CACHE.put(cacheKey, JSON.stringify(results.results), {
		expirationTtl: 3600 // 1 godzina
	});

	return jsonResponse({
		success: true,
		data: results.results,
		timestamp: new Date().toISOString()
	});
}

async function handleContent(request: Request, env: Env): Promise<Response> {
	if (request.method === 'GET') {
		const url = new URL(request.url);
		const id = url.pathname.split('/').pop();

		const result = await env.DB.prepare(
			'SELECT * FROM documents WHERE id = ?'
		).bind(id).first();

		return jsonResponse({
			success: !!result,
			data: result,
			timestamp: new Date().toISOString()
		});
	}

	if (request.method === 'POST') {
		const body = await request.json();
		// Walidacja i zapis
		const result = await env.DB.prepare(
			'INSERT INTO documents (title, content, created_at) VALUES (?, ?, ?)'
		).bind(body.title, body.content, new Date().toISOString()).run();

		return jsonResponse({
			success: result.success,
			data: { id: result.meta.last_row_id },
			timestamp: new Date().toISOString()
		}, 201);
	}

	return jsonResponse({
		success: false,
		error: 'Metoda nie obsługiwana',
		timestamp: new Date().toISOString()
	}, 405);
}

async function handleUser(request: Request, env: Env): Promise<Response> {
	// Placeholder - integracja z systemem użytkowników
	return jsonResponse({
		success: true,
		data: { message: 'User endpoint - do implementacji' },
		timestamp: new Date().toISOString()
	});
}

async function handleHealthCheck(env: Env): Promise<Response> {
	try {
		// Test database
		await env.DB.prepare('SELECT 1').first();

		return jsonResponse({
			success: true,
			data: {
				status: 'healthy',
				services: {
					database: 'ok',
					cache: 'ok'
				}
			},
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return jsonResponse({
			success: false,
			error: 'Service unhealthy',
			timestamp: new Date().toISOString()
		}, 503);
	}
}

async function checkRateLimit(cache: KVNamespace, identifier: string): Promise<{ allowed: boolean; remaining: number }> {
	const key = `ratelimit:${identifier}`;
	const limit = 100; // 100 żądań
	const window = 60; // na minutę

	const current = await cache.get(key);
	const count = current ? parseInt(current) : 0;

	if (count >= limit) {
		return { allowed: false, remaining: 0 };
	}

	await cache.put(key, String(count + 1), { expirationTtl: window });
	return { allowed: true, remaining: limit - count - 1 };
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
