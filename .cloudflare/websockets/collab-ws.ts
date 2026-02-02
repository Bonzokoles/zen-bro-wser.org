/**
 * Collaboration WebSocket - Real-time collaborative editing
 * Operational Transform, document sync, cursor positions
 */

interface Env {
	COLLAB_DOCS: DurableObjectNamespace;
	CACHE: KVNamespace;
	DB: D1Database;
}

interface Operation {
	type: 'insert' | 'delete' | 'replace';
	position: number;
	content?: string;
	length?: number;
	userId: string;
	timestamp: number;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (request.headers.get('Upgrade') === 'websocket') {
			return handleWebSocket(request, env);
		}

		if (url.pathname === '/collab/documents') {
			return listDocuments(env);
		}

		if (url.pathname.startsWith('/collab/document/')) {
			const docId = url.pathname.split('/').pop();
			return getDocument(docId!, env);
		}

		return new Response('Collaboration WebSocket endpoint', { status: 400 });
	}
};

async function handleWebSocket(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const docId = url.searchParams.get('doc');
	const userId = url.searchParams.get('user') || crypto.randomUUID();

	if (!docId) {
		return new Response('Document ID required', { status: 400 });
	}

	const id = env.COLLAB_DOCS.idFromName(docId);
	const doc = env.COLLAB_DOCS.get(id);

	return doc.fetch(request);
}

async function listDocuments(env: Env): Promise<Response> {
	const docs = await env.DB.prepare(
		'SELECT id, title, created_at, updated_at FROM collab_documents ORDER BY updated_at DESC LIMIT 50'
	).all();

	return new Response(JSON.stringify({
		success: true,
		data: docs.results
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
}

async function getDocument(docId: string, env: Env): Promise<Response> {
	const doc = await env.DB.prepare(
		'SELECT * FROM collab_documents WHERE id = ?'
	).bind(docId).first();

	if (!doc) {
		return new Response(JSON.stringify({
			success: false,
			error: 'Document not found'
		}), {
			status: 404,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	return new Response(JSON.stringify({
		success: true,
		data: doc
	}), {
		headers: { 'Content-Type': 'application/json' }
	});
}

export class CollabDocument implements DurableObject {
	private state: DurableObjectState;
	private env: Env;
	private sessions: Map<string, { ws: WebSocket; userId: string; userName: string; cursor?: number }>;
	private content: string;
	private operations: Operation[];

	constructor(state: DurableObjectState, env: Env) {
		this.state = state;
		this.env = env;
		this.sessions = new Map();
		this.content = '';
		this.operations = [];

		this.state.blockConcurrencyWhile(async () => {
			const stored = await this.state.storage.get<{ content: string; operations: Operation[] }>('document');
			if (stored) {
				this.content = stored.content;
				this.operations = stored.operations || [];
			}
		});
	}

	async fetch(request: Request): Promise<Response> {
		const url = new URL(request.url);
		const userId = url.searchParams.get('user') || crypto.randomUUID();
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

		const sessionId = crypto.randomUUID();
		this.sessions.set(sessionId, { ws, userId, userName });

		// Send initial state
		ws.send(JSON.stringify({
			type: 'init',
			content: this.content,
			users: Array.from(this.sessions.values()).map(s => ({
				id: s.userId,
				name: s.userName,
				cursor: s.cursor
			})),
			timestamp: Date.now()
		}));

		// Broadcast user joined
		this.broadcast({
			type: 'user_joined',
			user: { id: userId, name: userName },
			timestamp: Date.now()
		}, sessionId);

		ws.addEventListener('message', async (event) => {
			try {
				const message = JSON.parse(event.data as string);
				await this.handleMessage(sessionId, userId, message);
			} catch (error) {
				ws.send(JSON.stringify({
					type: 'error',
					error: 'Invalid message',
					timestamp: Date.now()
				}));
			}
		});

		ws.addEventListener('close', () => {
			this.sessions.delete(sessionId);
			this.broadcast({
				type: 'user_left',
				user: { id: userId, name: userName },
				timestamp: Date.now()
			});
		});
	}

	async handleMessage(sessionId: string, userId: string, message: any) {
		switch (message.type) {
			case 'operation':
				await this.applyOperation(sessionId, userId, message.operation);
				break;

			case 'cursor':
				this.updateCursor(sessionId, message.position);
				break;

			case 'selection':
				this.updateSelection(sessionId, message.start, message.end);
				break;
		}
	}

	async applyOperation(sessionId: string, userId: string, op: Operation) {
		op.userId = userId;
		op.timestamp = Date.now();

		// Apply operation to content
		switch (op.type) {
			case 'insert':
				this.content =
					this.content.slice(0, op.position) +
					(op.content || '') +
					this.content.slice(op.position);
				break;

			case 'delete':
				this.content =
					this.content.slice(0, op.position) +
					this.content.slice(op.position + (op.length || 0));
				break;

			case 'replace':
				this.content =
					this.content.slice(0, op.position) +
					(op.content || '') +
					this.content.slice(op.position + (op.length || 0));
				break;
		}

		// Store operation
		this.operations.push(op);

		// Persist state
		await this.state.storage.put('document', {
			content: this.content,
			operations: this.operations.slice(-1000) // Keep last 1000 ops
		});

		// Persist to D1
		await this.env.DB.prepare(
			'UPDATE collab_documents SET content = ?, updated_at = ? WHERE id = ?'
		).bind(this.content, new Date().toISOString(), this.state.id.toString()).run();

		// Broadcast to others
		this.broadcast({
			type: 'operation',
			operation: op,
			timestamp: op.timestamp
		}, sessionId);
	}

	updateCursor(sessionId: string, position: number) {
		const session = this.sessions.get(sessionId);
		if (session) {
			session.cursor = position;

			this.broadcast({
				type: 'cursor',
				userId: session.userId,
				position,
				timestamp: Date.now()
			}, sessionId);
		}
	}

	updateSelection(sessionId: string, start: number, end: number) {
		const session = this.sessions.get(sessionId);
		if (session) {
			this.broadcast({
				type: 'selection',
				userId: session.userId,
				start,
				end,
				timestamp: Date.now()
			}, sessionId);
		}
	}

	broadcast(message: any, excludeSessionId?: string) {
		const payload = JSON.stringify(message);

		for (const [sid, session] of this.sessions) {
			if (sid !== excludeSessionId) {
				try {
					session.ws.send(payload);
				} catch (error) {
					this.sessions.delete(sid);
				}
			}
		}
	}
}
