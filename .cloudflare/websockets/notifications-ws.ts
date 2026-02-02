/**
 * Notifications WebSocket - Real-time push notifications
 * Event streaming, alerts, system updates
 */

interface Env {
	NOTIFICATIONS: DurableObjectNamespace;
	CACHE: KVNamespace;
	DB: D1Database;
}

interface Notification {
	id: string;
	type: string;
	title: string;
	message: string;
	priority: 'low' | 'medium' | 'high' | 'urgent';
	data?: Record<string, any>;
	timestamp: number;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (request.headers.get('Upgrade') === 'websocket') {
			return handleWebSocket(request, env);
		}

		// HTTP API dla wysyłania notyfikacji
		if (url.pathname === '/notifications/send' && request.method === 'POST') {
			return sendNotification(request, env);
		}

		if (url.pathname === '/notifications/broadcast' && request.method === 'POST') {
			return broadcastNotification(request, env);
		}

		if (url.pathname === '/notifications/history') {
			return getNotificationHistory(request, env);
		}

		return new Response('Notifications WebSocket endpoint', { status: 400 });
	}
};

async function handleWebSocket(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const userId = url.searchParams.get('user');

	if (!userId) {
		return new Response('User ID required', { status: 400 });
	}

	const id = env.NOTIFICATIONS.idFromName(userId);
	const notifier = env.NOTIFICATIONS.get(id);

	return notifier.fetch(request);
}

async function sendNotification(request: Request, env: Env): Promise<Response> {
	const body = await request.json() as { userId: string; notification: Notification };

	if (!body.userId || !body.notification) {
		return new Response(JSON.stringify({
			success: false,
			error: 'Missing userId or notification'
		}), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Get user's notification object
	const id = env.NOTIFICATIONS.idFromName(body.userId);
	const notifier = env.NOTIFICATIONS.get(id);

	// Send notification
	await notifier.fetch(new Request('http://internal/send', {
		method: 'POST',
		body: JSON.stringify(body.notification)
	}));

	// Store in DB
	await env.DB.prepare(
		'INSERT INTO notifications (id, user_id, type, title, message, priority, data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
	).bind(
		body.notification.id || crypto.randomUUID(),
		body.userId,
		body.notification.type,
		body.notification.title,
		body.notification.message,
		body.notification.priority,
		JSON.stringify(body.notification.data || {}),
		new Date().toISOString()
	).run();

	return new Response(JSON.stringify({
		success: true,
		data: { sent: true }
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
}

async function broadcastNotification(request: Request, env: Env): Promise<Response> {
	const body = await request.json() as { notification: Notification; userIds?: string[] };

	if (!body.notification) {
		return new Response(JSON.stringify({
			success: false,
			error: 'Missing notification'
		}), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	// Get user IDs (all or specific)
	let userIds = body.userIds;
	if (!userIds) {
		const result = await env.DB.prepare(
			'SELECT DISTINCT user_id FROM users WHERE active = 1'
		).all();
		userIds = result.results.map(r => r.user_id as string);
	}

	// Send to all users
	const promises = userIds.map(userId => {
		const id = env.NOTIFICATIONS.idFromName(userId);
		const notifier = env.NOTIFICATIONS.get(id);
		return notifier.fetch(new Request('http://internal/send', {
			method: 'POST',
			body: JSON.stringify(body.notification)
		}));
	});

	await Promise.all(promises);

	return new Response(JSON.stringify({
		success: true,
		data: { recipients: userIds.length }
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
}

async function getNotificationHistory(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const userId = url.searchParams.get('user');
	const limit = parseInt(url.searchParams.get('limit') || '50');

	if (!userId) {
		return new Response(JSON.stringify({
			success: false,
			error: 'User ID required'
		}), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const result = await env.DB.prepare(
		'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?'
	).bind(userId, limit).all();

	return new Response(JSON.stringify({
		success: true,
		data: result.results
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
}

export class NotificationManager implements DurableObject {
	private state: DurableObjectState;
	private env: Env;
	private connections: Set<WebSocket>;
	private userId: string;
	private queue: Notification[];

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.connections = new Set();
		this.userId = state.id.toString();
		this.queue = [];

		this.state.blockConcurrencyWhile(async () => {
			const stored = await this.state.storage.get<Notification[]>('queue');
			if (stored) {
				this.queue = stored;
			}
		});
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);

		// Internal notification send
		if (url.pathname === '/send') {
			const notification = await request.json() as Notification;
			await this.sendNotification(notification);
			return new Response('OK');
		}

		// WebSocket connection
		if (request.headers.get('Upgrade') === 'websocket') {
			const pair = new WebSocketPair();
			const [client, server] = Object.values(pair);

			this.handleConnection(server);

			return new Response(null, {
				status: 101,
				webSocket: client
			});
		}

		return new Response('Not found', { status: 404 });
	}

	async handleConnection(ws: WebSocket) {
		ws.accept();
		this.connections.add(ws);

		// Send queued notifications
		for (const notification of this.queue) {
			ws.send(JSON.stringify(notification));
		}
		this.queue = [];
		await this.state.storage.put('queue', this.queue);

		// Send connection confirmation
		ws.send(JSON.stringify({
			type: 'connected',
			userId: this.userId,
			timestamp: Date.now()
		}));

		// Heartbeat
		const heartbeat = setInterval(() => {
			try {
				ws.send(JSON.stringify({
					type: 'ping',
					timestamp: Date.now()
				}));
			} catch (error) {
				clearInterval(heartbeat);
			}
		}, 30000); // 30s

		ws.addEventListener('message', (event) => {
			try {
				const message = JSON.parse(event.data as string);
				if (message.type === 'pong') {
					// Client is alive
				}
			} catch (error) {
				// Ignore invalid messages
			}
		});

		ws.addEventListener('close', () => {
			clearInterval(heartbeat);
			this.connections.delete(ws);
		});
	}

	async sendNotification(notification: Notification) {
		notification.id = notification.id || crypto.randomUUID();
		notification.timestamp = notification.timestamp || Date.now();

		const payload = JSON.stringify(notification);
		let sent = false;

		// Send to all active connections
		for (const ws of this.connections) {
			try {
				ws.send(payload);
				sent = true;
			} catch (error) {
				this.connections.delete(ws);
			}
		}

		// Queue if no active connections
		if (!sent) {
			this.queue.push(notification);
			await this.state.storage.put('queue', this.queue);
		}
	}
}
