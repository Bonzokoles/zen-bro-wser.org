/**
 * Metrics Gateway - Zbieranie metryk, analytics, monitoring
 * Real-time metrics, logging, performance tracking
 */

interface Env {
	METRICS: AnalyticsEngineDataset;
	CACHE: KVNamespace;
	DB: D1Database;
}

interface MetricEvent {
	timestamp: number;
	type: string;
	data: Record<string, any>;
	user?: string;
	session?: string;
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
			// Routing
			if (url.pathname === '/metrics/track') {
				return handleTrack(request, env, ctx, corsHeaders);
			}

			if (url.pathname === '/metrics/query') {
				return handleQuery(request, env, corsHeaders);
			}

			if (url.pathname === '/metrics/dashboard') {
				return handleDashboard(request, env, corsHeaders);
			}

			if (url.pathname === '/metrics/export') {
				return handleExport(request, env, corsHeaders);
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

async function handleTrack(
	request: Request,
	env: Env,
	ctx: ExecutionContext,
	corsHeaders: Record<string, string>
): Promise<Response> {
	const body = await request.json() as MetricEvent;

	if (!body.type || !body.data) {
		return jsonResponse({
			success: false,
			error: 'Brak wymaganych pól'
		}, 400, corsHeaders);
	}

	// Wzbogacenie metryk o dane requestu
	const enrichedData = {
		...body.data,
		ip: request.headers.get('CF-Connecting-IP'),
		country: request.cf?.country,
		userAgent: request.headers.get('User-Agent'),
		referer: request.headers.get('Referer'),
	};

	// Zapis do Analytics Engine
	if (env.METRICS) {
		env.METRICS.writeDataPoint({
			blobs: [
				body.type,
				body.user || 'anonymous',
				body.session || generateSessionId()
			],
			doubles: [
				body.timestamp || Date.now(),
			],
			indexes: [body.type]
		});
	}

	// Async zapis do D1 dla długoterminowej retencji
	ctx.waitUntil(
		env.DB.prepare(
			'INSERT INTO metrics (type, data, user_id, session_id, created_at) VALUES (?, ?, ?, ?, ?)'
		).bind(
			body.type,
			JSON.stringify(enrichedData),
			body.user || null,
			body.session || null,
			new Date().toISOString()
		).run()
	);

	// Agregacja w czasie rzeczywistym (KV)
	await updateAggregates(env.CACHE, body.type, enrichedData);

	return jsonResponse({
		success: true,
		data: { tracked: true }
	}, 200, corsHeaders);
}

async function handleQuery(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const url = new URL(request.url);
	const metric = url.searchParams.get('metric');
	const from = url.searchParams.get('from');
	const to = url.searchParams.get('to');
	const groupBy = url.searchParams.get('groupBy');

	if (!metric) {
		return jsonResponse({
			success: false,
			error: 'Brak parametru metric'
		}, 400, corsHeaders);
	}

	// Query z D1
	let query = 'SELECT * FROM metrics WHERE type = ?';
	const params = [metric];

	if (from) {
		query += ' AND created_at >= ?';
		params.push(from);
	}

	if (to) {
		query += ' AND created_at <= ?';
		params.push(to);
	}

	query += ' ORDER BY created_at DESC LIMIT 1000';

	const result = await env.DB.prepare(query).bind(...params).all();

	// Grupowanie jeśli wymagane
	let data = result.results;
	if (groupBy && groupBy !== 'none') {
		data = groupResults(result.results, groupBy);
	}

	return jsonResponse({
		success: true,
		data: {
			metric,
			count: result.results.length,
			results: data
		}
	}, 200, corsHeaders);
}

async function handleDashboard(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	// Pobieranie kluczowych metryk z cache
	const [
		pageviews,
		uniqueVisitors,
		avgDuration,
		topPages
	] = await Promise.all([
		env.CACHE.get('metrics:pageviews:today', 'json'),
		env.CACHE.get('metrics:unique:today', 'json'),
		env.CACHE.get('metrics:duration:avg', 'json'),
		env.CACHE.get('metrics:pages:top', 'json')
	]);

	// Real-time stats z ostatniej godziny
	const recentStats = await env.DB.prepare(
		`SELECT
			COUNT(*) as total,
			COUNT(DISTINCT session_id) as sessions,
			AVG(CAST(json_extract(data, '$.duration') AS INTEGER)) as avg_duration
		FROM metrics
		WHERE created_at >= datetime('now', '-1 hour')`
	).first();

	return jsonResponse({
		success: true,
		data: {
			today: {
				pageviews: pageviews || 0,
				uniqueVisitors: uniqueVisitors || 0,
				avgDuration: avgDuration || 0
			},
			lastHour: recentStats,
			topPages: topPages || []
		}
	}, 200, corsHeaders);
}

async function handleExport(request: Request, env: Env, corsHeaders: Record<string, string>): Promise<Response> {
	const url = new URL(request.url);
	const format = url.searchParams.get('format') || 'json';
	const from = url.searchParams.get('from') || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
	const to = url.searchParams.get('to') || new Date().toISOString();

	const result = await env.DB.prepare(
		'SELECT * FROM metrics WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC'
	).bind(from, to).all();

	if (format === 'csv') {
		const csv = convertToCSV(result.results);
		return new Response(csv, {
			headers: {
				'Content-Type': 'text/csv',
				'Content-Disposition': `attachment; filename="metrics-${from}-${to}.csv"`,
				...corsHeaders
			}
		});
	}

	return jsonResponse({
		success: true,
		data: {
			count: result.results.length,
			from,
			to,
			metrics: result.results
		}
	}, 200, corsHeaders);
}

async function updateAggregates(cache: KVNamespace, type: string, data: Record<string, any>): Promise<void> {
	const today = new Date().toISOString().split('T')[0];

	// Pageviews
	if (type === 'pageview') {
		const key = `metrics:pageviews:${today}`;
		const current = await cache.get(key);
		const count = current ? parseInt(current) : 0;
		await cache.put(key, String(count + 1), { expirationTtl: 86400 * 2 });
	}

	// Unique visitors (session-based)
	if (type === 'pageview' && data.session) {
		const key = `metrics:unique:${today}`;
		const sessions = await cache.get(key, 'json') || [];
		if (!sessions.includes(data.session)) {
			sessions.push(data.session);
			await cache.put(key, JSON.stringify(sessions), { expirationTtl: 86400 * 2 });
		}
	}

	// Top pages
	if (type === 'pageview' && data.path) {
		const key = 'metrics:pages:top';
		const pages = await cache.get(key, 'json') || {};
		pages[data.path] = (pages[data.path] || 0) + 1;
		await cache.put(key, JSON.stringify(pages), { expirationTtl: 86400 });
	}
}

function groupResults(results: any[], groupBy: string): any[] {
	const grouped: Record<string, any[]> = {};

	results.forEach(result => {
		const key = result[groupBy] || 'unknown';
		if (!grouped[key]) {
			grouped[key] = [];
		}
		grouped[key].push(result);
	});

	return Object.entries(grouped).map(([key, values]) => ({
		group: key,
		count: values.length,
		items: values
	}));
}

function convertToCSV(data: any[]): string {
	if (data.length === 0) return '';

	const headers = Object.keys(data[0]);
	const rows = data.map(row =>
		headers.map(header => {
			const value = row[header];
			return typeof value === 'string' && value.includes(',')
				? `"${value}"`
				: value;
		}).join(',')
	);

	return [headers.join(','), ...rows].join('\n');
}

function generateSessionId(): string {
	return crypto.randomUUID();
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
