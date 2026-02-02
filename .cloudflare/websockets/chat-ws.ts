/**
 * Chat WebSocket - Real-time chat z AI i użytkownikami
 * Persistent connections, message routing, presence
 */

interface Env {
	CHAT_ROOMS: DurableObjectNamespace;
	CACHE: KVNamespace;
	DB: D1Database;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// WebSocket upgrade
		if (request.headers.get('Upgrade') === 'websocket') {
			return handleWebSocket(request, env);
		}

		// HTTP endpoints dla zarządzania
		if (url.pathname === '/ws/rooms') {
			return listRooms(env);
		}

		if (url.pathname === '/ws/stats') {
			return getRoomStats(env);
		}

		return new Response('WebSocket endpoint - wymagane połączenie WS', { status: 400 });
	}
};

async function handleWebSocket(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const roomId = url.searchParams.get('room') || 'default';
	const userId = url.searchParams.get('user') || generateUserId();

	// Get Durable Object for room
	const id = env.CHAT_ROOMS.idFromName(roomId);
	const room = env.CHAT_ROOMS.get(id);

	// Forward WebSocket to Durable Object
	return room.fetch(request);
}

async function listRooms(env: Env): Promise<Response> {
	const rooms = await env.CACHE.get('ws:rooms:list', 'json') || [];

	return new Response(JSON.stringify({
		success: true,
		data: rooms
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
}

async function getRoomStats(env: Env): Promise<Response> {
	const stats = await env.DB.prepare(
		`SELECT
			COUNT(DISTINCT room_id) as total_rooms,
			COUNT(*) as total_messages,
			COUNT(DISTINCT user_id) as total_users
		FROM chat_messages
		WHERE created_at > datetime('now', '-24 hours')`
	).first();

	return new Response(JSON.stringify({
		success: true,
		data: stats
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
}

function generateUserId(): string {
	return crypto.randomUUID();
}

// Durable Object for Chat Room
export class ChatRoom implements DurableObject {
	private state: DurableObjectState;
	private env: Env;
	private sessions: Map<string, WebSocket>;
	private users: Map<string, { id: string; name: string; joinedAt: number }>;

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.sessions = new Map();
		this.users = new Map();

		// Restore state
		this.state.blockConcurrencyWhile(async () => {
			const stored = await this.state.storage.get('users');
			if (stored) {
				this.users = new Map(Object.entries(stored as any));
			}
		});
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const userId = url.searchParams.get('user') || generateUserId();
		const userName = url.searchParams.get('name') || `User ${userId.slice(0, 8)}`;

		if (request.headers.get('Upgrade') !== 'websocket') {
			return new Response('WebSocket required', { status: 426 });
		}

		const pair = new WebSocketPair();
		const [client, server] = Object.values(pair);

		this.handleSession(server, userId, userName);

		return new Response(null, {
			status: 101,
			webSocket: client
		});
	}

	async handleSession(ws: WebSocket, userId: string, userName: string) {
		ws.accept();

		this.sessions.set(userId, ws);
		this.users.set(userId, {
			id: userId,
			name: userName,
			joinedAt: Date.now()
		});

		// Persist users
		await this.state.storage.put('users', Object.fromEntries(this.users));

		// Broadcast join
		this.broadcast({
			type: 'user_joined',
			user: { id: userId, name: userName },
			timestamp: Date.now()
		}, userId);

		// Send current users list
		ws.send(JSON.stringify({
			type: 'user_list',
			users: Array.from(this.users.values()),
			timestamp: Date.now()
		}));

		// Handle messages
		ws.addEventListener('message', async (event) => {
			try {
				const message = JSON.parse(event.data as string);
				await this.handleMessage(userId, userName, message);
			} catch (error) {
				ws.send(JSON.stringify({
					type: 'error',
					error: 'Invalid message format',
					timestamp: Date.now()
				}));
			}
		});

		// Handle close
		ws.addEventListener('close', async () => {
			this.sessions.delete(userId);
			this.users.delete(userId);
			await this.state.storage.put('users', Object.fromEntries(this.users));

			this.broadcast({
				type: 'user_left',
				user: { id: userId, name: userName },
				timestamp: Date.now()
			});
		});
	}

	async handleMessage(userId: string, userName: string, message: any) {
		const timestamp = Date.now();

		// Store message in D1
		await this.env.DB.prepare(
			'INSERT INTO chat_messages (room_id, user_id, user_name, content, created_at) VALUES (?, ?, ?, ?, ?)'
		).bind(
			this.state.id.toString(),
			userId,
			userName,
			message.content,
			new Date(timestamp).toISOString()
		).run();

		// Broadcast to all users
		this.broadcast({
			type: 'message',
			user: { id: userId, name: userName },
			content: message.content,
			timestamp
		});
	}

	broadcast(message: any, excludeUserId?: string) {
		const payload = JSON.stringify(message);

		for (const [userId, ws] of this.sessions) {
			if (userId !== excludeUserId) {
				try {
					ws.send(payload);
				} catch (error) {
					// Session closed, remove it
					this.sessions.delete(userId);
				}
			}
		}
	}
}
