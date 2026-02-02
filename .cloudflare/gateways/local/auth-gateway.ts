/**
 * Auth Gateway - Zarządzanie autentykacją i autoryzacją
 * JWT tokens, session management, OAuth2
 */

interface Env {
	CACHE: KVNamespace;
	DB: D1Database;
	JWT_SECRET: string;
	SESSIONS: DurableObjectNamespace;
}

interface JWTPayload {
	sub: string; // user ID
	email: string;
	role: string;
	iat: number;
	exp: number;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Allow-Credentials': 'true',
		};

		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		try {
			// Routing
			if (url.pathname === '/auth/login') {
				return handleLogin(request, env, corsHeaders);
			}

			if (url.pathname === '/auth/register') {
				return handleRegister(request, env, corsHeaders);
			}

			if (url.pathname === '/auth/verify') {
				return handleVerify(request, env, corsHeaders);
			}

			if (url.pathname === '/auth/refresh') {
				return handleRefresh(request, env, corsHeaders);
			}

			if (url.pathname === '/auth/logout') {
				return handleLogout(request, env, corsHeaders);
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

async function handleLogin(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const body = await request.json() as { email: string; password: string };

	if (!body.email || !body.password) {
		return jsonResponse({
			success: false,
			error: 'Brak wymaganych pól'
		}, 400, corsHeaders);
	}

	// Pobranie użytkownika z bazy
	const user = await env.DB.prepare(
		'SELECT id, email, password_hash, role FROM users WHERE email = ?'
	).bind(body.email).first();

	if (!user) {
		return jsonResponse({
			success: false,
			error: 'Nieprawidłowe dane logowania'
		}, 401, corsHeaders);
	}

	// Weryfikacja hasła (w produkcji użyj bcrypt/argon2)
	const passwordValid = await verifyPassword(body.password, user.password_hash as string);

	if (!passwordValid) {
		return jsonResponse({
			success: false,
			error: 'Nieprawidłowe dane logowania'
		}, 401, corsHeaders);
	}

	// Generowanie JWT
	const token = await generateJWT({
		sub: user.id as string,
		email: user.email as string,
		role: user.role as string,
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
	}, env.JWT_SECRET);

	// Generowanie refresh token
	const refreshToken = crypto.randomUUID();
	await env.CACHE.put(
		`refresh:${refreshToken}`,
		user.id as string,
		{ expirationTtl: 30 * 24 * 60 * 60 } // 30 dni
	);

	return jsonResponse({
		success: true,
		data: {
			token,
			refreshToken,
			user: {
				id: user.id,
				email: user.email,
				role: user.role
			}
		}
	}, 200, corsHeaders);
}

async function handleRegister(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const body = await request.json() as { email: string; password: string; name: string };

	if (!body.email || !body.password || !body.name) {
		return jsonResponse({
			success: false,
			error: 'Brak wymaganych pól'
		}, 400, corsHeaders);
	}

	// Sprawdzenie czy email już istnieje
	const existing = await env.DB.prepare(
		'SELECT id FROM users WHERE email = ?'
	).bind(body.email).first();

	if (existing) {
		return jsonResponse({
			success: false,
			error: 'Email już zarejestrowany'
		}, 409, corsHeaders);
	}

	// Hash hasła (w produkcji użyj bcrypt/argon2)
	const passwordHash = await hashPassword(body.password);

	// Utworzenie użytkownika
	const result = await env.DB.prepare(
		'INSERT INTO users (email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?)'
	).bind(body.email, passwordHash, body.name, 'user', new Date().toISOString()).run();

	return jsonResponse({
		success: true,
		data: {
			id: result.meta.last_row_id,
			message: 'Konto utworzone pomyślnie'
		}
	}, 201, corsHeaders);
}

async function handleVerify(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const authHeader = request.headers.get('Authorization');

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return jsonResponse({
			success: false,
			error: 'Brak tokenu autoryzacji'
		}, 401, corsHeaders);
	}

	const token = authHeader.substring(7);

	try {
		const payload = await verifyJWT(token, env.JWT_SECRET);

		return jsonResponse({
			success: true,
			data: {
				valid: true,
				user: {
					id: payload.sub,
					email: payload.email,
					role: payload.role
				}
			}
		}, 200, corsHeaders);
	} catch (error) {
		return jsonResponse({
			success: false,
			error: 'Token nieprawidłowy lub wygasły'
		}, 401, corsHeaders);
	}
}

async function handleRefresh(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const body = await request.json() as { refreshToken: string };

	if (!body.refreshToken) {
		return jsonResponse({
			success: false,
			error: 'Brak refresh token'
		}, 400, corsHeaders);
	}

	const userId = await env.CACHE.get(`refresh:${body.refreshToken}`);

	if (!userId) {
		return jsonResponse({
			success: false,
			error: 'Refresh token nieprawidłowy lub wygasły'
		}, 401, corsHeaders);
	}

	// Pobranie danych użytkownika
	const user = await env.DB.prepare(
		'SELECT id, email, role FROM users WHERE id = ?'
	).bind(userId).first();

	if (!user) {
		return jsonResponse({
			success: false,
			error: 'Użytkownik nie istnieje'
		}, 404, corsHeaders);
	}

	// Nowy access token
	const token = await generateJWT({
		sub: user.id as string,
		email: user.email as string,
		role: user.role as string,
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
	}, env.JWT_SECRET);

	return jsonResponse({
		success: true,
		data: { token }
	}, 200, corsHeaders);
}

async function handleLogout(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const body = await request.json() as { refreshToken: string };

	if (body.refreshToken) {
		await env.CACHE.delete(`refresh:${body.refreshToken}`);
	}

	return jsonResponse({
		success: true,
		data: { message: 'Wylogowano pomyślnie' }
	}, 200, corsHeaders);
}

// Pomocnicze funkcje
async function generateJWT(payload: JWTPayload, secret: string): Promise<string> {
	// Implementacja JWT - w produkcji użyj biblioteki jak @tsndr/cloudflare-worker-jwt
	const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
	const body = btoa(JSON.stringify(payload));
	const signature = await sign(`${header}.${body}`, secret);
	return `${header}.${body}.${signature}`;
}

async function verifyJWT(token: string, secret: string): Promise<JWTPayload> {
	const [header, body, signature] = token.split('.');
	const expectedSignature = await sign(`${header}.${body}`, secret);

	if (signature !== expectedSignature) {
		throw new Error('Invalid signature');
	}

	const payload = JSON.parse(atob(body));

	if (payload.exp < Math.floor(Date.now() / 1000)) {
		throw new Error('Token expired');
	}

	return payload;
}

async function sign(data: string, secret: string): Promise<string> {
	const encoder = new TextEncoder();
	const key = await crypto.subtle.importKey(
		'raw',
		encoder.encode(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
	return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function hashPassword(password: string): Promise<string> {
	// Placeholder - w produkcji użyj bcrypt/argon2
	const encoder = new TextEncoder();
	const data = encoder.encode(password);
	const hash = await crypto.subtle.digest('SHA-256', data);
	return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
	const computed = await hashPassword(password);
	return computed === hash;
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
